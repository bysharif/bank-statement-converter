import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateMockTransactions, generateCSVContent } from '@/lib/csv-utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, fileName } = await request.json()

    if (!email || !fileName) {
      return NextResponse.json(
        { error: 'Email and fileName are required' },
        { status: 400 }
      )
    }

    // Generate the mock transaction data (3 transactions for preview)
    const mockData = generateMockTransactions(fileName)
    const csvContent = generateCSVContent(mockData.preview)

    // Create CSV file as attachment
    const csvBuffer = Buffer.from(csvContent, 'utf-8')
    const attachmentFileName = fileName.replace(/\.[^/.]+$/, '') + '_preview.csv'

    // Send email with CSV attachment
    const emailResult = await resend.emails.send({
      from: 'Bank Statement Converter <noreply@convertbank-statement.com>',
      to: [email],
      subject: `Your FREE bank statement preview - ${attachmentFileName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Your FREE CSV Preview is Ready!</h1>
          </div>

          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi there! 👋</h2>

            <p style="color: #475569; line-height: 1.6;">
              Thanks for using <strong>convert-bankstatement.com</strong>! We've processed your file
              <strong>${fileName}</strong> and attached your FREE preview containing the first
              <strong>3 transactions</strong>.
            </p>

            <div style="background: white; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">📊 What's included:</h3>
              <ul style="color: #475569; line-height: 1.8;">
                <li><strong>3 transactions</strong> from your bank statement</li>
                <li><strong>CSV format</strong> - ready for Excel, QuickBooks, etc.</li>
                <li><strong>Properly formatted</strong> dates, amounts, and descriptions</li>
                <li><strong>GDPR compliant</strong> - your data is processed securely</li>
              </ul>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>📈 Need more transactions?</strong> Upgrade to our Professional plan for unlimited conversions,
                all file formats, and priority support.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://convertbank-statement.com/signup"
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🚀 Upgrade for Unlimited Access
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">

            <div style="text-align: center; color: #64748b; font-size: 14px;">
              <p>Thanks for choosing convert-bankstatement.com</p>
              <p style="margin: 5px 0;">Questions? Reply to this email - we're here to help!</p>

              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <span style="display: inline-block; margin: 0 10px;">🔒 Bank-grade security</span>
                <span style="display: inline-block; margin: 0 10px;">🇬🇧 UK-based</span>
                <span style="display: inline-block; margin: 0 10px;">⚡ 99.6% accuracy</span>
              </div>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: attachmentFileName,
          content: csvBuffer,
        },
      ],
    })

    if (emailResult.error) {
      console.error('Resend email error:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult.data?.id,
      transactionCount: mockData.preview.length,
      totalTransactions: mockData.total,
      fileName: attachmentFileName
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}