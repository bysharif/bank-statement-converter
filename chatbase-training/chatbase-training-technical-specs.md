# ConvertBank-Statement.com - Technical Specifications & Troubleshooting

## DETAILED BANK SUPPORT

### Traditional UK Banks - Fully Supported

#### HSBC (All Account Types)
- **Formats Supported**: PDF (digital), PDF (scanned), CSV
- **Account Types**: Personal Current, Savings, Business, Premier
- **Average Accuracy**: 99.8%
- **Processing Speed**: 15-25 seconds
- **Known Issues**: None
- **Special Notes**: Multi-page PDFs automatically detected
- **Transaction Types Recognized**: Debits, Credits, Standing Orders, Direct Debits, Card Payments, ATM Withdrawals, Transfers

#### Barclays (All Account Types)
- **Formats Supported**: PDF (digital), PDF (scanned), CSV
- **Account Types**: Personal, Business, Premier, Barclaycard statements
- **Average Accuracy**: 99.7%
- **Processing Speed**: 15-30 seconds
- **Known Issues**: Very old statements (pre-2015) may require manual review
- **Special Notes**: Excellent support for both retail and business banking
- **Transaction Types Recognized**: All standard types including international transfers

#### Lloyds Banking Group (Lloyds, Halifax, Bank of Scotland)
- **Formats Supported**: PDF (digital), PDF (scanned)
- **Account Types**: All personal and business accounts
- **Average Accuracy**: 99.7%
- **Processing Speed**: 15-25 seconds
- **Known Issues**: Halifax older formats (pre-2016) may show minor date formatting differences
- **Special Notes**: Same processing engine for all three brands
- **Transaction Types Recognized**: Full range including Club Lloyds transactions

#### NatWest Group (NatWest, Royal Bank of Scotland, Ulster Bank)
- **Formats Supported**: PDF (digital), PDF (scanned), CSV
- **Account Types**: Personal, Business, Bankline
- **Average Accuracy**: 99.6%
- **Processing Speed**: 20-30 seconds
- **Known Issues**: Ulster Bank Euro accounts require multi-currency plan
- **Special Notes**: Excellent business banking support
- **Transaction Types Recognized**: All including CHAPS and BACS

#### Santander UK
- **Formats Supported**: PDF (digital), PDF (scanned)
- **Account Types**: Current, Savings, Business, Select
- **Average Accuracy**: 99.5%
- **Processing Speed**: 20-30 seconds
- **Known Issues**: Some Spanish-language statements may require review
- **Special Notes**: 123 account cashback transactions correctly categorized
- **Transaction Types Recognized**: All including international transfers

#### TSB Bank
- **Formats Supported**: PDF (digital), PDF (scanned)
- **Account Types**: Current, Savings, Business
- **Average Accuracy**: 99.6%
- **Processing Speed**: 15-25 seconds
- **Known Issues**: None significant
- **Special Notes**: Format changed in 2019, both old and new supported
- **Transaction Types Recognized**: Standard range

#### Nationwide Building Society
- **Formats Supported**: PDF (digital), PDF (scanned)
- **Account Types**: Current, Savings, FlexAccount, FlexDirect
- **Average Accuracy**: 99.7%
- **Processing Speed**: 15-25 seconds
- **Known Issues**: None
- **Special Notes**: Excellent format consistency
- **Transaction Types Recognized**: All including building society specific transactions

#### Metro Bank
- **Formats Supported**: PDF (digital), PDF (scanned)
- **Account Types**: Personal, Business
- **Average Accuracy**: 99.8%
- **Processing Speed**: 15-20 seconds
- **Known Issues**: None
- **Special Notes**: Very clean, consistent format - easy to process
- **Transaction Types Recognized**: All standard types

#### First Direct
- **Formats Supported**: PDF (digital), PDF (scanned)
- **Account Types**: Current, Savings
- **Average Accuracy**: 99.7%
- **Processing Speed**: 15-25 seconds
- **Known Issues**: None
- **Special Notes**: Part of HSBC Group, similar format
- **Transaction Types Recognized**: All standard types

