/**
 * Email templates for support requests
 */

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { AdminNotificationEmail } from '@/emails/AdminNotificationEmail';
import { UserConfirmationEmail } from '@/emails/UserConfirmationEmail';

// Lazy initialization of Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  // Return client or create a dummy one if no API key
  return resendClient || new Resend('dummy_key_for_build');
}

interface SupportRequestEmailData {
  userEmail: string;
  userName?: string;
  bankName: string;
  urgency?: string;
  notes?: string;
  pdfUrl: string;
  requestId: string;
}

/**
 * Send support notification email to admin
 */
export async function sendSupportNotificationEmail(data: SupportRequestEmailData) {
  const { userEmail, userName, bankName, urgency, notes, pdfUrl, requestId } = data;

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const resend = getResendClient();

    // Render email using React Email component
    const emailHtml = await render(
      AdminNotificationEmail({
        userEmail,
        userName,
        bankName,
        urgency,
        notes,
        pdfUrl,
        requestId,
      })
    );

    await resend.emails.send({
      from: 'UK Bank Statement Converter <support@convert-bankstatement.com>',
      to: 'sharif@taxformed.com',
      subject: `🔔 New Bank Parser Request: ${bankName}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending support notification email:', error);
    return { success: false, error };
  }
}

/**
 * Send confirmation email to user
 */
export async function sendUserConfirmationEmail(data: { email: string; bankName: string; userName?: string }) {
  const { email, bankName, userName } = data;

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping user confirmation email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const resend = getResendClient();

    // Render email using React Email component
    const emailHtml = await render(
      UserConfirmationEmail({
        userName,
        bankName,
      })
    );

    await resend.emails.send({
      from: 'UK Bank Statement Converter <support@convert-bankstatement.com>',
      to: email,
      subject: `Thank you for your bank parser request - ${bankName}`,
      html: emailHtml,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending user confirmation email:', error);
    return { success: false, error };
  }
}
