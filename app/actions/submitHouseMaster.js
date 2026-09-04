'use server';

import connectDB from '@/lib/db';
import HouseMaster from '@/lib/models/HouseMaster';
import { evaluateHouseMaster } from '@/lib/groq';

/**
 * Server action to handle house master form submissions.
 *
 * Flow:
 * 1. Validate the incoming form data (name, motivation, MCQ answers)
 * 2. Check if all 4 houses are already assigned
 * 3. Get the list of taken houses
 * 4. Call the Groq API to evaluate and assign a house (from available ones only)
 * 5. Save the house master record with retry logic for race conditions
 * 6. Return the result to the client
 *
 * @param {FormData} formData - The submitted form data
 * @returns {Promise<{ success: boolean, house?: string, reasoning?: string, error?: string }>}
 */
export async function submitHouseMaster(formData) {
  try {
    // ── 1. Extract and validate form data ──────────────────────────
    const name = formData.get('name')?.toString().trim();
    const motivation = formData.get('motivation')?.toString().trim();

    if (!name) {
      return { success: false, error: 'Name is required.' };
    }

    if (!motivation) {
      return { success: false, error: 'Please tell us why you want to lead.' };
    }

    if (motivation.length < 20) {
      return {
        success: false,
        error: 'Please provide a more detailed motivation (at least 20 characters).',
      };
    }

    // Collect MCQ answers (q1, q2, q3)
    const validLetters = ['A', 'B', 'C', 'D'];
    const answers = {};
    for (let i = 1; i <= 3; i++) {
      const key = `q${i}`;
      const value = formData.get(`answer_${key}`)?.toString().trim().toUpperCase();
      if (!value || !validLetters.includes(value)) {
        return {
          success: false,
          error: `Please answer all questions (question ${i} is missing or invalid).`,
        };
      }
      answers[key] = value;
    }

    // ── 2. Connect to MongoDB ──────────────────────────────────────
    await connectDB();

    // ── 3. Check house availability ────────────────────────────────
    const assignedMasters = await HouseMaster.find({
      house: { $ne: null },
      status: 'Assigned',
    }).select('house').lean();

    const takenHouses = assignedMasters.map((m) => m.house);

    if (takenHouses.length >= 4) {
      return {
        success: false,
        error: 'All four houses already have masters assigned. The council is complete.',
      };
    }

    // ── 4. Call Groq AI for evaluation ─────────────────────────────
    let sortingResult;
    try {
      sortingResult = await evaluateHouseMaster(
        { name, motivation, answers },
        takenHouses
      );
    } catch (aiError) {
      console.error('AI sorting failed for house master:', aiError.message);
      return {
        success: false,
        error: 'The council could not reach a decision. Please try again.',
      };
    }

    // ── 5. Save to database with retry for race conditions ─────────
    const maxRetries = 2;
    let savedMaster = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        savedMaster = await HouseMaster.create({
          name,
          motivation,
          answers,
          house: sortingResult.house,
          aiReasoning: sortingResult.reasoning,
          status: 'Assigned',
        });
        break; // Success, exit retry loop
      } catch (dbError) {
        // Duplicate key error on the house unique index = race condition
        if (dbError.code === 11000 && attempt < maxRetries) {
          console.warn(
            `Race condition: house "${sortingResult.house}" was taken. Retrying (attempt ${attempt + 1})...`
          );

          // Re-fetch taken houses and re-evaluate
          const updatedMasters = await HouseMaster.find({
            house: { $ne: null },
            status: 'Assigned',
          }).select('house').lean();

          const updatedTakenHouses = updatedMasters.map((m) => m.house);

          if (updatedTakenHouses.length >= 4) {
            return {
              success: false,
              error: 'All four houses have just been filled. The council is complete.',
            };
          }

          try {
            sortingResult = await evaluateHouseMaster(
              { name, motivation, answers },
              updatedTakenHouses
            );
          } catch (retryAiError) {
            console.error('AI retry failed:', retryAiError.message);
            return {
              success: false,
              error: 'The council could not reach a decision. Please try again.',
            };
          }
        } else {
          throw dbError; // Rethrow if not a duplicate key error or max retries exceeded
        }
      }
    }

    if (!savedMaster) {
      return {
        success: false,
        error: 'Failed to save assignment after multiple attempts. Please try again.',
      };
    }

    // ── 6. Return success ──────────────────────────────────────────
    return {
      success: true,
      house: sortingResult.house,
      reasoning: sortingResult.reasoning,
      masterId: savedMaster._id.toString(),
    };
  } catch (error) {
    console.error('submitHouseMaster error:', error);

    if (error.code === 11000) {
      return {
        success: false,
        error: 'That house was just claimed by another master. Please try again.',
      };
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return {
        success: false,
        error: messages.join('. '),
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}
