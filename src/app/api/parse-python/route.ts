import { NextRequest, NextResponse } from 'next/server';

/**
 * SIMPLE Python parser endpoint - no fallbacks, no complexity
 * Direct call to Flask server on port 5002
 */
export const maxDuration = 30; // Python parser is fast - 30 seconds max

const FREE_TIER_LIMIT = 50;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🐍 PYTHON PARSER API called at', new Date().toISOString());

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    console.log(`📄 File: ${file.name}, size: ${file.size} bytes`);

    // Create FormData for Flask server
    const flaskFormData = new FormData();
    flaskFormData.append('file', file);

    // Call Flask server DIRECTLY
    const flaskUrl = 'http://localhost:5002/api/convert';
    console.log(`🔗 Calling Flask at: ${flaskUrl}`);

    const flaskResponse = await fetch(flaskUrl, {
      method: 'POST',
      body: flaskFormData,
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error('❌ Flask error:', errorText);
      return NextResponse.json(
        { error: `Python parser failed: ${errorText}` },
        { status: 500 }
      );
    }

    const result = await flaskResponse.json();
    console.log(`✅ Python parser result:`, {
      success: result.success,
      bank: result.bank_display_name,
      count: result.count,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Convert Python format to frontend format
    const transactions = result.transactions.map((tx: any) => ({
      date: tx.date,
      description: tx.description,
      amount: tx.credit > 0 ? tx.credit : tx.debit,
      type: tx.type === 'income' ? 'credit' : 'debit',
      balance: tx.balance,
      debit: tx.debit,
      credit: tx.credit,
    }));

    // Apply free tier limit
    const limitedTransactions = transactions.slice(0, FREE_TIER_LIMIT);
    const previewTransactions = limitedTransactions.slice(0, 3);
    const isLimited = transactions.length > FREE_TIER_LIMIT;

    // Generate CSV
    const csvLines = ['Date,Description,Debit,Credit,Balance'];
    limitedTransactions.forEach((tx: any) => {
      const debit = tx.type === 'debit' ? tx.amount.toFixed(2) : '';
      const credit = tx.type === 'credit' ? tx.amount.toFixed(2) : '';
      const balance = tx.balance?.toFixed(2) || '';
      const desc = tx.description.includes(',') ? `"${tx.description}"` : tx.description;
      csvLines.push(`${tx.date},${desc},${debit},${credit},${balance}`);
    });
    const csvContent = csvLines.join('\n');

    const processingTime = Date.now() - startTime;
    console.log(`✅ Completed in ${processingTime}ms`);

    return NextResponse.json({
      preview: previewTransactions,
      download: limitedTransactions,
      actualTransactionCount: result.count,
      shownTransactionCount: limitedTransactions.length,
      csvContent,
      bankName: result.bank_display_name,
      detectedFormat: result.bank,
      isLimited,
      limitMessage: isLimited
        ? `Free tier limited to ${FREE_TIER_LIMIT} transactions. Your statement has ${result.count} transactions. Sign up for unlimited access!`
        : undefined,
      metadata: {
        processingTime,
        method: 'python',
        confidence: result.accuracy_score / 100,
      },
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}

