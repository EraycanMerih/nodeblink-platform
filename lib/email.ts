import { Resend } from 'resend';
import { PUBLIC_BASE_URL } from './env';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendPurchaseEmail(params: {
  toEmail: string;
  productTitle: string;
  downloadUrl: string;
  creatorName: string;
  decryptionKey?: string;
}) {
  const { toEmail, productTitle, downloadUrl, creatorName, decryptionKey } = params;
  
  const fromEmail = process.env.SUPPORT_EMAIL || 'support@nodeblink.dev';
  
  const subject = `Your purchase: ${productTitle}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Thank you for your purchase!</h2>
      <p>Hi there,</p>
      <p>Your payment to <strong>${creatorName}</strong> was successful. Here is your access to <strong>${productTitle}</strong>.</p>
      
      <div style="margin: 30px 0;">
        <a href="${downloadUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Access Product
        </a>
      </div>
      
      ${decryptionKey ? `
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin-top: 0;"><strong>Security Key</strong></p>
        <p style="margin-bottom: 0;">If prompted, use this key to decrypt your file:</p>
        <code style="display: block; margin-top: 8px; padding: 8px; background: #e5e7eb; border-radius: 4px; word-break: break-all;">${decryptionKey}</code>
      </div>
      ` : ''}
      
      <p>If you have any questions, please reply to this email.</p>
      <p>Best,<br>The NodeBlink Team</p>
    </div>
  `;

  if (!resend) {
    console.log('====================================');
    console.log('MOCK EMAIL SENT (No RESEND_API_KEY)');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Download: ${downloadUrl}`);
    console.log('====================================');
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: `NodeBlink <${fromEmail}>`,
      to: [toEmail],
      subject,
      html,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('[Email Error]', error);
    return { success: false, error };
  }
}
