'use server';

import connectDB from '@/lib/db';
import Candidate from '@/lib/models/Candidate';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * Batch dispatch welcome emails to all approved candidates
 * who haven't received an email yet.
 *
 * @returns {Promise<{ success: boolean, sent: number, failed: number, total: number, errors: string[] }>}
 */
export async function dispatchEmails() {
  try {
    await connectDB();

    // Find all approved candidates whose email hasn't been sent
    const candidates = await Candidate.find({
      status: 'Approved',
      emailSent: false,
      house: { $ne: null },
    });

    if (candidates.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        total: 0,
        errors: [],
        message: 'No pending emails to dispatch.',
      };
    }

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (const candidate of candidates) {
      const result = await sendWelcomeEmail(candidate);

      if (result.success) {
        // Mark email as sent
        candidate.emailSent = true;
        await candidate.save();
        sent++;
      } else {
        failed++;
        errors.push(`${candidate.email}: ${result.error}`);
      }
    }

    return {
      success: true,
      sent,
      failed,
      total: candidates.length,
      errors,
      message: `Dispatched ${sent}/${candidates.length} emails.${
        failed > 0 ? ` ${failed} failed.` : ''
      }`,
    };
  } catch (error) {
    console.error('dispatchEmails error:', error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
      errors: [error.message],
      message: 'Email dispatch failed.',
    };
  }
}
