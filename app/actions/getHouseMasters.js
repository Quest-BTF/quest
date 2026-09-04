'use server';

import connectDB from '@/lib/db';
import HouseMaster from '@/lib/models/HouseMaster';

/**
 * Server action to fetch house master data.
 * Used by the admin dashboard and the house masters page to check availability.
 *
 * @returns {Promise<{ success: boolean, masters?: Object[], takenHouses?: string[], error?: string }>}
 */
export async function getHouseMasters() {
  try {
    await connectDB();

    const masters = await HouseMaster.find({ status: 'Assigned' })
      .sort({ createdAt: -1 })
      .lean();

    // Serialize MongoDB documents for client consumption
    const serialized = masters.map((m) => ({
      _id: m._id.toString(),
      name: m.name,
      motivation: m.motivation,
      answers: m.answers instanceof Map ? Object.fromEntries(m.answers) : m.answers,
      house: m.house,
      aiReasoning: m.aiReasoning,
      status: m.status,
      createdAt: m.createdAt?.toISOString() || null,
    }));

    const takenHouses = serialized
      .filter((m) => m.house)
      .map((m) => m.house);

    return {
      success: true,
      masters: serialized,
      takenHouses,
      availableCount: 4 - takenHouses.length,
    };
  } catch (error) {
    console.error('getHouseMasters error:', error);
    return {
      success: false,
      error: 'Failed to fetch house masters.',
    };
  }
}
