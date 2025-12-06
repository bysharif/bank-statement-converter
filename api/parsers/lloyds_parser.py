"""
Lloyds Bank Statement Parser v3
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
    from .logger import get_parser_logger
    from .config import get_config
    from ..utils import clean_description
except ImportError:
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from parsers.base_parser import BaseBankParser
    from parsers.logger import get_parser_logger
    from parsers.config import get_config
    from utils import clean_description


class LloydsParser(BaseBankParser):
    """Parser for Lloyds Bank UK statements"""

    def __init__(self):
        super().__init__()
        self.logger = get_parser_logger('lloyds')
        self.config = get_config('lloyds')

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
            self.logger.error(f"Error parsing Lloyds PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_lloyds_text(self, text: str) -> List[Dict]:
        """Parse transactions from Lloyds statement text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        self.logger.info(f"Processing {len(lines)} lines")

        # Date pattern: DD MMM YY (e.g., "06 JUN 25", "09 JUL 25")
        date_pattern = r'(\d{2}\s+[A-Z]{3}\s+\d{2})'
        ocr_date_pattern = r'D2ate\s+(\d+)\s+([A-Z]{3})\s+(\d{2})'

        # Group lines into transaction blocks
        blocks = []
        i = 0
        while i < len(lines):
            line = lines[i]

            # Check if line contains a date
            date_match = re.search(date_pattern, line)
            ocr_match = re.search(ocr_date_pattern, line)

            if date_match or ocr_match:
                block_lines = [line]
                max_lookahead = self.config.max_lookahead_lines if self.config else 5

                # Look ahead for continuation
                j = i + 1
                while j < len(lines) and j < i + max_lookahead:
                    next_line = lines[j]
                    # Stop if we hit another date line
                    if re.search(date_pattern, next_line) or re.search(ocr_date_pattern, next_line):
                        break
                    block_lines.append(next_line)
                    j += 1

                blocks.append({
                    'lines': block_lines,
                    'start_index': i,
                    'preview': block_lines[0][:70] if block_lines else ''
                })
                i = j
            else:
                i += 1

        self.logger.debug(f"Found {len(blocks)} potential transaction blocks")

        # Parse each block
        for block in blocks:
            combined_text = ' '.join(block['lines'])

            # Extract date
            date_match = re.search(date_pattern, combined_text)
            ocr_match = re.search(ocr_date_pattern, combined_text)

            if date_match:
                date_str = date_match.group(1)
            elif ocr_match:
                day = ocr_match.group(1).zfill(2)
                month = ocr_match.group(2)
                year = ocr_match.group(3)
                date_str = f"{day} {month} {year}"
                date_match = ocr_match
            else:
                continue

            # Extract merchant name
            after_date = combined_text[date_match.end():].strip()

            merchant_part = after_date
            # Remove account numbers
            merchant_part = re.sub(r'\b\d{10,}\b', ' ', merchant_part)
            # Split at type codes
            type_match = re.search(r'\b(T[FDy]?ype\s+[A-Z]{2,3}|F?P[IO]|DEB|E\s?B)\b', merchant_part)
            if type_match:
                merchant_part = merchant_part[:type_match.start()].strip()
            else:
                card_match = re.search(r'\bCD\s+\d+', merchant_part)
                if card_match:
                    merchant_part = merchant_part[:card_match.start()].strip()

            merchant_name = self._clean_merchant_name(merchant_part)

            # Determine credit/debit from type codes
            is_credit = bool(re.search(r'\bF?PI\b|\bTFype\s+PI\b', combined_text))
            is_debit = bool(re.search(r'\bF?PO\b|\bTFype\s+PO\b|\bE\s?B\b|\bTFype\s+E\s?B\b|\bDEB\b|\bTDype\s+EB\b', combined_text))

            # Extract amounts
            cleaned_text = re.sub(r'(\d{1,5}\.\d{2})([A-Z])', r'\1 \2', combined_text)
            cleaned_text = re.sub(r'\b\d{10,}\b', ' ', cleaned_text)
            cleaned_text = re.sub(r'\bCD\s+\d+', ' ', cleaned_text)

            amount_pattern = r'(\d{1,5}\.\d{2})'
            amounts = re.findall(amount_pattern, cleaned_text)

            if not amounts or len(amounts) < 2:
                continue

            amount_str = amounts[0]
            balance_str = amounts[-1]

            # Parse date
            try:
                date_obj = datetime.strptime(date_str, '%d %b %y')
                parsed_date = date_obj.strftime('%Y-%m-%d')
            except:
                self.logger.debug(f"Invalid date: {date_str}")
                continue

            # Parse amount
            try:
                amount = float(amount_str.replace(',', ''))
                balance = float(balance_str.replace(',', ''))

                if is_credit:
                    debit = 0.0
                    credit = amount
                    tx_type = 'income'
                elif is_debit:
                    debit = amount
                    credit = 0.0
                    tx_type = 'expense'
                else:
                    debit = amount
                    credit = 0.0
                    tx_type = 'expense'

            except ValueError as e:
                self.logger.debug(f"Invalid amount: {amount_str} - {e}")
                continue

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
            self.logger.debug(f"{parsed_date} | {description[:40]:40} | {'£'+str(credit) if credit > 0 else '-£'+str(debit):>8} | Balance: £{balance}")

        # Sort by date
        transactions.sort(key=lambda x: x['date'])

        self.logger.info(f"Extracted {len(transactions)} transactions")

        return transactions

    def _clean_merchant_name(self, text: str) -> str:
        """Clean merchant name by removing common artifacts"""
        if not text:
            return ""

        cleaned = text

        # Remove type code patterns
        cleaned = re.sub(r'\b(T[FDy]?ype\s+[A-Z]{2,3})\b', '', cleaned)
        cleaned = re.sub(r'\b(TDype|TFype|Dype|Ttype)\b', '', cleaned)
        cleaned = re.sub(r'\b(FPI|FPO|DEB|EB|DD|PI|PO|MPI|MPO|BGC|DEP|TFR|CHQ|CPT|SO|BP)\b', '', cleaned)
        cleaned = re.sub(r'\bE\s+B\b', '', cleaned)

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

        # Remove OCR errors
        cleaned = re.sub(r'D\s+Eescriptio', '', cleaned)

        # Remove amounts
        cleaned = re.sub(r'\b\d+\.\d{2}\b', '', cleaned)

        # Clean spaces
        cleaned = re.sub(r'\s+\.\s+', ' ', cleaned)
        cleaned = re.sub(r'^\s*\.\s*', '', cleaned)
        cleaned = re.sub(r'\s*\.\s*$', '', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)

        return cleaned.strip()
