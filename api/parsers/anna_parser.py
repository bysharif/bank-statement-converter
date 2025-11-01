"""
ANNA Bank Statement Parser
Handles multi-line transactions with Processed/Created dates
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


class ANNAParser(BaseBankParser):
    """Parser for ANNA Business Bank UK statements"""

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from ANNA statement"""
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
            transactions = self._parse_anna_text(all_text)

        except Exception as e:
            print(f"Error parsing ANNA PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_anna_text(self, text: str) -> List[Dict]:
        """Parse transactions from ANNA statement text using block-based approach"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        print(f"\n{'='*80}")
        print(f"ANNA PARSER - Processing {len(lines)} lines")
        print(f"{'='*80}\n")

        # Date pattern: DD MMM YYYY (e.g., "13 Nov 2024", "11 Oct 2024")
        date_pattern = r'(\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4})'

        # Amount pattern: numbers with optional commas and 2 decimal places
        amount_pattern = r'\d{1,5}(?:,\d{3})*\.\d{2}'

        # Transaction type codes
        type_codes = ['POS', 'FEE', 'DD', 'FP', 'P2P', 'ATM', 'TFR', 'SO']

        # Find header line
        header_idx = -1
        for i, line in enumerate(lines):
            if 'Processed on' in line and 'Created on' in line and 'Paid out' in line:
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

            # Skip footer lines
            if 'ANNA is an Electronic Money' in line or 'Page' in line and '/' in line:
                i += 1
                continue

            # Check if this line starts a transaction (two dates + type code)
            # Format: DD MMM YYYY DD MMM YYYY TYPE ...
            transaction_start_pattern = (
                r'^' + date_pattern + r'\s+' + date_pattern + r'\s+(' + '|'.join(type_codes) + r')\b'
            )
            match = re.match(transaction_start_pattern, line)

            if match:
                processed_date = match.group(1)
                created_date = match.group(2)
                tx_type = match.group(3)

                # Start a new block
                block_lines = [line]
                block_start_idx = i

                # Look ahead to collect description continuation and amounts
                j = i + 1
                found_amounts = bool(re.findall(amount_pattern, line))

                while j < len(lines):
                    next_line = lines[j]

                    # Stop if we hit another transaction (starts with date pattern)
                    if re.match(transaction_start_pattern, next_line):
                        break

                    # Stop if we hit footer
                    if 'ANNA is an Electronic Money' in next_line or ('Page' in next_line and '/' in next_line):
                        break

                    # Stop if we hit the header again (multi-page)
                    if 'Processed on' in next_line and 'Created on' in next_line:
                        break

                    # Add this line to current block
                    block_lines.append(next_line)

                    # Check if we found amounts (might be on continuation line)
                    if re.search(amount_pattern, next_line):
                        found_amounts = True
                        # Amounts found, this completes the transaction
                        j += 1
                        break

                    j += 1

                # Only create block if we have amounts
                if found_amounts:
                    blocks.append({
                        'lines': block_lines,
                        'processed_date': processed_date,
                        'created_date': created_date,
                        'type': tx_type,
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

        for block_num, block in enumerate(blocks, 1):
            transaction = self._parse_anna_transaction_block(
                block=block,
                block_num=block_num
            )

            if transaction:
                transactions.append(transaction)

        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])

        print(f"\n{'='*80}")
        print(f"✅ ANNA PARSER - Extracted {len(transactions)} transactions")
        print(f"{'='*80}\n")

        return transactions

    def _parse_anna_transaction_block(self, block: Dict, block_num: int) -> Dict:
        """Parse a transaction block into a transaction dictionary"""
        block_lines = block['lines']
        processed_date = block['processed_date']
        created_date = block['created_date']
        tx_type = block['type']

        # Combine all lines
        combined_text = ' '.join(block_lines)

        # Extract amounts
        amount_pattern = r'(\d{1,5}(?:,\d{3})*\.\d{2})'
        amounts = re.findall(amount_pattern, combined_text)

        if len(amounts) < 2:
            print(f"  ⚠️  Block {block_num}: Not enough amounts ({len(amounts)}), skipping")
            return None

        # ANNA format: ... PAID_OUT PAID_IN [BALANCE]
        # Balance column may or may not be present
        # The statement shows: "Paid out (£) Paid in (£) Balance (£)"
        #
        # If we have 2 amounts: PAID_OUT PAID_IN
        # If we have 3 amounts: PAID_OUT PAID_IN BALANCE (or might be embedded amounts)

        balance = None

        if len(amounts) == 2:
            # Simple case: just paid out and paid in
            paid_out_str = amounts[0].replace(',', '')
            paid_in_str = amounts[1].replace(',', '')
        elif len(amounts) >= 3:
            # Has balance or embedded amounts
            # ANNA format shows: PAID_OUT PAID_IN BALANCE
            # Use last 3 amounts
            paid_out_str = amounts[-3].replace(',', '')
            paid_in_str = amounts[-2].replace(',', '')
            balance_str = amounts[-1].replace(',', '')
            try:
                balance = float(balance_str)
            except:
                balance = None
        else:
            # Only one amount - shouldn't happen, but handle it
            print(f"  ⚠️  Block {block_num}: Only 1 amount found, skipping")
            return None

        paid_out = float(paid_out_str) if paid_out_str else 0.0
        paid_in = float(paid_in_str) if paid_in_str else 0.0

        # Extract description (remove dates, type code, and amounts)
        description = combined_text

        # Remove dates
        description = re.sub(r'\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}', '', description)

        # Remove type code at the start
        description = re.sub(r'\b(' + tx_type + r')\b', '', description, count=1)

        # Remove amounts
        for amount in amounts:
            description = description.replace(amount, '')

        # Remove £ symbols
        description = description.replace('£', '')

        # Clean description
        description = self._clean_anna_description(description)

        # Add type prefix for clarity
        type_names = {
            'POS': 'Card Payment',
            'FEE': 'Fee',
            'DD': 'Direct Debit',
            'FP': 'Faster Payment',
            'P2P': 'P2P Transfer',
            'ATM': 'ATM Withdrawal',
            'TFR': 'Transfer',
            'SO': 'Standing Order'
        }
        type_name = type_names.get(tx_type, tx_type)

        # Parse date (use created date as transaction date)
        # Format: DD MMM YYYY -> YYYY-MM-DD
        try:
            date_obj = datetime.strptime(created_date, '%d %b %Y')
            parsed_date = date_obj.strftime('%Y-%m-%d')
        except Exception as e:
            print(f"  ❌ Block {block_num}: Invalid date: {created_date} - {e}")
            return None

        # Determine debit/credit
        if paid_in > 0:
            debit = 0.0
            credit = paid_in
            tx_category = 'income'
        else:
            debit = paid_out
            credit = 0.0
            tx_category = 'expense'

        # Build final description
        final_description = f"{type_name} - {description}" if description else type_name

        transaction = {
            'date': parsed_date,
            'description': final_description,
            'debit': debit,
            'credit': credit,
            'balance': balance,
            'type': tx_category
        }

        # Log the transaction
        amount_display = f"£{credit:.2f}" if credit > 0 else f"-£{debit:.2f}"
        balance_display = f"£{balance:.2f}" if balance else "N/A"
        print(f"  ✅ Block {block_num}: {parsed_date} | {final_description[:40]:40} | {amount_display:>12} | Balance: {balance_display}")

        return transaction

    def _clean_anna_description(self, text: str) -> str:
        """Clean ANNA transaction description"""
        if not text:
            return ""

        cleaned = text

        # Remove common ANNA patterns
        cleaned = re.sub(r'ANNA Subscription,?\s*', '', cleaned, flags=re.IGNORECASE)

        # Remove invoice/reference numbers
        cleaned = re.sub(r'\bINV\d+\b', '', cleaned)
        cleaned = re.sub(r'\b[A-Z]{2,}\d{6,}\b', '', cleaned)  # e.g., GP01212751-000010

        # Remove extra spaces
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()

        # Remove leading/trailing punctuation
        cleaned = cleaned.strip('.,;:- ')

        return cleaned if cleaned else "Transaction"
