'use server';

import connectDB from '@/lib/db';
import Candidate from '@/lib/models/Candidate';
import { evaluateCandidate } from '@/lib/groq';

/**
 * Server action to handle waitlist form submissions.
 *
 * Flow:
 * 1. Validate the incoming form data
 * 2. Save the candidate to MongoDB with status 'Unsorted'
 * 3. Call the Groq API to evaluate and sort the candidate
 * 4. Update the candidate record with the assigned house and 'Pending Review' status
 * 5. Return the result to the client
 *
 * @param {FormData} formData - The submitted form data
 * @returns {Promise<{ success: boolean, house?: string, reasoning?: string, error?: string }>}
 */
export async function submitCandidate(formData) {
  try {
    // ── 1. Extract and validate form data ──────────────────────────────
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const skillsRaw = formData.get('skills')?.toString().trim();

    // Parse skills: comma-separated string → array of trimmed, non-empty strings
    const skills = skillsRaw
      ? skillsRaw
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    // Collect answers from form fields named answer_q1, answer_q2, etc.
    const answers = {};
    for (let i = 1; i <= 5; i++) {
      const key = `q${i}`;
      const value = formData.get(`answer_${key}`)?.toString().trim();
      if (!value) {
        return {
          success: false,
          error: `Please answer all behavioral questions (question ${i} is missing).`,
        };
      }
      answers[key] = value;
    }

    // Basic validation
    if (!name) {
      return { success: false, error: 'Name is required.' };
    }

    if (!email) {
      return { success: false, error: 'Email is required.' };
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    // ── 2. Connect to MongoDB and save with 'Unsorted' status ──────────
    await connectDB();

    // Check for duplicate email
    const existing = await Candidate.findOne({ email });
    if (existing) {
      return {
        success: false,
        error: 'This email is already on the waitlist.',
      };
    }

    const candidate = await Candidate.create({
      name,
      email,
      skills,
      answers,
      status: 'Unsorted',
    });

    // ── 3. Call Groq API for AI evaluation ──────────────────────────────
    let sortingResult;
    try {
      sortingResult = await evaluateCandidate({
        name,
        skills,
        answers,
      });
    } catch (aiError) {
      // If AI fails, the candidate is still saved as 'Unsorted'
      // The admin can manually sort them later
      console.error('AI sorting failed, candidate saved as Unsorted:', aiError.message);
      return {
        success: true,
        house: null,
        reasoning: 'AI evaluation failed. Candidate saved for manual review.',
        candidateId: candidate._id.toString(),
      };
    }

    // ── 4. Update candidate with AI result ─────────────────────────────
    candidate.house = sortingResult.house;
    candidate.aiReasoning = sortingResult.reasoning;
    candidate.status = 'Pending Review';
    await candidate.save();

    // ── 5. Return success ──────────────────────────────────────────────
    return {
      success: true,
      house: sortingResult.house,
      reasoning: sortingResult.reasoning,
      candidateId: candidate._id.toString(),
    };
  } catch (error) {
    console.error('submitCandidate error:', error);

    // Handle Mongoose duplicate key error specifically
    if (error.code === 11000) {
      return {
        success: false,
        error: 'This email is already on the waitlist.',
      };
    }

    // Handle Mongoose validation errors
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
