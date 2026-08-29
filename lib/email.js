import nodemailer from 'nodemailer';

/**
 * Discord invite links per house.
 * Reads from environment variables with fallback placeholders.
 */
const DISCORD_LINKS = {
  Ashmoor: process.env.DISCORD_ASHMOOR || 'https://discord.gg/ashmoor',
  Ravenscar: process.env.DISCORD_RAVENSCAR || 'https://discord.gg/ravenscar',
  Valemont: process.env.DISCORD_VALEMONT || 'https://discord.gg/valemont',
  Thornvale: process.env.DISCORD_THORNVALE || 'https://discord.gg/thornvale',
};

/**
 * House colors for email styling.
 */
const HOUSE_COLORS = {
  Ashmoor: '#dc2626',
  Ravenscar: '#2563eb',
  Valemont: '#059669',
  Thornvale: '#7c3aed',
};

const HOUSE_MOTTOS = {
  Ashmoor: 'Fortune favors the bold.',
  Ravenscar: 'Knowledge guides creation.',
  Valemont: 'Stand. Build. Endure.',
  Thornvale: 'See what others cannot.',
};

/**
 * Create a Nodemailer transporter from environment variables.
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Generate the HTML email template for a welcome email.
 */
function buildWelcomeEmailHTML(candidate) {
  const house = candidate.house || 'Unknown';
  const color = HOUSE_COLORS[house] || '#d4af37';
  const motto = HOUSE_MOTTOS[house] || '';
  const discordLink = DISCORD_LINKS[house] || '#';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to House ${house}!</title>
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#0e0e0e;border-radius:16px;overflow:hidden;border:1px solid rgba(212,175,55,0.12);">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;background:linear-gradient(135deg, rgba(212,175,55,0.1), rgba(${color === '#dc2626' ? '220,38,38' : color === '#2563eb' ? '37,99,235' : color === '#059669' ? '5,150,105' : '124,58,237'},0.08));">
              <h1 style="color:#f5f0e8;font-size:28px;margin:0 0 8px;font-weight:700;">The Hat Has Spoken!</h1>
              <p style="color:#b0a890;font-size:14px;margin:0;">You've been sorted into...</p>
            </td>
          </tr>

          <!-- House Name -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <h2 style="color:${color};font-size:36px;margin:0 0 8px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">
                House ${house}
              </h2>
              ${motto ? `<p style="color:#b0a890;font-size:14px;margin:0;font-style:italic;">"${motto}"</p>` : ''}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="color:#f5f0e8;font-size:16px;line-height:1.6;margin:0 0 16px;">
                Hey ${candidate.name},
              </p>
              <p style="color:#b0a890;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Congratulations! You've been approved and sorted into <strong style="color:${color};">House ${house}</strong>. 
                Your journey with an incredible community of tech builders starts now.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${discordLink}" 
                       style="display:inline-block;padding:14px 32px;background:${color};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
                      Join House ${house} on Discord →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#6b6352;font-size:13px;line-height:1.5;margin:0;text-align:center;">
                This is your exclusive invite link. See you on the other side!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(212,175,55,0.08);text-align:center;">
              <p style="color:#6b6352;font-size:12px;margin:0;">
                The Sorting Hat — A Tech Community Experience
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send a welcome email to a single candidate.
 *
 * @param {Object} candidate - The candidate document
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendWelcomeEmail(candidate) {
  try {
    const transporter = createTransporter();
    const house = candidate.house || 'Your House';

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'sortinghat@yourevent.com',
      to: candidate.email,
      subject: `Welcome to House ${house}! You've been sorted.`,
      html: buildWelcomeEmailHTML(candidate),
    });

    return { success: true };
  } catch (error) {
    console.error(`Failed to send email to ${candidate.email}:`, error.message);
    return { success: false, error: error.message };
  }
}
