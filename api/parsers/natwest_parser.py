"""
NatWest Bank Statement Parser
Handles table-based transactions with multi-row descriptions
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


class NatWestParser(BaseBankParser):
    """Parser for NatWest UK Bank statements"""

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from NatWest statement"""
        transactions = []

        try:
            # Extract tables from all pages
            all_tables = []
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    tables = page.extract_tables()
                    if tables:
                        # Usually the transaction table is the last or largest table
                        for table in tables:
                            if table and len(table) > 0:
                                # Check if this looks like a transaction table
                                header = table[0] if table[0] else []
                                if any('Date' in str(cell) for cell in header if cell):
                                    all_tables.extend(table[1:])  # Skip header row

            # Parse transactions from combined tables
            transactions = self._parse_natwest_tables(all_tables)

        except Exception as e:
            print(f"Error parsing NatWest PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_natwest_tables(self, rows: List[List]) -> List[Dict]:
        """Parse transactions from NatWest table rows"""
        transactions = []

        print(f"\n{'='*80}")
        print(f"NATWEST PARSER - Processing {len(rows)} table rows")
        print(f"{'='*80}\n")

        # Group rows into transaction blocks
        print("📦 Grouping rows into transaction blocks...\n")
        blocks = []
        current_block = None

        for row_idx, row in enumerate(rows):
            # Skip empty rows
            if not row or len(row) < 6:
                continue

            date, tx_type, description, paid_in, paid_out, balance = row[:6]

            # Check if this starts a new transaction (has a date)
            if date and date.strip():
                # Save previous block if exists
                if current_block:
                    blocks.append(current_block)

                # Start new block
                current_block = {
                    'date': date.strip(),
                    'type_parts': [tx_type.strip() if tx_type else ''],
                    'description_parts': [description.strip() if description else ''],
                    'paid_in': paid_in.strip() if paid_in else '',
                    'paid_out': paid_out.strip() if paid_out else '',
                    'balance': balance.strip() if balance else '',
                    'row_start': row_idx,
                    'row_end': row_idx
                }
            elif current_block:
                # Continuation of current transaction (no date)
                current_block['row_end'] = row_idx

                # Append type if present
                if tx_type and tx_type.strip():
                    current_block['type_parts'].append(tx_type.strip())

                # Append description if present
                if description and description.strip():
                    current_block['description_parts'].append(description.strip())

                # Update amounts if present (sometimes amounts are on continuation rows)
                if paid_in and paid_in.strip():
                    current_block['paid_in'] = paid_in.strip()
                if paid_out and paid_out.strip():
                    current_block['paid_out'] = paid_out.strip()
                if balance and balance.strip():
                    current_block['balance'] = balance.strip()

        # Add last block
        if current_block:
            blocks.append(current_block)

        print(f"✅ Created {len(blocks)} transaction blocks\n")

        # Parse each block into a transaction
        print("🔍 Parsing each block into transactions...\n")

        for block_num, block in enumerate(blocks, 1):
            transaction = self._parse_natwest_transaction_block(block, block_num)
            if transaction:
                transactions.append(transaction)

        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])

        print(f"\n{'='*80}")
        print(f"✅ NATWEST PARSER - Extracted {len(transactions)} transactions")
        print(f"{'='*80}\n")

        return transactions

    def _parse_natwest_transaction_block(self, block: Dict, block_num: int) -> Dict:
        """Parse a transaction block into a transaction dictionary"""
        date_str = block['date']

        # Combine multi-line type and description
        tx_type = ' '.join(block['type_parts']).strip()
        description = ' '.join(block['description_parts']).strip()

        paid_in_str = block['paid_in']
        paid_out_str = block['paid_out']
        balance_str = block['balance']

        # Skip "BROUGHT FORWARD" entries
        if 'BROUGHT FORWARD' in description.upper():
            return None

        # Parse amounts
        paid_in = 0.0
        paid_out = 0.0
        balance = None

        if paid_in_str:
            # Remove £ and , symbols
            paid_in_clean = paid_in_str.replace('£', '').replace(',', '').strip()
            try:
                paid_in = float(paid_in_clean)
            except:
                pass

        if paid_out_str:
            # Remove £ and , symbols
            paid_out_clean = paid_out_str.replace('£', '').replace(',', '').strip()
            try:
                paid_out = float(paid_out_clean)
            except:
                pass

        if balance_str:
            # Remove £ and , symbols
            balance_clean = balance_str.replace('£', '').replace(',', '').strip()
            try:
                balance = float(balance_clean)
            except:
                pass

        # Parse date: "2 Mar 2023" -> YYYY-MM-DD
        try:
            date_obj = datetime.strptime(date_str, '%d %b %Y')
            parsed_date = date_obj.strftime('%Y-%m-%d')
        except:
            # Try without leading zero
            try:
                date_obj = datetime.strptime(date_str, '%-d %b %Y')
                parsed_date = date_obj.strftime('%Y-%m-%d')
            except Exception as e:
                print(f"  ❌ Block {block_num}: Invalid date: {date_str} - {e}")
                return None

        # Clean description
        cleaned_description = self._clean_natwest_description(description, tx_type)

        # Determine transaction type
        if paid_in > 0:
            debit = 0.0
            credit = paid_in
            tx_category = 'income'
        else:
            debit = paid_out
            credit = 0.0
            tx_category = 'expense'

        transaction = {
            'date': parsed_date,
            'description': cleaned_description,
            'debit': debit,
            'credit': credit,
            'balance': balance,
            'type': tx_category
        }

        # Log the transaction
        amount_display = f"£{credit:.2f}" if credit > 0 else f"-£{debit:.2f}"
        balance_display = f"£{balance:.2f}" if balance else "N/A"
        print(f"  ✅ Block {block_num}: {parsed_date} | {cleaned_description[:40]:40} | {amount_display:>12} | Balance: {balance_display}")

        return transaction

    def _clean_natwest_description(self, description: str, tx_type: str) -> str:
        """Clean NatWest transaction description"""
        if not description:
            return tx_type if tx_type else "Transaction"

        cleaned = description

        # Add transaction type as prefix for clarity
        type_prefix = ""
        if "DEBIT CARD" in tx_type.upper():
            type_prefix = "Card Payment"
        elif "MOBILE/ONLINE" in tx_type.upper():
            type_prefix = "Online Transfer"
        elif "AUTOMATED CREDIT" in tx_type.upper():
            type_prefix = "Credit"
        elif "DIRECT DEBIT" in tx_type.upper():
            type_prefix = "Direct Debit"
        elif "STANDING ORDER" in tx_type.upper():
            type_prefix = "Standing Order"
        elif "REFUND" in tx_type.upper():
            type_prefix = "Refund"

        # Remove card reference numbers (e.g., "7411 28FEB23 CD ,")
        cleaned = re.sub(r'\d{4}\s+\d{2}[A-Z]{3}\d{2}\s*(?:CD|D)?\s*,?\s*', '', cleaned)

        # Clean up "FROM A/C" patterns
        cleaned = re.sub(r'FROM A/C \d+\s*,\s*', '', cleaned)

        # Remove "VIA MOBILE XFER" patterns
        cleaned = re.sub(r',?\s*VIA MOBILE XFER', '', cleaned)

        # Remove reference numbers (e.g., "230302233756693309", "600000001091916685")
        cleaned = re.sub(r'\b\d{12,}\b', '', cleaned)

        # Remove "FP XX/XX/XX XXXX" patterns (Faster Payment references)
        cleaned = re.sub(r',?\s*FP\s+\d{2}/\d{2}/\d{2}\s+\d+', '', cleaned)

        # Remove extra commas and spaces
        cleaned = re.sub(r'\s*,\s*,\s*', ', ', cleaned)
        cleaned = re.sub(r'\s+,\s+', ', ', cleaned)
        cleaned = re.sub(r',\s*$', '', cleaned)
        cleaned = re.sub(r'^\s*,\s*', '', cleaned)

        # Remove extra spaces
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()

        # Remove leading/trailing punctuation
        cleaned = cleaned.strip('.,;:- ')

        # Build final description
        if type_prefix and cleaned:
            final = f"{type_prefix} - {cleaned}"
        elif type_prefix:
            final = type_prefix
        elif cleaned:
            final = cleaned
        else:
            final = "Transaction"

        return final
