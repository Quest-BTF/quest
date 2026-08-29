'use server';

import connectDB from '@/lib/db';
import Candidate from '@/lib/models/Candidate';

/**
 * Update a candidate's house and/or status.
 *
 * @param {string} candidateId - The MongoDB _id of the candidate
 * @param {Object} updates - Fields to update
 * @param {string} [updates.house] - New house assignment
 * @param {string} [updates.status] - New status
 * @returns {Promise<{ success: boolean, candidate?: Object, error?: string }>}
 */
export async function updateCandidate(candidateId, updates) {
  try {
    if (!candidateId) {
      return { success: false, error: 'Candidate ID is required.' };
    }

    const validHouses = ['Ashmoor', 'Ravenscar', 'Valemont', 'Thornvale'];
    const validStatuses = ['Unsorted', 'Pending Review', 'Approved', 'Eliminated'];

    const updateFields = {};

    if (updates.house !== undefined) {
      if (updates.house !== null && !validHouses.includes(updates.house)) {
        return {
          success: false,
          error: `Invalid house. Must be one of: ${validHouses.join(', ')}`,
        };
      }
      updateFields.house = updates.house;
    }

    if (updates.status !== undefined) {
      if (!validStatuses.includes(updates.status)) {
        return {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        };
      }
      updateFields.status = updates.status;
    }

    if (Object.keys(updateFields).length === 0) {
      return { success: false, error: 'No valid fields to update.' };
    }

    await connectDB();

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).lean();

    if (!candidate) {
      return { success: false, error: 'Candidate not found.' };
    }

    // Serialize
    const serialized = {
      ...candidate,
      _id: candidate._id.toString(),
      answers: candidate.answers instanceof Map
        ? Object.fromEntries(candidate.answers)
        : candidate.answers || {},
      createdAt: candidate.createdAt?.toISOString() || null,
      updatedAt: candidate.updatedAt?.toISOString() || null,
    };

    return { success: true, candidate: serialized };
  } catch (error) {
    console.error('updateCandidate error:', error);
    return { success: false, error: 'Failed to update candidate.' };
  }
}