#### The Co-operative Bank
- **Formats Supported**: PDF (digital), PDF (scanned)
- **Account Types**: Current, Savings, Business
- **Average Accuracy**: 99.5%
- **Processing Speed**: 20-30 seconds
- **Known Issues**: Some historical statements (pre-2017) may need review
- **Special Notes**: Ethical banking transactions correctly categorized
- **Transaction Types Recognized**: Standard range

### Digital/Challenger Banks - Fully Supported

#### Monzo
- **Formats Supported**: PDF (digital), CSV (exported from app)
- **Account Types**: Personal Current, Business, Plus, Premium
- **Average Accuracy**: 99.9%
- **Processing Speed**: 10-15 seconds
- **Known Issues**: None
- **Special Notes**: Cleanest format of all banks, includes emoji in merchant names (preserved)
- **Transaction Types Recognized**: All including Pots, instant notifications
- **Export from Monzo**: Banking → Statements → Download PDF

#### Starling Bank
- **Formats Supported**: PDF (digital), CSV (exported from app)
- **Account Types**: Personal, Business, Joint, Kite (children's account)
- **Average Accuracy**: 99.9%
- **Processing Speed**: 10-15 seconds
- **Known Issues**: None
- **Special Notes**: Excellent digital format, very consistent
- **Transaction Types Recognized**: All including Spaces, Goals
- **Export from Starling**: Statements → Download statement

#### Revolut
- **Formats Supported**: PDF (digital), CSV (exported from app), Excel
- **Account Types**: Standard, Plus, Premium, Metal, Business
- **Average Accuracy**: 99.7%
- **Processing Speed**: 15-25 seconds
- **Known Issues**: Multi-currency transactions require Professional+ plan
- **Special Notes**: Supports cryptocurrency transactions, exchange rates preserved
- **Transaction Types Recognized**: All including crypto, commodities, stocks
- **Export from Revolut**: More → Statements → Download

#### N26
- **Formats Supported**: PDF (digital), CSV
- **Account Types**: Standard, Smart, You, Metal
- **Average Accuracy**: 99.6%
- **Processing Speed**: 15-20 seconds
- **Known Issues**: Euro accounts require multi-currency plan
- **Special Notes**: German IBAN format supported
- **Transaction Types Recognized**: Standard European banking transactions

#### Wise (formerly TransferWise)
- **Formats Supported**: PDF (digital), CSV
- **Account Types**: Personal, Business multi-currency
- **Average Accuracy**: 99.5%
- **Processing Speed**: 20-30 seconds (multi-currency adds time)
- **Known Issues**: Many currencies in one statement - requires Professional+ plan
- **Special Notes**: Exchange rates and fees correctly extracted
- **Transaction Types Recognized**: International transfers, currency conversions, holds

#### Curve
- **Formats Supported**: PDF (digital), CSV
- **Account Types**: Curve, Curve Metal, Curve Black
- **Average Accuracy**: 99.6%
- **Processing Speed**: 15-25 seconds
- **Known Issues**: Underlying card aggregation can create complex statements
- **Special Notes**: Shows both Curve transaction and underlying card
- **Transaction Types Recognized**: Card aggregation, cashback, Go Back in Time

#### Tide (Business Banking)
- **Formats Supported**: PDF (digital), CSV
- **Account Types**: Free, Plus, Pro
- **Average Accuracy**: 99.7%
- **Processing Speed**: 15-20 seconds
- **Known Issues**: None
- **Special Notes**: Excellent for small business accounting
- **Transaction Types Recognized**: All business types including invoices, expenses

#### Anna Money (Business Banking)
- **Formats Supported**: PDF (digital), CSV
- **Account Types**: Business current account
- **Average Accuracy**: 99.6%
- **Processing Speed**: 15-20 seconds
- **Known Issues**: None
- **Special Notes**: Tax estimates in statements handled correctly
- **Transaction Types Recognized**: Business transactions, tax savings

#### Coconut (Business Banking)
- **Formats Supported**: PDF (digital), CSV
- **Account Types**: Business current account
- **Average Accuracy**: 99.6%
- **Processing Speed**: 15-20 seconds
- **Known Issues**: None
- **Special Notes**: Designed for freelancers, integrates tax categorization
- **Transaction Types Recognized**: Business, tax savings, personal transfers

### Banks with Limited/Partial Support

#### International Banks (Requires Business Plan)
- American Express (UK)
- Citibank UK
- Bank of Ireland UK
- Ulster Bank (Euro accounts)

#### Credit Cards (Supported with caveats)
- Most major credit card statements supported
- Format varies significantly by issuer
- May require manual review for complex rewards/points

### Banks NOT Currently Supported

- PayPal (complex format, under development)
- Cash App (US-focused, not prioritized)
- Most international banks outside UK/Europe
- Cryptocurrency exchange statements (except Revolut)

**Request new banks**: email support@convertbank-statement.com

## PROCESSING SPECIFICATIONS

### File Size Limits by Plan

| Plan | Max File Size | Max Transactions | Max Pages |
|------|--------------|------------------|-----------|
| Free | 10MB | 100 | 20 pages |
| Starter | 50MB | 1,000 | 100 pages |
| Professional | 100MB | Unlimited | Unlimited |
| Business | 500MB | Unlimited | Unlimited |

### Processing Times

**Standard Digital PDFs:**
- 1-50 transactions: 10-15 seconds
- 51-250 transactions: 15-20 seconds
- 251-500 transactions: 20-30 seconds
- 501-1,000 transactions: 30-45 seconds
- 1,001-2,000 transactions: 45-60 seconds
- 2,000+ transactions: 60-90 seconds

**Scanned/Image PDFs (OCR Required):**
- Add 50-100% to above times
- Quality impacts speed significantly
- Poor scans may take 2-3x longer

**Batch Processing (Professional+ only):**
- Multiple files processed in parallel
- Total time ≈ slowest file + 10 seconds

### Accuracy Specifications

**Overall Accuracy**: 99.6%

**Accuracy by Data Type:**
- Date: 99.9%
- Transaction Description: 99.7%
- Amount: 99.9%
- Balance: 99.8%
- Reference Numbers: 99.4%
- Categories (Professional+): 92%

**Common Error Types (0.4% total):**
- OCR misreads on poor scans: 60% of errors
- Unusual formatting: 25% of errors
- Foreign characters: 10% of errors
- Edge cases: 5% of errors

### Data Extraction Fields

**Standard Fields (All Plans):**
- Transaction Date
- Transaction Description/Merchant
- Debit Amount
- Credit Amount
- Balance (if shown on statement)
- Transaction Type
- Reference/Check Number

**Additional Fields (Professional+ Plans):**
- Auto-Category
- Tags
- Notes/Memo
- Payee
- Payment Method
- Location (if available)

## EXPORT FORMAT SPECIFICATIONS

### CSV Format

**Structure:**
```csv
Date,Description,Debit,Credit,Balance,Type,Reference
01/01/2024,TESCO STORES,25.50,,1250.25,Card Payment,
02/01/2024,Salary,,2500.00,3750.25,Transfer,REF123
```

**Specifications:**
- Character encoding: UTF-8
- Date format: Configurable (DD/MM/YYYY default, MM/DD/YYYY, YYYY-MM-DD available)
- Decimal separator: Configurable (. default, , available for EU)
- Thousands separator: None (for Excel compatibility)
- Line endings: CRLF (Windows) or LF (Unix) - auto-detected from user OS
- Quote handling: Double quotes for fields containing commas

**Customization (Professional+ only):**
- Column order
- Custom headers
- Include/exclude fields
- Merged debit/credit columns
- Custom date formats

### Excel (.xlsx) Format

**Structure:**
- Sheet 1: "Transactions" - All transaction data
- Sheet 2: "Summary" - Account summary, totals, date range (Professional+ only)
- Sheet 3: "Categories" - Category breakdown (Professional+ only)

**Specifications:**
- Format: Office Open XML (.xlsx)
- Excel version: Compatible with Excel 2007+
- Formatting: Headers bold, amounts right-aligned, dates formatted
- Formulas: Running balance calculation, totals
- Colors: Header row blue (#1E40AF), debits red, credits green
- Freeze panes: Top row frozen for scrolling
- Column widths: Auto-sized to content

**Features (Professional+ only):**
- Charts (spending by category)
- Pivot tables (pre-configured)
- Conditional formatting (highlight large transactions)
- Data validation

### QIF (Quicken Interchange Format)

**Structure:**
```
!Type:Bank
D01/01/2024
TTESCO STORES
P
M
C
N
A
L
$-25.50
^
```

**Specifications:**
- Format: QIF (Quicken 2000+ compatible)
- Compatible with: QuickBooks Desktop, Quicken, Money Manager, GnuCash, Many others
- Transaction types: Bank, Cash, Credit Card, Investment
- Cleared status: Set to "cleared" by default
- Categories: Mapped if available (Professional+ only)

**Limitations:**
- No multi-currency support in QIF format
- Limited memo field (255 characters)
- Older format - use QBO for QuickBooks Online

### QBO (QuickBooks Online Format)

**Structure:**
```
OFXHEADER:100
DATA:OFXSGML
VERSION:102
...
```

**Specifications:**
- Format: OFX (Open Financial Exchange)
- Version: OFX 1.0.2 (QBO compatible)
- Compatible with: QuickBooks Online, Xero (via import)
- Features: Account info, transaction data, balances
- Character encoding: UTF-8

**Advantages:**
- Native QuickBooks Online format
- One-click import
- Preserves more metadata than QIF
- Better category mapping

### JSON Format

**Structure:**
```json
{
  "account": {
    "bank": "HSBC",
    "accountNumber": "****1234",
    "sortCode": "40-00-00",
    "accountType": "Current Account",
    "currency": "GBP"
  },
  "statement": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "openingBalance": 1000.00,
    "closingBalance": 1250.25
  },
  "transactions": [
    {
      "date": "2024-01-01",
      "description": "TESCO STORES",
      "debit": 25.50,
      "credit": null,
      "balance": 1250.25,
      "type": "Card Payment",
      "reference": "",
      "category": "Groceries",
      "metadata": {
        "merchant": "Tesco",
        "location": "London",
        "paymentMethod": "Contactless"
      }
    }
  ]
}
```

**Specifications:**
- Format: JSON (RFC 8259)
- Character encoding: UTF-8
- Pretty printed: Yes (indented 2 spaces)
- Schema: Available at /api/schema/transaction.json
- Validation: JSON Schema draft-07 compliant

**Use Cases:**
- API integrations
- Custom software development
- Data analysis (Python, R, etc.)
- Mobile app development
- Web application integrations

## KNOWN LIMITATIONS & EDGE CASES

### File Format Limitations

**Password-Protected PDFs:**
- **Issue**: Cannot be processed
- **Solution**: Remove password before upload
- **Workaround**: Most banks allow downloading unprotected statements

**Image-Only PDFs (Scanned):**
- **Issue**: OCR required, slower processing, slightly lower accuracy (97-98%)
- **Solution**: Request digital PDF from bank if possible
- **Workaround**: Ensure high-quality scan (300+ DPI, high contrast)

**Multi-Bank Statements:**
- **Issue**: Single file with multiple bank accounts
- **Solution**: Split into separate files (we can't auto-detect multiple accounts in one PDF)
- **Workaround**: Upload each account separately

**Handwritten Entries:**
- **Issue**: OCR cannot read handwriting
- **Solution**: Manual entry required for handwritten transactions
- **Workaround**: Focus on digital/typed statements

### Transaction-Level Limitations

**Pending Transactions:**
- **Issue**: Some banks show pending transactions on statements
- **Solution**: We flag these as "pending" type (Professional+ only)
- **Workaround**: Wait for transactions to clear before downloading statement

**Duplicate Detection:**
- **Issue**: Same transaction appears twice (common when statements overlap)
- **Solution**: Auto-detection on Professional+ plans
- **Workaround**: Manual review and deletion

**Foreign Language Transactions:**
- **Issue**: Non-English descriptions may not categorize well
- **Solution**: Currently English-only, improvements coming
- **Workaround**: Manual categorization in exported file

**Very Long Descriptions:**
- **Issue**: Some merchants have 200+ character descriptions
- **Solution**: Truncated to 255 characters (CSV/QIF limitation)
- **Workaround**: Full description available in JSON format

### Bank-Specific Edge Cases

**Revolut Cryptocurrency:**
- **Issue**: Crypto transactions use different format
- **Solution**: Extracted but category may be generic
- **Workaround**: Manual categorization recommended

**Monzo Pots:**
- **Issue**: Pot transfers show as transactions
- **Solution**: Correctly identified as "Transfer to Pot"
- **Workaround**: Filter by type if you don't want internal transfers

**Wise Multi-Currency:**
- **Issue**: Multiple currencies in single statement
- **Solution**: Requires Professional+ plan for multi-currency
- **Workaround**: Download separate statements per currency from Wise

**HSBC Multiple Pages:**
- **Issue**: Very long statements (100+ pages) may timeout
- **Solution**: Split by month or quarter
- **Workaround**: Contact support for manual processing

## TROUBLESHOOTING DECISION TREES

### Issue: File Won't Upload

**Check 1: File Size**
- Is file > 10MB (Free plan)?
  - YES → Upgrade to Starter (50MB) or compress PDF
  - NO → Go to Check 2

**Check 2: File Format**
- Is file PDF, CSV, Excel, JPG, or PNG?
  - YES → Go to Check 3
  - NO → Convert to supported format

**Check 3: File Protection**
- Is file password-protected?
  - YES → Remove password
  - NO → Go to Check 4

**Check 4: Browser/Connection**
- Try different browser (Chrome recommended)
- Check internet connection stability
- Clear browser cache
- Try incognito mode

**Still Stuck?**
→ Escalate to tech support

### Issue: Low Accuracy (Below 95%)

**Check 1: File Quality**
- Is this a scanned/image PDF?
  - YES → Check scan quality (300+ DPI, high contrast, straight) → Rescan if poor
  - NO → Go to Check 2

**Check 2: Bank Format**
- Is this a commonly supported bank (HSBC, Barclays, Lloyds, Monzo, etc.)?
  - YES → Go to Check 3
  - NO → Bank format may not be fully supported → Submit to support for format addition

**Check 3: Statement Age**
- Is statement from last 3 years?
  - YES → Go to Check 4
  - NO → Older statements may use outdated formats → Contact support

**Check 4: Language & Format**
- Is statement in English with standard UK format?
  - YES → Unknown issue → Escalate to tech support with sample
  - NO → Language/format limitations → Contact support for assistance

**Solution:**
→ Email statement to support@convertbank-statement.com for manual improvement (FREE)

### Issue: Missing Transactions

**Check 1: Page Count**
- Are all pages included in uploaded PDF?
  - YES → Go to Check 2
  - NO → Re-download complete statement from bank

**Check 2: Transaction Count**
- On Free plan with 100+ transactions?
  - YES → Upgrade to remove limit
  - NO → Go to Check 3

**Check 3: Statement Type**
- Is this a summary page or detailed statement?
  - SUMMARY → Download detailed transaction statement from bank
  - DETAILED → Go to Check 4

**Check 4: Date Range**
- Check original statement - do transactions appear there?
  - YES on original, NO in export → Contact support (processing error)
  - NO on original → Statement doesn't include those transactions

### Issue: Wrong Categories (Professional+ Plans Only)

**Understanding:**
- AI categorization is 92% accurate
- Learns from patterns
- Can make mistakes on unusual merchants

**Solutions:**
1. **One-time fix**: Edit categories in exported file (Excel/CSV)
2. **Permanent fix**: Set up custom rules in account settings
3. **Improve AI**: Mark incorrect categories → AI learns and improves
4. **Disable**: Turn off auto-categorization in settings for uncategorized exports

### Issue: Export Won't Open in Software

**For Excel Issues:**
- Use .xlsx format, not CSV
- Check Excel version (2007+ required)
- Try opening in Google Sheets first

**For QuickBooks Online Issues:**
- Ensure using QBO format, not QIF
- Check file size (<1MB recommended)
- Try direct upload vs. Banking → Upload file

**For QuickBooks Desktop Issues:**
- Use QIF format, not QBO
- File → Utilities → Import → Bank Statement
- Select correct account type

**For Xero Issues:**
- Use CSV format
- Banking → Import → Bank Statement
- Map columns correctly (Date, Description, Amount)
- Check date format matches Xero settings

**For Character Encoding Issues:**
- CSV file showing weird characters?
- Open in Notepad → Save As → UTF-8 encoding
- Or change export settings to match software

**Still stuck?**
→ Email support with error message screenshot

## API DOCUMENTATION (Professional+ Plans)

### API Access

**Professional Plan:**
- 100 API calls per day
- Basic endpoints (upload, convert, download)
- Rate limit: 10 requests per minute

**Business Plan:**
- Unlimited API calls
- Full endpoint access
- Rate limit: 100 requests per minute
- Webhook support
- Priority processing

### Authentication
```
Authorization: Bearer YOUR_API_KEY
```

### Endpoints

**POST /api/upload**
Upload statement for processing

**GET /api/status/{id}**
Check processing status

**GET /api/download/{id}**
Download converted file

**Full Documentation:**
https://convertbank-statement.com/api/docs

## PLAN RECOMMENDATION GUIDANCE

### Quick Decision Tree

**How many statements per month?**

**0-3 statements:**
→ **Free Plan** (£0/month)

**4-25 statements:**
→ **Starter Plan** (£9.99/month)

**26-100 statements:**
→ **Professional Plan** (£19.99/month)

**100+ statements:**
→ **Business Plan** (£49.99/month)

### Feature-Based Recommendations

**Need batch processing (10+ files at once)?**
→ Professional or Business Plan

**Need API access?**
→ Professional (basic) or Business (full)

**Need phone support?**
→ Business Plan only

**Need white-label/custom branding?**
→ Business Plan + £99/month add-on

**Need multi-currency?**
→ Professional or Business Plan

**Need advanced categorization?**
→ Professional or Business Plan

**Need long file storage (90+ days)?**
→ Professional (90 days) or Business (365 days)

### User Persona Recommendations

**Freelancer/Self-Employed:**
- **Typical need**: 5-15 statements/month
- **Recommendation**: Starter Plan
- **Why**: Priority support for tax questions, 30-day storage for records, duplicate removal saves time

**Small Business Owner:**
- **Typical need**: 15-50 statements/month (multiple accounts)
- **Recommendation**: Professional Plan
- **Why**: Batch processing, advanced categorization, 90-day storage, API for accounting integration

**Accountant (1-10 clients):**
- **Typical need**: 30-80 statements/month
- **Recommendation**: Professional Plan
- **Why**: Batch processing critical, 90-day storage for client access, API for workflow

**Accounting Firm (10+ clients):**
- **Typical need**: 100+ statements/month
- **Recommendation**: Business Plan
- **Why**: Unlimited processing, phone support for urgent issues, white-label for professional branding, dedicated account manager

**Individual (personal use):**
- **Typical need**: 1-3 statements/month
- **Recommendation**: Free Plan
- **Why**: Completely free, covers typical personal needs, can upgrade anytime if needs grow

### Common Upgrade Scenarios

**Free → Starter:**
- User hit 3-conversion limit
- Wants to store files for re-download
- Needs priority support

**Starter → Professional:**
- Processing 25+ statements regularly
- Needs batch processing
- Wants API integration
- Clients require advanced categorization

**Professional → Business:**
- Processing 100+ statements
- Needs unlimited conversions
- Requires phone support
- Wants white-label branding
- Multiple team members need access

**Annual Billing:**
- Any user committed long-term
- Wants to save 20%
- Processing statements regularly (not one-time use)
