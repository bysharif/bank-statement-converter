"""
Santander Bank Statement Parser
Handles multi-line transactions with Credits/Debits/Balance columns
"""
import pdfplumber
import re
from typing import List, Dict
from datetime import datetime
import sys
import os

# Handle imports
try:
    from .base_parser import BaseBankParser
    from ..utils import clean_description
except ImportError:
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from parsers.base_parser import BaseBankParser
    from utils import clean_description


class SantanderParser(BaseBankParser):
    """Parser for Santander UK Business Bank statements"""

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from Santander statement"""
        transactions = []

        try:
            # Extract text from all pages
            all_text = ''
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + '\n'

            # Parse transactions
            transactions = self._parse_santander_text(all_text)

        except Exception as e:
            print(f"Error parsing Santander PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_santander_text(self, text: str) -> List[Dict]:
        """Parse transactions from Santander statement text using block-based approach"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        print(f"\n{'='*80}")
        print(f"SANTANDER PARSER - Processing {len(lines)} lines")
        print(f"{'='*80}\n")

        # Date pattern: 3rd Dec, 10th Dec, etc.
        date_pattern = r'^(\d{1,2}(?:st|nd|rd|th)\s+[A-Z][a-z]{2})\s+'

        # Amount pattern: numbers with optional commas and 2 decimal places
        amount_pattern = r'\d{1,5}(?:,\d{3})*\.\d{2}'

        # Find header line
        header_idx = -1
        for i, line in enumerate(lines):
            if 'Date' in line and 'Description' in line and 'Credits' in line and 'Debits' in line:
                header_idx = i
                print(f"✅ Found header at line {i}: {line}")
                break

        if header_idx == -1:
            print("❌ No header found")
            return transactions

        # PHASE 1: Group lines into transaction blocks
        print("\n📦 PHASE 1: Grouping lines into transaction blocks...")
        blocks = []
        i = header_idx + 1

        while i < len(lines):
            line = lines[i]

            # Skip footer/summary lines
            if 'Previous statement balance' in line or 'Total credits' in line or 'Total debits' in line:
                i += 1
                continue

            # Skip "Current statement balance" line (end of transactions)
            if 'Current statement balance' in line:
                break

            # Check if this line starts a transaction (has a date)
            date_match = re.match(date_pattern, line)

            if date_match:
                # Start a new transaction block
                block_lines = [line]
                block_start_idx = i

                # Look ahead to collect description continuation and amounts
                j = i + 1
                found_amounts = bool(re.findall(amount_pattern, line))

                while j < len(lines):
                    next_line = lines[j]

                    # Stop if we hit another transaction (starts with date)
                    if re.match(date_pattern, next_line):
                        break

                    # Stop if we hit header or summary lines
                    if 'Date' in next_line and 'Description' in next_line:
                        break
                    if 'Previous statement balance' in next_line or 'Total credits' in next_line:
                        break

                    # Add this line to current block
                    block_lines.append(next_line)

                    # Check if we found amounts
                    if re.search(amount_pattern, next_line):
                        found_amounts = True
                        # Continue for one more line to potentially get balance
                        j += 1
                        # Check if next line is just balance
                        if j < len(lines) and not re.match(date_pattern, lines[j]):
                            potential_balance = lines[j].strip()
                            if re.match(r'^-?\d{1,5}(?:,\d{3})*\.\d{2}$', potential_balance):
                                block_lines.append(potential_balance)
                                j += 1
                        break

                    j += 1

                # Only create block if we have amounts
                if found_amounts:
                    blocks.append({
                        'lines': block_lines,
                        'date_str': date_match.group(1),
                        'start_idx': block_start_idx,
                        'end_idx': j - 1
                    })

                    print(f"  📦 Block {len(blocks)}: {len(block_lines)} lines (idx {block_start_idx}-{j-1})")
                    for idx, bl in enumerate(block_lines):
                        print(f"      L{idx+1}: {bl[:70]}")

                # Move to next block
                i = j
            else:
                # Not a transaction start, skip
                i += 1

        print(f"\n✅ Created {len(blocks)} transaction blocks\n")

        # PHASE 2: Parse each block into a transaction
        print("🔍 PHASE 2: Parsing each block into transactions...\n")

        # Need to infer year from statement date
        # Look for year in statement header
        current_year = datetime.now().year
        for line in lines[:30]:
            # Look for patterns like "2024" or date ranges
            year_match = re.search(r'\b(20\d{2})\b', line)
            if year_match:
                current_year = int(year_match.group(1))
                break

        # Track previous month to detect year rollover (Dec -> Jan)
        previous_month = None

        for block_num, block in enumerate(blocks, 1):
            # Get month from date_str
            date_str = block['date_str']
            day_match = re.match(r'(\d{1,2})(?:st|nd|rd|th)\s+([A-Z][a-z]{2})', date_str)
            if day_match:
                month_abbr = day_match.group(2)
                month_map = {
                    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                }
                current_month = month_map.get(month_abbr, 1)

                # Detect year rollover: if we go from Dec (12) to Jan (1), increment year
                if previous_month == 12 and current_month == 1:
                    current_year += 1
                    print(f"  📅 Year rollover detected: Dec -> Jan, incrementing year to {current_year}")

                previous_month = current_month

            transaction = self._parse_santander_transaction_block(
                block=block,
                block_num=block_num,
                year=current_year
            )

            if transaction:
                transactions.append(transaction)

        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])

        print(f"\n{'='*80}")
        print(f"✅ SANTANDER PARSER - Extracted {len(transactions)} transactions")
        print(f"{'='*80}\n")

        return transactions

    def _parse_santander_transaction_block(self, block: Dict, block_num: int, year: int) -> Dict:
        """Parse a transaction block into a transaction dictionary"""
        block_lines = block['lines']
        date_str = block['date_str']

        # Combine all lines
        combined_text = ' '.join(block_lines)

        # Extract amounts
        amount_pattern = r'(\d{1,5}(?:,\d{3})*\.\d{2})'
        amounts = re.findall(amount_pattern, combined_text)

        if len(amounts) < 1:
            print(f"  ⚠️  Block {block_num}: No amounts found, skipping")
            return None

        # Santander format: DESCRIPTION [CREDIT] [DEBIT] BALANCE
        # Or: DESCRIPTION [CREDIT] [DEBIT]
        # Or: DESCRIPTION [AMOUNT] BALANCE (single amount could be credit or debit)

        credit = 0.0
        debit = 0.0
        balance = None

        # Parse amounts based on context
        if len(amounts) == 1:
            # Single amount - need to determine if credit or debit from description
            amount_val = float(amounts[0].replace(',', ''))

            # Check keywords for income/credit
            if any(keyword in combined_text.upper() for keyword in [
                'RECEIPT', 'TRANSFER FROM', 'BANK GIRO CREDIT', 'CREDIT REF'
            ]):
                credit = amount_val
            else:
                debit = amount_val

        elif len(amounts) == 2:
            # Two amounts: could be CREDIT/DEBIT or AMOUNT/BALANCE
            # Check if description suggests one type
            has_credit_keyword = any(keyword in combined_text.upper() for keyword in [
                'RECEIPT', 'TRANSFER FROM', 'BANK GIRO CREDIT', 'CREDIT REF'
            ])
            has_debit_keyword = any(keyword in combined_text.upper() for keyword in [
                'PAYMENT TO', 'DIRECT DEBIT', 'CARD PAYMENT', 'BILL PAYMENT'
            ])

            if has_credit_keyword and not has_debit_keyword:
                # First is credit, second is balance
                credit = float(amounts[0].replace(',', ''))
                balance = float(amounts[1].replace(',', ''))
            elif has_debit_keyword and not has_credit_keyword:
                # First is debit, second is balance
                debit = float(amounts[0].replace(',', ''))
                balance = float(amounts[1].replace(',', ''))
            else:
                # Ambiguous - assume first is transaction, second is balance
                # Default to debit unless credit keyword found
                if has_credit_keyword:
                    credit = float(amounts[0].replace(',', ''))
                else:
                    debit = float(amounts[0].replace(',', ''))
                balance = float(amounts[1].replace(',', ''))

        elif len(amounts) >= 3:
            # Three or more amounts: CREDIT DEBIT BALANCE
            # In Santander, typically credit and debit columns are shown separately
            # Last amount is usually balance
            balance = float(amounts[-1].replace(',', ''))

            # Check if we have both credit and debit
            # Usually one will be present and other will be missing (shown as blank in PDF)
            # Since we only see amounts, we need to infer from description
            has_credit_keyword = any(keyword in combined_text.upper() for keyword in [
                'RECEIPT', 'TRANSFER FROM', 'BANK GIRO CREDIT', 'CREDIT REF'
            ])

            if has_credit_keyword:
                credit = float(amounts[-2].replace(',', ''))
            else:
                debit = float(amounts[-2].replace(',', ''))

        # Extract description (remove date and amounts)
        description = combined_text

        # Remove date
        description = re.sub(r'\d{1,2}(?:st|nd|rd|th)\s+[A-Z][a-z]{2}', '', description)

        # Remove amounts
        for amount in amounts:
            description = description.replace(amount, '')

        # Clean description
        description = self._clean_santander_description(description)

        # Parse date (3rd Dec -> YYYY-MM-DD)
        try:
            # Extract day and month
            day_match = re.match(r'(\d{1,2})(?:st|nd|rd|th)\s+([A-Z][a-z]{2})', date_str)
            if day_match:
                day = int(day_match.group(1))
                month_abbr = day_match.group(2)

                # Convert month abbreviation to number
                month_map = {
                    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                }
                month = month_map.get(month_abbr, 1)

                date_obj = datetime(year, month, day)
                parsed_date = date_obj.strftime('%Y-%m-%d')
            else:
                raise ValueError(f"Could not parse date: {date_str}")
        except Exception as e:
            print(f"  ❌ Block {block_num}: Invalid date: {date_str} - {e}")
            return None

        # Determine transaction type
        if credit > 0:
            tx_type = 'income'
        else:
            tx_type = 'expense'

        transaction = {
            'date': parsed_date,
            'description': description,
            'debit': debit,
            'credit': credit,
            'balance': balance,
            'type': tx_type
        }

        # Log the transaction
        amount_display = f"£{credit:.2f}" if credit > 0 else f"-£{debit:.2f}"
        balance_display = f"£{balance:.2f}" if balance else "N/A"
        print(f"  ✅ Block {block_num}: {parsed_date} | {description[:40]:40} | {amount_display:>12} | Balance: {balance_display}")

        return transaction

    def _clean_santander_description(self, text: str) -> str:
        """Clean Santander transaction description"""
        if not text:
            return ""

        cleaned = text

        # Extract key parts and create readable description
        # Handle different transaction types

        # Direct Debit
        if 'DIRECT DEBIT PAYMENT TO' in cleaned:
            cleaned = re.sub(r'DIRECT DEBIT PAYMENT TO\s+', 'Direct Debit - ', cleaned)
            cleaned = re.sub(r'\s*REF\s+', ' Ref: ', cleaned)
            cleaned = re.sub(r',?\s*MANDATE NO\s+\d+', '', cleaned)

        # Bill Payment (Faster Payment)
        elif 'BILL PAYMENT VIA FASTER PAYMENT TO' in cleaned:
            cleaned = re.sub(r'BILL PAYMENT VIA FASTER PAYMENT TO\s+', 'Faster Payment - ', cleaned)
            cleaned = re.sub(r'\s*REFERENCE\s+', ' Ref: ', cleaned)
            cleaned = re.sub(r',?\s*MANDATE NO\s+\d+', '', cleaned)

        # Card Payment
        elif 'CARD PAYMENT TO' in cleaned:
            cleaned = re.sub(r'CARD PAYMENT TO\s+', 'Card Payment - ', cleaned)
            cleaned = re.sub(r'\s+ON\s+\d{2}-\d{2}-\d{4}', '', cleaned)

        # Bank Giro Credit
        elif 'BANK GIRO CREDIT' in cleaned:
            cleaned = re.sub(r'BANK GIRO CREDIT\s+REF\s+', 'Bank Giro - ', cleaned)

        # Faster Payments Receipt
        elif 'FASTER PAYMENTS RECEIPT' in cleaned:
            cleaned = re.sub(r'FASTER PAYMENTS RECEIPT\s+REF\.?', 'Received from', cleaned)
            cleaned = re.sub(r'\s+FROM\s+', ' - ', cleaned)

        # Transfer
        elif 'TRANSFER FROM' in cleaned:
            cleaned = re.sub(r'TRANSFER FROM\s+', 'Transfer from ', cleaned)

        # Remove extra reference codes
        cleaned = re.sub(r'\b[A-Z]{3}\d{12,}\b', '', cleaned)  # e.g., EMS163120219005601

        # Remove extra spaces and punctuation
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()
        cleaned = cleaned.strip('.,;:- ')

        return cleaned if cleaned else "Transaction"
