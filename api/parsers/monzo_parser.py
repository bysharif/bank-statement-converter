"""
Monzo Bank Statement Parser v2
Improved version based on actual PDF analysis
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


class MonzoParser(BaseBankParser):
    """Improved parser for Monzo Bank UK statements"""

    def __init__(self):
        super().__init__()
        self.logger = get_parser_logger('monzo')
        self.config = get_config('monzo')

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from Monzo statement"""
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
            transactions = self._parse_monzo_text(all_text)

        except Exception as e:
            self.logger.error(f"Error parsing Monzo PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_monzo_text(self, text: str) -> List[Dict]:
        """Parse transactions from Monzo statement text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        self.logger.info(f"Processing {len(lines)} lines")

        # Find header row
        header_idx = -1
        for i, line in enumerate(lines):
            if 'Date' in line and 'Description' in line and ('Amount' in line or 'Balance' in line):
                header_idx = i
                self.logger.debug(f"Found header at line {i}: {line}")
                break

        if header_idx == -1:
            self.logger.warning("No header found")
            return transactions

        # Start parsing from line after header
        i = header_idx + 1

        while i < len(lines):
            line = lines[i]

            # Check if line starts with a date (DD/MM/YYYY)
            date_pattern = r'^(\d{1,2}/\d{1,2}/\d{4})\s+'
            date_match = re.match(date_pattern, line)

            if not date_match:
                i += 1
                continue

            date_str = date_match.group(1)

            # Extract everything after the date
            after_date = line[len(date_str):].strip()

            # Find amount and balance at the end of line
            amount_balance_pattern = r'(-?[\d,]+\.?\d{2})\s+(-?[\d,]+\.?\d{2})\s*$'
            amount_balance_match = re.search(amount_balance_pattern, after_date)

            if not amount_balance_match:
                i += 1
                continue

            amount_str = amount_balance_match.group(1).replace(',', '')
            balance_str = amount_balance_match.group(2).replace(',', '')

            # Extract description (between date and amount/balance)
            desc_on_date_line = after_date[:amount_balance_match.start()].strip()

            # Look for merchant name on previous line(s)
            merchant_lines = []
            max_lookback = self.config.max_lookback_lines if self.config else 4

            for j in range(1, min(max_lookback, i - header_idx)):
                prev_line = lines[i - j].strip()

                # Stop if we hit another date line
                if re.match(r'^\d{1,2}/\d{1,2}/\d{4}', prev_line):
                    break

                # Stop if we hit the header
                if 'Date' in prev_line and 'Description' in prev_line:
                    break

                # Skip amount/balance lines
                if re.match(r'^-?[\d,]+\.?\d{2}\s+-?[\d,]+\.?\d{2}\s*$', prev_line):
                    continue

                # Skip reference lines
                if prev_line.lower().startswith('reference:'):
                    continue

                # Skip "This relates to" lines
                if 'this relates to' in prev_line.lower():
                    continue

                # Skip very short lines
                if len(prev_line) < 3:
                    continue

                merchant_lines.insert(0, prev_line)

            # Build description
            description_parts = []

            if merchant_lines:
                merchant_name = ' '.join(merchant_lines)
                merchant_name = re.sub(r'\s+', ' ', merchant_name)
                description_parts.append(merchant_name)
                self.logger.debug(f"Merchant from previous line(s): {merchant_name}")

            if desc_on_date_line:
                if not merchant_lines or len(desc_on_date_line) > 5:
                    description_parts.append(desc_on_date_line)
                    self.logger.debug(f"Description from date line: {desc_on_date_line}")

            description = ' '.join(description_parts).strip()
            description = self._clean_monzo_description(description)

            # Fallback description
            if not description:
                if float(amount_str) < 0:
                    description = "Withdrawal"
                else:
                    description = "Deposit"
                self.logger.debug("No description found, using generic term")

            # Parse date
            try:
                day, month, year = date_str.split('/')
                parsed_date = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
            except:
                self.logger.debug(f"Invalid date: {date_str}")
                i += 1
                continue

            # Parse amount
            try:
                amount = float(amount_str)
                debit = abs(amount) if amount < 0 else 0.0
                credit = amount if amount > 0 else 0.0
            except ValueError:
                self.logger.debug(f"Invalid amount: {amount_str}")
                i += 1
                continue

            # Parse balance
            try:
                balance = float(balance_str)
            except ValueError:
                balance = None

            cleaned_description = clean_description(description, max_length=100)

            transaction = {
                'date': parsed_date,
                'description': cleaned_description,
                'debit': debit,
                'credit': credit,
                'balance': balance,
                'type': 'income' if credit > 0 else 'expense'
            }

            transactions.append(transaction)
            self.logger.debug(f"Transaction: {parsed_date} | {cleaned_description} | {amount} | {balance}")

            i += 1

        # Reverse to chronological order (Monzo shows newest first)
        transactions.reverse()

        self.logger.info(f"Extracted {len(transactions)} transactions")

        return transactions

    def _clean_monzo_description(self, text: str) -> str:
        """Clean Monzo transaction description"""
        if not text:
            return ""

        cleaned = text

        # Remove "Reference:" and everything after it
        cleaned = re.sub(r'\s*Reference:.*$', '', cleaned, flags=re.IGNORECASE)

        # Remove payment type indicators
        cleaned = re.sub(r'\(\s*Faster\s*\)?', '', cleaned)
        cleaned = re.sub(r'\bPayments?\)\s*', '', cleaned)
        cleaned = re.sub(r'\(\s*Faster\s+Payments?\s*\)', '', cleaned)

        # Remove standalone "Payments)" at the start
        cleaned = re.sub(r'^\s*Payments?\)\s*', '', cleaned)

        # Remove payment method indicators
        cleaned = re.sub(r'\(?(Direct Debit|Standing Order|Bank Transfer|Card Payment|Faster Payments?)\)?', '', cleaned, flags=re.IGNORECASE)

        # Remove "This relates to" text
        cleaned = re.sub(r'\s*This relates to.*$', '', cleaned, flags=re.IGNORECASE)

        # Clean up spaces and punctuation
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = re.sub(r'\s*\(\s*\)\s*', '', cleaned)
        cleaned = cleaned.strip()

        # Remove standalone abbreviations
        cleaned = re.sub(r'^(ACC|GBR|IRL|USA|EUR|USD)\s+', '', cleaned)

        # Remove trailing/leading punctuation
        cleaned = cleaned.strip('.,;:- ')

        return cleaned
