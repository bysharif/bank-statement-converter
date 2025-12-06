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


class SantanderParser(BaseBankParser):
    """Parser for Santander UK Business Bank statements"""

    def __init__(self):
        super().__init__()
        self.logger = get_parser_logger('santander')
        self.config = get_config('santander')

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from Santander statement"""
        transactions = []

        try:
            all_text = ''
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + '\n'

            transactions = self._parse_santander_text(all_text)

        except Exception as e:
            self.logger.error(f"Error parsing Santander PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_santander_text(self, text: str) -> List[Dict]:
        """Parse transactions from Santander statement text using block-based approach"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        self.logger.info(f"Processing {len(lines)} lines")

        # Date pattern: 3rd Dec, 10th Dec, etc.
        date_pattern = r'^(\d{1,2}(?:st|nd|rd|th)\s+[A-Z][a-z]{2})\s+'
        amount_pattern = r'\d{1,5}(?:,\d{3})*\.\d{2}'

        # Find header line
        header_idx = -1
        for i, line in enumerate(lines):
            if 'Date' in line and 'Description' in line and 'Credits' in line and 'Debits' in line:
                header_idx = i
                self.logger.debug(f"Found header at line {i}: {line}")
                break

        if header_idx == -1:
            self.logger.warning("No header found")
            return transactions

        # Group lines into transaction blocks
        self.logger.debug("Grouping lines into transaction blocks...")
        blocks = []
        i = header_idx + 1

        while i < len(lines):
            line = lines[i]

            # Skip footer/summary lines
            if 'Previous statement balance' in line or 'Total credits' in line or 'Total debits' in line:
                i += 1
                continue

            if 'Current statement balance' in line:
                break

            date_match = re.match(date_pattern, line)

            if date_match:
                block_lines = [line]
                block_start_idx = i

                j = i + 1
                found_amounts = bool(re.findall(amount_pattern, line))

                while j < len(lines):
                    next_line = lines[j]

                    if re.match(date_pattern, next_line):
                        break

                    if 'Date' in next_line and 'Description' in next_line:
                        break
                    if 'Previous statement balance' in next_line or 'Total credits' in next_line:
                        break

                    block_lines.append(next_line)

                    if re.search(amount_pattern, next_line):
                        found_amounts = True
                        j += 1
                        if j < len(lines) and not re.match(date_pattern, lines[j]):
                            potential_balance = lines[j].strip()
                            if re.match(r'^-?\d{1,5}(?:,\d{3})*\.\d{2}$', potential_balance):
                                block_lines.append(potential_balance)
                                j += 1
                        break

                    j += 1

                if found_amounts:
                    blocks.append({
                        'lines': block_lines,
                        'date_str': date_match.group(1),
                        'start_idx': block_start_idx,
                        'end_idx': j - 1
                    })
                    self.logger.debug(f"Block {len(blocks)}: {len(block_lines)} lines")

                i = j
            else:
                i += 1

        self.logger.debug(f"Created {len(blocks)} transaction blocks")

        # Infer year from statement
        current_year = datetime.now().year
        for line in lines[:30]:
            year_match = re.search(r'\b(20\d{2})\b', line)
            if year_match:
                current_year = int(year_match.group(1))
                break

        previous_month = None

        for block_num, block in enumerate(blocks, 1):
            date_str = block['date_str']
            day_match = re.match(r'(\d{1,2})(?:st|nd|rd|th)\s+([A-Z][a-z]{2})', date_str)
            if day_match:
                month_abbr = day_match.group(2)
                month_map = {
                    'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                    'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                }
                current_month = month_map.get(month_abbr, 1)

                # Detect year rollover
                if previous_month == 12 and current_month == 1:
                    current_year += 1
                    self.logger.debug(f"Year rollover detected: Dec -> Jan, year now {current_year}")

                previous_month = current_month

            transaction = self._parse_santander_transaction_block(
                block=block,
                block_num=block_num,
                year=current_year
            )

            if transaction:
                transactions.append(transaction)

        transactions.sort(key=lambda x: x['date'])

        self.logger.info(f"Extracted {len(transactions)} transactions")

        return transactions

    def _parse_santander_transaction_block(self, block: Dict, block_num: int, year: int) -> Dict:
        """Parse a transaction block into a transaction dictionary"""
        block_lines = block['lines']
        date_str = block['date_str']

        combined_text = ' '.join(block_lines)

        amount_pattern = r'(\d{1,5}(?:,\d{3})*\.\d{2})'
        amounts = re.findall(amount_pattern, combined_text)

        if len(amounts) < 1:
            self.logger.debug(f"Block {block_num}: No amounts found, skipping")
            return None

        credit = 0.0
        debit = 0.0
        balance = None

        if len(amounts) == 1:
            amount_val = float(amounts[0].replace(',', ''))

            if any(keyword in combined_text.upper() for keyword in [
                'RECEIPT', 'TRANSFER FROM', 'BANK GIRO CREDIT', 'CREDIT REF'
            ]):
                credit = amount_val
            else:
                debit = amount_val

        elif len(amounts) == 2:
            has_credit_keyword = any(keyword in combined_text.upper() for keyword in [
                'RECEIPT', 'TRANSFER FROM', 'BANK GIRO CREDIT', 'CREDIT REF'
            ])
            has_debit_keyword = any(keyword in combined_text.upper() for keyword in [
                'PAYMENT TO', 'DIRECT DEBIT', 'CARD PAYMENT', 'BILL PAYMENT'
            ])

            if has_credit_keyword and not has_debit_keyword:
                credit = float(amounts[0].replace(',', ''))
                balance = float(amounts[1].replace(',', ''))
            elif has_debit_keyword and not has_credit_keyword:
                debit = float(amounts[0].replace(',', ''))
                balance = float(amounts[1].replace(',', ''))
            else:
                if has_credit_keyword:
                    credit = float(amounts[0].replace(',', ''))
                else:
                    debit = float(amounts[0].replace(',', ''))
                balance = float(amounts[1].replace(',', ''))

        elif len(amounts) >= 3:
            balance = float(amounts[-1].replace(',', ''))

            has_credit_keyword = any(keyword in combined_text.upper() for keyword in [
                'RECEIPT', 'TRANSFER FROM', 'BANK GIRO CREDIT', 'CREDIT REF'
            ])

            if has_credit_keyword:
                credit = float(amounts[-2].replace(',', ''))
            else:
                debit = float(amounts[-2].replace(',', ''))

        # Extract description
        description = combined_text
        description = re.sub(r'\d{1,2}(?:st|nd|rd|th)\s+[A-Z][a-z]{2}', '', description)
        for amount in amounts:
            description = description.replace(amount, '')
        description = self._clean_santander_description(description)

        # Parse date
        try:
            day_match = re.match(r'(\d{1,2})(?:st|nd|rd|th)\s+([A-Z][a-z]{2})', date_str)
            if day_match:
                day = int(day_match.group(1))
                month_abbr = day_match.group(2)

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
            self.logger.debug(f"Block {block_num}: Invalid date: {date_str} - {e}")
            return None

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

        amount_display = f"£{credit:.2f}" if credit > 0 else f"-£{debit:.2f}"
        balance_display = f"£{balance:.2f}" if balance else "N/A"
        self.logger.debug(f"Block {block_num}: {parsed_date} | {description[:40]:40} | {amount_display:>12} | Balance: {balance_display}")

        return transaction

    def _clean_santander_description(self, text: str) -> str:
        """Clean Santander transaction description"""
        if not text:
            return ""

        cleaned = text

        # Handle different transaction types
        if 'DIRECT DEBIT PAYMENT TO' in cleaned:
            cleaned = re.sub(r'DIRECT DEBIT PAYMENT TO\s+', 'Direct Debit - ', cleaned)
            cleaned = re.sub(r'\s*REF\s+', ' Ref: ', cleaned)
            cleaned = re.sub(r',?\s*MANDATE NO\s+\d+', '', cleaned)

        elif 'BILL PAYMENT VIA FASTER PAYMENT TO' in cleaned:
            cleaned = re.sub(r'BILL PAYMENT VIA FASTER PAYMENT TO\s+', 'Faster Payment - ', cleaned)
            cleaned = re.sub(r'\s*REFERENCE\s+', ' Ref: ', cleaned)
            cleaned = re.sub(r',?\s*MANDATE NO\s+\d+', '', cleaned)

        elif 'CARD PAYMENT TO' in cleaned:
            cleaned = re.sub(r'CARD PAYMENT TO\s+', 'Card Payment - ', cleaned)
            cleaned = re.sub(r'\s+ON\s+\d{2}-\d{2}-\d{4}', '', cleaned)

        elif 'BANK GIRO CREDIT' in cleaned:
            cleaned = re.sub(r'BANK GIRO CREDIT\s+REF\s+', 'Bank Giro - ', cleaned)

        elif 'FASTER PAYMENTS RECEIPT' in cleaned:
            cleaned = re.sub(r'FASTER PAYMENTS RECEIPT\s+REF\.?', 'Received from', cleaned)
            cleaned = re.sub(r'\s+FROM\s+', ' - ', cleaned)

        elif 'TRANSFER FROM' in cleaned:
            cleaned = re.sub(r'TRANSFER FROM\s+', 'Transfer from ', cleaned)

        # Remove extra reference codes
        cleaned = re.sub(r'\b[A-Z]{3}\d{12,}\b', '', cleaned)

        # Clean up
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()
        cleaned = cleaned.strip('.,;:- ')

        return cleaned if cleaned else "Transaction"
