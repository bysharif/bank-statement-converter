# Python Parser Integration

This document describes how the Python bank statement parsers have been integrated into the bank statement converter project.

## Architecture

The Python parsers from the Taxformed project have been integrated as follows:

1. **Python Parser Code** (`api/` directory)
   - `api/converter.py` - Main orchestrator
   - `api/bank_detector.py` - Bank detection
   - `api/utils.py` - Utility functions
   - `api/parsers/` - Bank-specific parsers (Barclays, Wise, Monzo)

2. **Next.js Integration** 
   - `src/lib/python-parser.ts` - TypeScript wrapper for Python parser
   - `src/app/api/python-convert/route.ts` - Next.js API route that proxies to Python
   - `src/app/api/parse-single-pdf/route.ts` - Main parsing endpoint (tries Python first, falls back to Hybrid)

3. **Vercel Configuration**
   - `vercel.json` - Configured for Python 3.9 runtime for `api/convert.py`
   - Python dependencies in `api/requirements.txt`

## Supported Banks

- ✅ **Barclays** - 95%+ accuracy
- ✅ **Wise** - 95%+ accuracy  
- ✅ **Monzo** - 95%+ accuracy
- ⏳ More banks coming soon (HSBC, Lloyds, NatWest, etc.)

## How It Works

1. User uploads PDF via landing page or dashboard
2. Frontend calls `/api/parse-single-pdf`
3. API route tries Python parser first:
   - Calls `/api/python-convert` (Next.js route)
   - Which calls `/api/convert` (Python serverless function)
   - Python parser detects bank and extracts transactions
4. If Python parser fails/unsupported bank, falls back to Hybrid Parser (TypeScript/AI)
5. Results are returned with transaction limit applied based on user tier

## User Tier Limits

- **FREE**: 50 transactions (preview only)
- **STARTER**: 500 transactions
- **PROFESSIONAL**: 5,000 transactions
- **ENTERPRISE**: Unlimited

## Local Development

For local development, you'll need Python 3.9+ installed. The Python parser will be called via HTTP to the Next.js dev server.

To test locally:
```bash
# Install Python dependencies
pip install -r api/requirements.txt

# Run Next.js dev server
npm run dev
```

The Python parser will be available at `http://localhost:3000/api/convert` when running locally.

## Vercel Deployment

On Vercel, the Python function at `api/convert.py` is automatically deployed as a serverless function with Python 3.9 runtime.

No additional configuration needed - Vercel detects the Python file and deploys it automatically.

## Adding New Banks

To add a new bank parser:

1. Create `api/parsers/{bank}_parser.py` following the pattern of existing parsers
2. Extend `BaseBankParser` class
3. Register in `api/converter.py`:
   ```python
   PARSERS = {
       'barclays': BarclaysParser,
       'wise': WiseParser,
       'monzo': MonzoParser,
       '{bank_id}': {BankName}Parser,  # Add here
   }
   ```
4. Update `api/bank_detector.py` with detection patterns
5. Test locally and deploy

## File Structure

```
bankstatementconverter/
├── api/                          # Python parser code
│   ├── convert.py               # Vercel serverless function handler
│   ├── converter.py             # Main orchestrator
│   ├── bank_detector.py         # Bank detection
│   ├── utils.py                 # Utility functions
│   ├── requirements.txt         # Python dependencies
│   └── parsers/                 # Bank-specific parsers
│       ├── __init__.py
│       ├── base_parser.py
│       ├── barclays_parser.py
│       ├── wise_parser.py
│       └── monzo_parser.py
├── src/
│   ├── lib/
│   │   └── python-parser.ts     # TypeScript wrapper
│   └── app/
│       └── api/
│           ├── parse-single-pdf/
│           │   └── route.ts     # Main endpoint (Python + Hybrid)
│           └── python-convert/
│               └── route.ts     # Proxy to Python parser
└── vercel.json                  # Vercel config (Python runtime)
```

## Notes

- Python parser is preferred for supported banks (Barclays, Wise, Monzo) due to higher accuracy
- Falls back gracefully to Hybrid Parser for unsupported banks
- All parsers respect user tier transaction limits
- Balance validation errors are filtered out (balances not needed for CSV/table)

