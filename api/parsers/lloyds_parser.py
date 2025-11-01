"""
Lloyds Bank Statement Parser v2
Improved version with better merchant name extraction and multi-line handling
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


class LloydsParser(BaseBankParser):
    """Parser for Lloyds Bank UK statements"""

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from Lloyds statement"""
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
            transactions = self._parse_lloyds_text(all_text)

        except Exception as e:
            print(f"Error parsing Lloyds PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_lloyds_text(self, text: str) -> List[Dict]:
        """Parse transactions from Lloyds statement text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        print(f"\n{'='*80}")
        print(f"LLOYDS PARSER V3 - Processing {len(lines)} lines")
        print(f"{'='*80}\n")

        # Date pattern: DD MMM YY (e.g., "06 JUN 25", "09 JUL 25")
        # Also handle OCR errors like "D2ate 9 JUL 25"
        date_pattern = r'(\d{2}\s+[A-Z]{3}\s+\d{2})'
        ocr_date_pattern = r'D2ate\s+(\d+)\s+([A-Z]{3})\s+(\d{2})'

        # First pass: Group lines into transaction blocks
        # Each block starts with a date and includes up to 4 following non-date lines
        blocks = []
        i = 0
        while i < len(lines):
            line = lines[i]

            # Check if line contains a date (normal or OCR error)
            date_match = re.search(date_pattern, line)
            ocr_match = re.search(ocr_date_pattern, line)

            if date_match or ocr_match:
                # Start a new block
                block_lines = [line]

                # Look ahead up to 4 lines for continuation (merchant, type, amounts)
                j = i + 1
                while j < len(lines) and j < i + 5:
                    next_line = lines[j]
                    # Stop if we hit another date line (normal or OCR)
                    if re.search(date_pattern, next_line) or re.search(ocr_date_pattern, next_line):
                        break
                    block_lines.append(next_line)
                    j += 1

                blocks.append({
                    'lines': block_lines,
                    'start_index': i,
                    'preview': block_lines[0][:70] if block_lines else ''
                })
                i = j  # Skip the lines we consumed
            else:
                i += 1

        print(f"  Found {len(blocks)} potential transaction blocks\n")

        # Second pass: Parse each block
        for block in blocks:
            combined_text = ' '.join(block['lines'])

            # Extract date (try normal pattern first, then OCR pattern)
            date_match = re.search(date_pattern, combined_text)
            ocr_match = re.search(ocr_date_pattern, combined_text)

            if date_match:
                date_str = date_match.group(1)
            elif ocr_match:
                # Convert OCR format "D2ate 9 JUL 25" to "09 JUL 25"
                day = ocr_match.group(1).zfill(2)  # Pad with zero if needed
                month = ocr_match.group(2)
                year = ocr_match.group(3)
                date_str = f"{day} {month} {year}"
                date_match = ocr_match  # Use for position reference
            else:
                continue

            # Extract merchant name
            # Try to get text after date but before account number/type codes/amounts
            after_date = combined_text[date_match.end():].strip()

            merchant_part = after_date
            # Remove account numbers first
            merchant_part = re.sub(r'\b\d{10,}\b', ' ', merchant_part)
            # Split at type codes
            type_match = re.search(r'\b(T[FDy]?ype\s+[A-Z]{2,3}|F?P[IO]|DEB|E\s?B)\b', merchant_part)
            if type_match:
                merchant_part = merchant_part[:type_match.start()].strip()
            else:
                # Split at card numbers
                card_match = re.search(r'\bCD\s+\d+', merchant_part)
                if card_match:
                    merchant_part = merchant_part[:card_match.start()].strip()

            merchant_name = self._clean_merchant_name(merchant_part)

            # Determine credit/debit from type codes
            is_credit = bool(re.search(r'\bF?PI\b|\bTFype\s+PI\b', combined_text))
            is_debit = bool(re.search(r'\bF?PO\b|\bTFype\s+PO\b|\bE\s?B\b|\bTFype\s+E\s?B\b|\bDEB\b|\bTDype\s+EB\b', combined_text))

            # Extract amounts after cleaning
            # First, add spaces around amounts stuck to garbage text (like "532.77MMoonneeyy")
            cleaned_text = re.sub(r'(\d{1,5}\.\d{2})([A-Z])', r'\1 \2', combined_text)
            cleaned_text = re.sub(r'\b\d{10,}\b', ' ', cleaned_text)  # Remove account numbers
            cleaned_text = re.sub(r'\bCD\s+\d+', ' ', cleaned_text)  # Remove card numbers

            amount_pattern = r'(\d{1,5}\.\d{2})'
            amounts = re.findall(amount_pattern, cleaned_text)

            if not amounts or len(amounts) < 2:
                # Need at least transaction amount and balance
                continue

            # First amount is transaction, last is balance
            amount_str = amounts[0]
            balance_str = amounts[-1]

            # Parse date
            try:
                date_obj = datetime.strptime(date_str, '%d %b %y')
                parsed_date = date_obj.strftime('%Y-%m-%d')
            except:
                print(f"  ❌ Invalid date: {date_str}")
                continue

            # Parse amount
            try:
                amount = float(amount_str.replace(',', ''))
                balance = float(balance_str.replace(',', ''))

                # Determine credit or debit
                if is_credit:
                    debit = 0.0
                    credit = amount
                    tx_type = 'income'
                elif is_debit:
                    debit = amount
                    credit = 0.0
                    tx_type = 'expense'
                else:
                    # Default to debit if unclear
                    debit = amount
                    credit = 0.0
                    tx_type = 'expense'

            except ValueError as e:
                print(f"  ❌ Invalid amount: {amount_str} - {e}")
                continue

            # Use cleaned merchant name
            description = merchant_name if merchant_name else "Transaction"

            transaction = {
                'date': parsed_date,
                'description': description,
                'debit': debit,
                'credit': credit,
                'balance': balance,
                'type': tx_type
            }

            transactions.append(transaction)
            print(f"  ✅ {parsed_date} | {description[:40]:40} | {'£'+str(credit) if credit > 0 else '-£'+str(debit):>8} | Balance: £{balance}")

        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])

        print(f"\n{'='*80}")
        print(f"✅ LLOYDS PARSER V3 - Extracted {len(transactions)} transactions")
        print(f"{'='*80}\n")

        return transactions

    def _clean_merchant_name(self, text: str) -> str:
        """Clean merchant name by removing common artifacts"""
        if not text:
            return ""

        # Remove type codes and artifacts
        cleaned = text

        # Remove type code patterns (including OCR errors like TDype, TFype, Dype)
        cleaned = re.sub(r'\b(T[FDy]?ype\s+[A-Z]{2,3})\b', '', cleaned)
        cleaned = re.sub(r'\b(TDype|TFype|Dype|Ttype)\b', '', cleaned)
        cleaned = re.sub(r'\b(FPI|FPO|DEB|EB|DD|PI|PO|MPI|MPO|BGC|DEP|TFR|CHQ|CPT|SO|BP)\b', '', cleaned)
        cleaned = re.sub(r'\bE\s+B\b', '', cleaned)  # "E B" with space

        # Remove card references
        cleaned = re.sub(r'\bCD\s+\d+', '', cleaned)

        # Remove date references
        cleaned = re.sub(r'\b\d{1,2}[A-Z]{3}\d{2}\b', '', cleaned)

        # Remove account/reference numbers
        cleaned = re.sub(r'\b\d{6,}\b', '', cleaned)

        # Remove artifacts
        cleaned = re.sub(r'MboInlneay n\(k£\.\)', '', cleaned)
        cleaned = re.sub(r'Mbounle ayt On\( £k \) \.', '', cleaned)
        cleaned = re.sub(r'\.?Money (Out|In)\(£\)', '', cleaned)
        cleaned = re.sub(r'\(£\)\.?', '', cleaned)

        # Remove OCR errors in descriptions
        cleaned = re.sub(r'D\s+Eescriptio', '', cleaned)

        # Remove amounts
        cleaned = re.sub(r'\b\d+\.\d{2}\b', '', cleaned)

        # Remove standalone dots and clean spaces
        cleaned = re.sub(r'\s+\.\s+', ' ', cleaned)
        cleaned = re.sub(r'^\s*\.\s*', '', cleaned)
        cleaned = re.sub(r'\s*\.\s*$', '', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)

        return cleaned.strip()
