"""
Revolut Bank Statement Parser
Clean format with clear Money In/Out columns
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


class RevolutParser(BaseBankParser):
    """Parser for Revolut Bank statements"""

    def __init__(self):
        super().__init__()
        self.logger = get_parser_logger('revolut')
        self.config = get_config('revolut')

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from Revolut statement"""
        transactions = []

        try:
            all_text = ''
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + '\n'

            transactions = self._parse_revolut_text(all_text)

        except Exception as e:
            self.logger.error(f"Error parsing Revolut PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_revolut_text(self, text: str) -> List[Dict]:
        """Parse transactions from Revolut statement text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        self.logger.info(f"Processing {len(lines)} lines")

        # Date pattern: "1 Apr 2023", "10 Apr 2023"
        date_pattern = r'^(\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4})\s+'

        i = 0
        while i < len(lines):
            line = lines[i]

            date_match = re.match(date_pattern, line)
            if not date_match:
                i += 1
                continue

            date_str = date_match.group(1)
            after_date = line[len(date_str):].strip()

            # Extract amounts (£X,XXX.XX or £XXX.XX)
            amount_pattern = r'£[\d,]+\.\d{2}'
            amounts = re.findall(amount_pattern, line)

            # Get description
            description_part = after_date
            if amounts:
                first_amount_pos = after_date.find(amounts[0])
                if first_amount_pos > 0:
                    description_part = after_date[:first_amount_pos].strip()

            description = self._clean_description(description_part)

            # Determine if credit or debit
            is_credit = False
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                if next_line.startswith('From:'):
                    is_credit = True

            if len(amounts) >= 2:
                amount_str = amounts[0].replace('£', '').replace(',', '')
                balance_str = amounts[-1].replace('£', '').replace(',', '')

                try:
                    amount = float(amount_str)
                    balance = float(balance_str)

                    if is_credit or 'Transfer from' in description or 'From:' in line:
                        debit = 0.0
                        credit = amount
                        tx_type = 'income'
                    else:
                        debit = amount
                        credit = 0.0
                        tx_type = 'expense'

                except ValueError:
                    self.logger.debug(f"Invalid amount: {amounts}")
                    i += 1
                    continue

            elif len(amounts) == 1:
                # Single amount - check next line for balance (e.g., "Fee: £0.12 £257.07")
                amount_str = amounts[0].replace('£', '').replace(',', '')
                balance = None

                if i + 1 < len(lines):
                    next_line = lines[i + 1]
                    next_amounts = re.findall(amount_pattern, next_line)
                    if next_amounts and len(next_amounts) >= 1:
                        # Last amount on next line is likely the balance
                        balance_str = next_amounts[-1].replace('£', '').replace(',', '')
                        try:
                            balance = float(balance_str)
                        except ValueError:
                            balance = None

                try:
                    amount = float(amount_str)

                    if is_credit or 'Transfer from' in description or 'From:' in line:
                        debit = 0.0
                        credit = amount
                        tx_type = 'income'
                    else:
                        debit = amount
                        credit = 0.0
                        tx_type = 'expense'

                except ValueError:
                    self.logger.debug(f"Invalid single amount: {amounts}")
                    i += 1
                    continue
            else:
                i += 1
                continue

            # Parse date
            try:
                date_obj = datetime.strptime(date_str, '%d %b %Y')
                parsed_date = date_obj.strftime('%Y-%m-%d')
            except:
                self.logger.debug(f"Invalid date: {date_str}")
                i += 1
                continue

            transaction = {
                'date': parsed_date,
                'description': description,
                'debit': debit,
                'credit': credit,
                'balance': balance,
                'type': tx_type
            }

            transactions.append(transaction)
            self.logger.debug(f"{parsed_date} | {description[:40]:40} | {'£'+str(credit) if credit > 0 else '-£'+str(debit):>10} | Balance: £{balance}")

            i += 1

        transactions.sort(key=lambda x: x['date'])

        self.logger.info(f"Extracted {len(transactions)} transactions")

        return transactions

    def _clean_description(self, text: str) -> str:
        """Clean transaction description"""
        if not text:
            return ""

        cleaned = re.sub(r'\s+', ' ', text)
        cleaned = cleaned.strip()

        return cleaned
