/**
 * Email templates for support requests
 */

import { Resend } from 'resend';

// Initialize Resend with API key or empty string (will handle gracefully)
const resend = new Resend(process.env.RESEND_API_KEY || '');

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
    await resend.emails.send({
      from: 'TaxFormed Support <support@taxformed.com>',
      to: 'sharif@taxformed.com',
      subject: `🔔 New Bank Parser Request: ${bankName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .info-row {
                margin: 15px 0;
                padding: 12px;
                background: white;
                border-radius: 6px;
                border-left: 3px solid #667eea;
              }
              .label {
                font-weight: 600;
                color: #4b5563;
                margin-bottom: 4px;
              }
              .value {
                color: #111827;
              }
              .urgent {
                background: #fef2f2;
                border-left-color: #ef4444;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🏦 New Bank Parser Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required</p>
            </div>

            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">
                A user needs support for a bank statement that we don't currently parse.
              </p>

              <div class="info-row ${urgency === 'high' ? 'urgent' : ''}">
                <div class="label">Bank Name</div>
                <div class="value" style="font-size: 18px; font-weight: 600;">${bankName}</div>
              </div>

              <div class="info-row">
                <div class="label">User Email</div>
                <div class="value">${userEmail}</div>
              </div>

              ${userName ? `
              <div class="info-row">
                <div class="label">User Name</div>
                <div class="value">${userName}</div>
              </div>
              ` : ''}

              ${urgency ? `
              <div class="info-row ${urgency === 'high' ? 'urgent' : ''}">
                <div class="label">Urgency</div>
                <div class="value">
                  ${urgency === 'high' ? '🔴 High' : urgency === 'medium' ? '🟡 Medium' : '🟢 Low'}
                </div>
              </div>
              ` : ''}

              ${notes ? `
              <div class="info-row">
                <div class="label">User Notes</div>
                <div class="value">${notes}</div>
              </div>
              ` : ''}

              <div class="info-row">
                <div class="label">Request ID</div>
                <div class="value"><code>${requestId}</code></div>
              </div>

              <div style="margin: 30px 0; text-align: center;">
                <a href="${pdfUrl}" class="button">
                  📄 Download Statement PDF
                </a>
              </div>

              <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <strong>📋 Next Steps:</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Download and analyze the PDF</li>
                  <li>Create parser for ${bankName}</li>
                  <li>Test with sample statement</li>
                  <li>Deploy to production</li>
                  <li>Notify user (they'll get 10 free conversions!)</li>
                </ol>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">
                This is an automated notification from TaxFormed Bank Statement Converter.
              </p>
              <p style="margin: 5px 0 0 0;">
                Request received: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}
              </p>
            </div>
          </body>
        </html>
      `,
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
    await resend.emails.send({
      from: 'TaxFormed Support <support@taxformed.com>',
      to: email,
      subject: `Thank you for your bank parser request - ${bankName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .highlight-box {
                background: #eff6ff;
                border-left: 4px solid #3b82f6;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .gift-box {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 2px solid #f59e0b;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
                text-align: center;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 14px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">✅ Request Received!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">We're on it</p>
            </div>

            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">
                Hi${userName ? ` ${userName}` : ''},
              </p>

              <p>
                Thank you for your request to add support for <strong>${bankName}</strong> bank statements.
                We've received your submission and our team is already on it!
              </p>

              <div class="highlight-box">
                <strong>⏱️ Timeline:</strong> 24-48 hours
                <br>
                <p style="margin: 10px 0 0 0; font-size: 14px;">
                  We'll analyze your statement and build a custom parser.
                  You'll receive an email as soon as ${bankName} support is live.
                </p>
              </div>

              <div class="gift-box">
                <div style="font-size: 32px; margin-bottom: 10px;">🎁</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">
                  Thank You Gift
                </div>
                <p style="margin: 0; font-size: 15px;">
                  As a thank you for helping us improve, you'll receive
                  <strong style="color: #d97706;">10 FREE conversions</strong>
                  once ${bankName} support is ready!
                </p>
              </div>

              <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <strong>📝 What to do next:</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Keep your PDF handy - you'll need to re-upload it when ready</li>
                  <li>Watch for our email notification (check spam if needed)</li>
                  <li>Enjoy your 10 free conversions once we're live!</li>
                </ol>
              </div>

              <p style="margin-top: 30px;">
                Have questions? Just reply to this email and we'll get back to you right away.
              </p>

              <p style="margin-top: 20px;">
                Best regards,<br>
                <strong>The TaxFormed Team</strong>
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0;">
                You're receiving this because you requested support for ${bankName} bank statements.
              </p>
              <p style="margin: 5px 0 0 0;">
                <a href="https://taxformed.com" style="color: #667eea;">taxformed.com</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending user confirmation email:', error);
    return { success: false, error };
  }
}
