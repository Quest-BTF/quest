'use server';

import connectDB from '@/lib/db';
import Candidate from '@/lib/models/Candidate';

/**
 * Fetch all candidates with optional filters.
 *
 * @param {Object} filters - Optional filters
 * @param {string} filters.status - Filter by status
 * @param {string} filters.house - Filter by house
 * @param {string} filters.search - Search by name or email
 * @returns {Promise<{ success: boolean, candidates?: Array, error?: string }>}
 */
export async function getCandidates(filters = {}) {
  try {
    await connectDB();

    const query = {};

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.house && filters.house !== 'all') {
      query.house = filters.house;
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const candidates = await Candidate.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Serialize Mongoose documents to plain objects
    // Convert _id to string and Map instances to plain objects
    const serialized = candidates.map((c) => ({
      ...c,
      _id: c._id.toString(),
      answers: c.answers instanceof Map
        ? Object.fromEntries(c.answers)
        : c.answers || {},
      createdAt: c.createdAt?.toISOString() || null,
      updatedAt: c.updatedAt?.toISOString() || null,
    }));

    return { success: true, candidates: serialized };
  } catch (error) {
    console.error('getCandidates error:', error);
    return { success: false, error: 'Failed to fetch candidates.' };
  }
}
