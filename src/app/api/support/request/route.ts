/**
 * API endpoint for submitting support requests for unsupported banks
 * POST /api/support/request
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sendSupportNotificationEmail, sendUserConfirmationEmail } from '@/lib/email/support-request';
import type { CreateSupportRequestInput } from '@/types/support';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bank_name, urgency, notes, pdf_url, pdf_storage_path } = body;

    // Validate required fields
    if (!bank_name || !pdf_url || !pdf_storage_path) {
      return NextResponse.json(
        { error: 'Missing required fields: bank_name, pdf_url, pdf_storage_path' },
        { status: 400 }
      );
    }

    // Get user email
    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Create support request in database
    const requestData: CreateSupportRequestInput = {
      email: userEmail,
      bank_name,
      pdf_url,
      pdf_storage_path,
      urgency: urgency || 'medium',
      notes: notes || null,
    };

    const { data: supportRequest, error: dbError } = await supabase
      .from('support_requests')
      .insert([
        {
          user_id: session.user.id,
          ...requestData,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error creating support request:', dbError);
      return NextResponse.json(
        { error: 'Failed to create support request' },
        { status: 500 }
      );
    }

    // Get user metadata for personalization
    const { data: userData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single();

    const userName = userData?.full_name || session.user.user_metadata?.name;

    // Send notification email to admin
    const adminEmailResult = await sendSupportNotificationEmail({
      userEmail,
      userName,
      bankName: bank_name,
      urgency,
      notes,
      pdfUrl: pdf_url,
      requestId: supportRequest.id,
    });

    if (!adminEmailResult.success) {
      console.error('Failed to send admin notification email');
      // Don't fail the request, just log it
    }

    // Send confirmation email to user
    const userEmailResult = await sendUserConfirmationEmail({
      email: userEmail,
      bankName: bank_name,
      userName,
    });

    if (!userEmailResult.success) {
      console.error('Failed to send user confirmation email');
      // Don't fail the request, just log it
    }

    return NextResponse.json({
      success: true,
      request: supportRequest,
      message: 'Support request submitted successfully',
    });
  } catch (error) {
    console.error('Error in support request API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
