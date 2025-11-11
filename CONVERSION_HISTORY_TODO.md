# Conversion History Implementation - TODO

## Current Status: 90% Complete

### ✅ What's Already Done

1. **Database Schema** - COMPLETE
   - `conversion_jobs` table exists with all necessary fields
   - `transactions` table for individual transaction data
   - Row Level Security policies configured
   - Proper indexes in place
   - Auto-expiration after 7 days
   - Location: `supabase/migrations/20250105_create_core_schema.sql`

2. **Authentication** - COMPLETE
   - User profiles automatically created on signup
   - Session management working
   - Protected routes configured

3. **Conversion API** - PARTIAL
   - File processing works
   - User tier limits enforced
   - Usage tracking increments
   - **MISSING**: Does not save to `conversion_jobs` table

### ❌ What Needs To Be Done

#### 1. Update Conversion API to Save Records (30 mins)

**File**: `src/app/api/process-pdfs/route.ts`

**What to add** (around line 106, after incrementConversionCount):

```typescript
// Save conversion job to database
const startTime = Date.now()

try {
  const { data: job, error: jobError } = await supabase
    .from('conversion_jobs')
    .insert({
      user_id: user.id,
      original_filename: files.map(f => f.name).join(', '),
      file_size: files.reduce((sum, f) => sum + f.size, 0),
      file_type: 'pdf',
      bank_detected: 'Unknown', // Can be enhanced with bank detection
      input_format: 'pdf',
      output_format: 'csv',
      status: 'completed',
      progress: 100,
      transactions_count: allTransactions.length,
      processing_time_ms: Date.now() - startTime,
      parser_version: 'ai-claude-v1',
    })
    .select()
    .single()

  if (jobError) {
    console.error('Failed to save conversion job:', jobError)
  }

  // Optionally save individual transactions
  if (job && allTransactions.length > 0) {
    const transactionRecords = allTransactions.map((txn, index) => ({
      job_id: job.id,
      transaction_date: txn.date,
      description: txn.description,
      amount: txn.amount,
      balance: txn.balance,
      row_number: index + 1,
    }))

    const { error: txnError } = await supabase
      .from('transactions')
      .insert(transactionRecords)

    if (txnError) {
      console.error('Failed to save transactions:', txnError)
    }
  }
} catch (dbError) {
  console.error('Database save error:', dbError)
  // Don't fail the conversion if DB save fails
}
```

#### 2. Update History Page (20 mins)

**File**: `src/app/dashboard/history/page.tsx`

**What to add**:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

interface ConversionJob {
  id: string
  original_filename: string
  transactions_count: number
  created_at: string
  status: string
  bank_detected?: string
  file_size: number
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [conversions, setConversions] = useState<ConversionJob[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchConversions() {
      if (!user) return

      const { data, error } = await supabase
        .from('conversion_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching conversions:', error)
      } else {
        setConversions(data || [])
      }

      setLoading(false)
    }

    fetchConversions()
  }, [user])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Conversion History</h1>

      {conversions.length === 0 ? (
        <p className="text-gray-600">No conversions yet</p>
      ) : (
        <div className="space-y-4">
          {conversions.map((conv) => (
            <div
              key={conv.id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <h3 className="font-semibold">{conv.original_filename}</h3>
              <p className="text-sm text-gray-600">
                {conv.transactions_count} transactions • {' '}
                {new Date(conv.created_at).toLocaleDateString()}
              </p>
              <button className="text-blue-600 hover:underline mt-2">
                Re-download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

#### 3. Optional Enhancements

- **Re-download feature**: Store CSV in Supabase Storage and allow re-downloads
- **Star/favorite**: Add `starred` boolean field, allow users to star important conversions
- **Search & filter**: Add search by filename, filter by date range
- **Bank detection**: Enhance to detect which bank the statement is from
- **Export options**: Allow re-export in different formats

### 📊 Implementation Priority

1. **HIGH**: Update conversion API to save records
2. **HIGH**: Update history page to fetch and display conversions
3. **MEDIUM**: Add re-download capability
4. **LOW**: Add search/filter/star features

### 🚀 Estimated Time

- **Minimum viable**: 1 hour (tasks 1-2)
- **Full featured**: 3-4 hours (all enhancements)

### 📝 Notes

- Database schema is production-ready
- RLS policies ensure users only see their own data
- Automatic cleanup after 7 days saves storage
- Can implement incrementally - start with basic save/display

### 🔍 Files to Modify

1. `src/app/api/process-pdfs/route.ts` - Add DB save logic
2. `src/app/dashboard/history/page.tsx` - Fetch and display conversions
3. (Optional) `src/lib/database.ts` - Create if you want helper functions

### ✅ When Complete

Users will be able to:
- See all their past conversions
- View transaction counts and processing dates
- Track their conversion history
- Re-download converted files (if storage implemented)

---

**Last Updated**: November 11, 2025
**Status**: Database ready, implementation pending
**Blocker**: None - ready to implement
