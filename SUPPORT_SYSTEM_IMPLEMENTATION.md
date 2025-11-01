# Bank Statement Converter - Support System Implementation Guide

## Overview

This guide explains how to implement the support request system and universal parser for handling unsupported banks.

## 📁 Files Created

### Database
- `supabase/migrations/20250111_create_support_requests.sql` - Database schema

### TypeScript Types
- `src/types/support.ts` - TypeScript definitions

### Email System
- `src/lib/email/support-request.tsx` - Email templates and sending functions

### API Endpoints
- `src/app/api/support/request/route.ts` - Support request submission endpoint

### UI Components
- `src/components/support/no-parser-detected-dialog.tsx` - Bank not supported dialog
- `src/components/support/support-request-form.tsx` - Support request form

### Python Parser
- `api/parsers/universal_parser.py` - AI-powered universal parser

---

## 🚀 Setup Instructions

### 1. Database Setup

Run the migration to create the support_requests table:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Dashboard
```

### 2. Environment Variables

Ensure these are set in your `.env.local`:

```env
# Already have these
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_key

# AI Parser (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_key
```

### 3. Install Dependencies

```bash
# If you don't have Resend SDK
npm install resend

# Python dependencies
pip install anthropic pdfplumber
```

### 4. Update Your Upload Flow

Modify your existing PDF upload component to detect unsupported banks and show the dialog.

**Example Integration in your upload component:**

```tsx
'use client';

import { useState } from 'react';
import { NoParserDetectedDialog } from '@/components/support/no-parser-detected-dialog';
import { SupportRequestForm } from '@/components/support/support-request-form';

export function PDFUploader() {
  const [showNoParserDialog, setShowNoParserDialog] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [uploadedFileData, setUploadedFileData] = useState({
    bankName: '',
    pdfUrl: '',
    pdfStoragePath: '',
  });

  const handlePDFUpload = async (file: File) => {
    try {
      // 1. Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('statements')
        .upload(`${userId}/${file.name}`, file);

      if (uploadError) throw uploadError;

      const pdfUrl = supabase.storage
        .from('statements')
        .getPublicUrl(uploadData.path).data.publicUrl;

      // 2. Try to parse with existing parsers
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      // 3. Check if bank is supported
      if (result.bank === 'unknown' || result.error?.includes('not yet available')) {
        // Bank not supported - show options dialog
        setUploadedFileData({
          bankName: result.bank_display_name || 'Unknown Bank',
          pdfUrl,
          pdfStoragePath: uploadData.path,
        });
        setShowNoParserDialog(true);
      } else {
        // Success - show results
        handleSuccess(result);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleRequestSupport = () => {
    setShowNoParserDialog(false);
    setShowSupportForm(true);
  };

  const handleTryUniversalParser = async () => {
    setShowNoParserDialog(false);
    // TODO: Call universal parser API (see below)
    // For now, just show a coming soon message
    alert('Universal parser coming soon!');
  };

  return (
    <>
      {/* Your existing upload UI */}
      <input type="file" onChange={(e) => handlePDFUpload(e.target.files[0])} />

      {/* No Parser Detected Dialog */}
      <NoParserDetectedDialog
        open={showNoParserDialog}
        onOpenChange={setShowNoParserDialog}
        bankName={uploadedFileData.bankName}
        onRequestSupport={handleRequestSupport}
        onTryUniversalParser={handleTryUniversalParser}
      />

      {/* Support Request Form */}
      <SupportRequestForm
        open={showSupportForm}
        onOpenChange={setShowSupportForm}
        bankName={uploadedFileData.bankName}
        pdfUrl={uploadedFileData.pdfUrl}
        pdfStoragePath={uploadedFileData.pdfStoragePath}
        userEmail={session?.user?.email}
      />
    </>
  );
}
```

---

## 🧪 Testing the Support System

### Test Support Request Submission

1. Upload a PDF from an unsupported bank (or use a test file)
2. Click "Request Support" in the dialog
3. Fill out the form
4. Submit

**Expected Results:**
- ✅ Record created in `support_requests` table
- ✅ Email sent to sharif@taxformed.com with PDF attachment
- ✅ Confirmation email sent to user
- ✅ Success message shown to user

### Test Emails Locally

You can test the email templates by calling the functions directly:

```tsx
import { sendSupportNotificationEmail, sendUserConfirmationEmail } from '@/lib/email/support-request';

// Test admin notification
await sendSupportNotificationEmail({
  userEmail: 'test@example.com',
  userName: 'Test User',
  bankName: 'Metro Bank',
  urgency: 'high',
  notes: 'Need this urgently for tax filing',
  pdfUrl: 'https://example.com/statement.pdf',
  requestId: '123-456-789',
});

// Test user confirmation
await sendUserConfirmationEmail({
  email: 'test@example.com',
  bankName: 'Metro Bank',
  userName: 'Test User',
});
```

---

## 🤖 Universal Parser Integration (Optional)

### Create API Endpoint

Create `src/app/api/parse/universal/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file temporarily
    const tempPath = `/tmp/${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.promises.writeFile(tempPath, buffer);

    // Call Python universal parser
    const { spawn } = require('child_process');
    const python = spawn('python3', ['api/parsers/universal_parser.py', tempPath]);

    let result = '';
    for await (const chunk of python.stdout) {
      result += chunk;
    }

    // Clean up temp file
    await fs.promises.unlink(tempPath);

    const parsed = JSON.parse(result);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Universal parser error:', error);
    return NextResponse.json(
      { error: 'Parsing failed' },
      { status: 500 }
    );
  }
}
```

### Test Universal Parser

```bash
# Test directly with Python
python3 api/parsers/universal_parser.py "/path/to/statement.pdf"

# Should output JSON with transactions
```

---

## 📊 Admin Dashboard (Optional)

Create an admin page to view and manage support requests:

`src/app/admin/support/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupportRequest } from '@/types/support';

export default function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false });

    setRequests(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from('support_requests')
      .update({ status })
      .eq('id', id);

    loadRequests();
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Support Requests</h1>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{request.bank_name}</h3>
                <p className="text-sm text-muted-foreground">{request.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(request.created_at).toLocaleString()}
                </p>
              </div>
              <select
                value={request.status}
                onChange={(e) => updateStatus(request.id, e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {request.notes && (
              <p className="mt-2 text-sm">{request.notes}</p>
            )}

            <a
              href={request.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              Download PDF →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Next Steps

1. **Run the database migration** to create the support_requests table
2. **Test the support request flow** with a test PDF
3. **Verify emails** are being sent correctly
4. **Optional**: Integrate universal parser
5. **Optional**: Create admin dashboard

---

## 📝 Notes

### Email Customization

The email templates are in `src/lib/email/support-request.tsx`. You can customize:
- Colors and branding
- Text and messaging
- Links and CTAs

### Security

- RLS policies ensure users can only see their own requests
- Service role key required for admin operations
- PDFs are stored in authenticated Supabase storage

### Costs

- **Resend**: Free tier includes 3,000 emails/month
- **Anthropic Claude**: Pay per API call (~$0.015 per 1K tokens)
- Consider implementing rate limiting for universal parser

---

## ❓ Troubleshooting

### Emails not sending

1. Check RESEND_API_KEY is set
2. Verify sender email is verified in Resend dashboard
3. Check Resend logs for errors

### Database errors

1. Ensure migration ran successfully
2. Check RLS policies are enabled
3. Verify user authentication is working

### Universal parser issues

1. Ensure ANTHROPIC_API_KEY is set
2. Check Python environment has required packages
3. Test with sample PDF first

---

That's it! You now have a complete support system for handling unsupported banks. 🎉
