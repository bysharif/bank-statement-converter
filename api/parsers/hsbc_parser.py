"""
HSBC Bank Statement Parser
Handles multi-line transactions with clear payment in/out columns
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


class HSBCParser(BaseBankParser):
    """Parser for HSBC Bank UK statements"""

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from HSBC statement"""
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
            transactions = self._parse_hsbc_text(all_text)

        except Exception as e:
            print(f"Error parsing HSBC PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_hsbc_text(self, text: str) -> List[Dict]:
        """Parse transactions from HSBC statement text using block-based approach"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        print(f"\n{'='*80}")
        print(f"HSBC PARSER V2 - Processing {len(lines)} lines")
        print(f"{'='*80}\n")

        # Date pattern: DD MMM YY (e.g., "04 Mar 24", "08 Mar 24", "01 Nov 24")
        date_pattern = r'^(\d{2}\s+[A-Z][a-z]{2}\s+\d{2})\s+'

        # Amount pattern: numbers with optional commas and 2 decimal places
        amount_pattern = r'\d{1,5}(?:,\d{3})*\.\d{2}'

        # Find header line
        header_idx = -1
        for i, line in enumerate(lines):
            if 'Date' in line and 'Payment type' in line and 'Balance' in line:
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
        last_date = None  # Track the last date we saw for same-date transactions

        while i < len(lines):
            line = lines[i]

            # Skip balance forward/carried lines
            if 'BALANCE' in line.upper() and ('FORWARD' in line.upper() or 'CARRIED' in line.upper()):
                print(f"  ⏭️  Skipping: {line}")
                i += 1
                continue

            # Check if this line starts a new transaction (has a date)
            date_match = re.match(date_pattern, line)

            # Also check if this line starts with a transaction type (same-date transaction)
            type_code_pattern = r'^(DD|SO|ATM|VIS|CR|BP|FPI|FPO|BGC|CHQ|CPT|TFR)\s+'
            type_match = re.match(type_code_pattern, line) if not date_match else None

            if date_match or (type_match and last_date):
                # Start a new transaction block
                block_start_idx = i

                # Extract or use the date
                if date_match:
                    current_date = date_match.group(1)
                    last_date = current_date
                    block_lines = [line]
                else:
                    # Same-date transaction - use previous date
                    current_date = last_date
                    # Prepend date to the line for consistency
                    block_lines = [f"{current_date}  {line}"]

                # Look ahead to collect continuation lines
                j = i + 1
                found_amount = bool(re.search(amount_pattern, line))

                while j < len(lines):
                    next_line = lines[j]

                    # Stop if we hit another date (new transaction)
                    if re.match(date_pattern, next_line):
                        break

                    # Stop if we hit a balance forward/carried line
                    if 'BALANCE' in next_line.upper() and ('FORWARD' in next_line.upper() or 'CARRIED' in next_line.upper()):
                        break

                    # Check if this line starts with a transaction type (DD, SO, ATM, etc.)
                    # This indicates a new transaction on the same date
                    type_code_pattern = r'^(DD|SO|ATM|VIS|CR|BP|FPI|FPO|BGC|CHQ|CPT|TFR)\s+'
                    if re.match(type_code_pattern, next_line):
                        # This is a new transaction, don't include it in current block
                        break

                    # Add this line to the current block
                    block_lines.append(next_line)

                    # Check if this line has amounts
                    if re.search(amount_pattern, next_line):
                        found_amount = True
                        # Continue one more line to check for balance if needed
                        j += 1

                        # Look one more line ahead for a potential balance line
                        if j < len(lines) and not re.match(date_pattern, lines[j]):
                            potential_balance_line = lines[j]
                            # If next line is just a number, it might be the balance
                            if re.match(r'^\d{1,5}(?:,\d{3})*\.\d{2}\s*$', potential_balance_line):
                                block_lines.append(potential_balance_line)
                                j += 1
                        break

                    j += 1

                # Only create block if we found at least one amount
                if found_amount or len(block_lines) > 1:
                    # Store the block
                    blocks.append({
                        'lines': block_lines,
                        'start_idx': block_start_idx,
                        'end_idx': j - 1
                    })

                    print(f"  📦 Block {len(blocks)}: {len(block_lines)} lines (idx {block_start_idx}-{j-1})")
                    for idx, bl in enumerate(block_lines):
                        print(f"      L{idx+1}: {bl[:70]}")

                # Move to next block
                i = j
            else:
                # Orphan line (shouldn't happen with proper blocks, but skip it)
                i += 1

        print(f"\n✅ Created {len(blocks)} transaction blocks\n")

        # PHASE 2: Parse each block into a transaction
        print("🔍 PHASE 2: Parsing each block into transactions...\n")

        for block_num, block in enumerate(blocks, 1):
            block_lines = block['lines']

            if not block_lines:
                continue

            # Extract date from first line
            first_line = block_lines[0]
            date_match = re.match(date_pattern, first_line)

            if not date_match:
                print(f"  ❌ Block {block_num}: No date found in first line")
                continue

            date_str = date_match.group(1)
            after_date = first_line[len(date_str):].strip()

            # Combine all lines for description extraction
            combined_text = ' '.join(block_lines)

            # Find amounts in the combined text
            amounts = re.findall(amount_pattern, combined_text)

            if len(amounts) < 1:
                print(f"  ⚠️  Block {block_num}: No amounts found, skipping")
                continue

            # Build description from all lines except amounts
            description_parts = []

            # Add transaction type from first line (after date)
            if after_date:
                description_parts.append(after_date)

            # Add merchant/description from middle lines (lines without amounts on their own)
            for line_idx, line in enumerate(block_lines[1:], 1):
                # Check if this line is just amounts (skip it for description)
                line_without_amounts = re.sub(amount_pattern, '', line).strip()
                line_without_amounts = re.sub(r'£', '', line_without_amounts).strip()

                # If there's meaningful text left, add it
                if line_without_amounts and len(line_without_amounts) > 2:
                    description_parts.append(line_without_amounts)

            # Combine description parts
            full_description = ' '.join(description_parts)

            # Parse the transaction
            transaction = self._parse_hsbc_transaction_block(
                date_str=date_str,
                description=full_description,
                amounts=amounts,
                block_num=block_num
            )

            if transaction:
                transactions.append(transaction)

        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])

        print(f"\n{'='*80}")
        print(f"✅ HSBC PARSER V2 - Extracted {len(transactions)} transactions")
        print(f"{'='*80}\n")

        return transactions

    def _parse_hsbc_transaction_block(self, date_str: str, description: str, amounts: list, block_num: int) -> Dict:
        """Parse a transaction block into a transaction dictionary"""
        # HSBC format: amounts can be:
        # 1 amount: TRANSACTION_AMOUNT (no balance shown)
        # 2 amounts: TRANSACTION_AMOUNT BALANCE
        # 3 amounts: PAID_OUT PAID_IN BALANCE
        # Balance is always last (if present)

        # Determine paid in/out
        paid_out = 0.0
        paid_in = 0.0
        balance = None

        if len(amounts) == 1:
            # Only transaction amount, no balance
            transaction_amount_str = amounts[0].replace(',', '')
            transaction_amount = float(transaction_amount_str)

            # Determine if it's paid in or paid out
            # Check keywords indicating income/credit
            if any(keyword in description.upper() for keyword in [' CR ', 'WAGES', 'SALARY', 'DEPOSIT', 'TRANSFER IN', 'CREDIT', 'PAYMENT IN']):
                paid_in = transaction_amount
            else:
                # Default to debit (payment out)
                paid_out = transaction_amount

            # No balance available
            balance = None

        elif len(amounts) == 2:
            # One transaction amount + balance
            transaction_amount_str = amounts[0].replace(',', '')
            balance_str = amounts[1].replace(',', '')

            transaction_amount = float(transaction_amount_str)
            balance = float(balance_str)

            # Determine if it's paid in or paid out
            # Check keywords indicating income/credit
            if any(keyword in description.upper() for keyword in [' CR ', 'WAGES', 'SALARY', 'DEPOSIT', 'TRANSFER IN', 'CREDIT']):
                paid_in = transaction_amount
            else:
                # Default to debit (payment out)
                paid_out = transaction_amount

        elif len(amounts) == 3:
            # Three amounts: paid_out, paid_in, balance
            # Usually one of paid_out or paid_in will be 0.00
            balance_str = amounts[2].replace(',', '')
            balance = float(balance_str)

            try:
                amt1 = float(amounts[0].replace(',', ''))
                amt2 = float(amounts[1].replace(',', ''))

                # If first amount > 0, it's usually paid out
                # If second amount > 0, it's usually paid in
                if amt1 > 0:
                    paid_out = amt1
                if amt2 > 0:
                    paid_in = amt2
            except:
                pass

        elif len(amounts) > 3:
            # More than 3 amounts - try to get last 3
            balance_str = amounts[-1].replace(',', '')
            balance = float(balance_str)

            try:
                paid_out = float(amounts[-3].replace(',', ''))
            except:
                paid_out = 0.0

            try:
                paid_in = float(amounts[-2].replace(',', ''))
            except:
                paid_in = 0.0

        # Remove amounts from description
        clean_description = description
        for amount in amounts:
            clean_description = clean_description.replace(amount, '')
        clean_description = clean_description.replace('£', '')

        # Clean description
        clean_description = self._clean_hsbc_description(clean_description)

        # Parse date (DD MMM YY -> YYYY-MM-DD)
        try:
            date_obj = datetime.strptime(date_str, '%d %b %y')
            parsed_date = date_obj.strftime('%Y-%m-%d')
        except:
            print(f"  ❌ Block {block_num}: Invalid date: {date_str}")
            return None

        # Determine debit/credit and type
        if paid_in > 0:
            debit = 0.0
            credit = paid_in
            tx_type = 'income'
        else:
            debit = paid_out
            credit = 0.0
            tx_type = 'expense'

        transaction = {
            'date': parsed_date,
            'description': clean_description,
            'debit': debit,
            'credit': credit,
            'balance': balance,
            'type': tx_type
        }

        # Log the transaction
        amount_display = f"£{credit:.2f}" if credit > 0 else f"-£{debit:.2f}"
        balance_display = f"£{balance:.2f}" if balance else "N/A"
        print(f"  ✅ Block {block_num}: {parsed_date} | {clean_description[:40]:40} | {amount_display:>12} | Balance: {balance_display}")

        return transaction

    def _clean_hsbc_description(self, text: str) -> str:
        """Clean HSBC transaction description"""
        if not text:
            return ""

        cleaned = text

        # First, handle special patterns before type mapping
        # Clean up common HSBC patterns
        cleaned = re.sub(r'CASH\s+LLOYTSB', '', cleaned)
        cleaned = re.sub(r'CASHPOINT', 'ATM', cleaned)

        # Map transaction type codes to readable names
        # But only if they appear at the start or isolated
        type_mappings = {
            r'^DD\s+': 'Direct Debit - ',
            r'^SO\s+': 'Standing Order - ',
            r'^ATM/VIS\s+': 'Card Payment - ',
            r'^ATM\s+': 'ATM - ',
            r'^VIS\s+': 'Card Payment - ',
            r'^BP\s+': 'Bill Payment - ',
            r'^FPI\s+': 'Faster Payment In - ',
            r'^FPO\s+': 'Faster Payment Out - ',
            r'^BGC\s+': 'Bank Giro Credit - ',
            r'^CHQ\s+': 'Cheque - ',
            r'^CPT\s+': 'Card Payment - ',
            r'^TFR\s+': 'Transfer - ',
            r'^CR\s+': 'Credit - ',
        }

        # Apply type mappings
        for pattern, replacement in type_mappings.items():
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        # Remove duplicate "ATM Withdrawal" patterns
        cleaned = re.sub(r'ATM\s+-\s+ATM Withdrawal', 'ATM', cleaned)
        cleaned = re.sub(r'ATM Withdrawal\s+-\s+ATM Withdrawal', 'ATM Withdrawal', cleaned)

        # Remove standalone type codes if they appear alone at the start
        cleaned = re.sub(r'^(DD|SO|ATM|VIS|CR|BP|FPI|FPO|BGC|CHQ|CPT|TFR|ATM/VIS)\s*$', 'Transaction', cleaned)

        # Remove reference numbers that are too long
        cleaned = re.sub(r'\b\d{10,}\b', '', cleaned)

        # Remove date patterns like "MAR27" or "APR02" at the end
        cleaned = re.sub(r'\b[A-Z]{3}\d{1,2}\b', '', cleaned)

        # Remove time patterns like "@15:15"
        cleaned = re.sub(r'@\d{2}:\d{2}', '', cleaned)

        # Remove extra spaces
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()

        # Remove leading/trailing punctuation
        cleaned = cleaned.strip('.,;:- ')

        # If description is just "Direct Debit -" or similar, make it generic
        if re.match(r'^(Direct Debit|Standing Order|Card Payment|ATM|Transfer|Credit|Bill Payment)\s*-?\s*$', cleaned):
            return cleaned.replace(' -', '')

        return cleaned if cleaned else "Transaction"
