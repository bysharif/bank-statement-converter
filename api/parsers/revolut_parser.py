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
    from ..utils import clean_description
except ImportError:
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from parsers.base_parser import BaseBankParser
    from utils import clean_description


class RevolutParser(BaseBankParser):
    """Parser for Revolut Bank statements"""

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from Revolut statement"""
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
            transactions = self._parse_revolut_text(all_text)

        except Exception as e:
            print(f"Error parsing Revolut PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_revolut_text(self, text: str) -> List[Dict]:
        """Parse transactions from Revolut statement text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        print(f"\n{'='*80}")
        print(f"REVOLUT PARSER - Processing {len(lines)} lines")
        print(f"{'='*80}\n")

        # Date pattern: "1 Apr 2023", "10 Apr 2023" (D MMM YYYY or DD MMM YYYY)
        date_pattern = r'^(\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4})\s+'

        i = 0
        while i < len(lines):
            line = lines[i]

            # Look for transaction line starting with date
            date_match = re.match(date_pattern, line)
            if not date_match:
                i += 1
                continue

            date_str = date_match.group(1)
            after_date = line[len(date_str):].strip()

            # Extract description and amounts
            # Format: "Description £amount £balance" or "Description £balance" (when other column empty)

            # Remove amounts from line to get description
            # Amounts format: £X,XXX.XX or £XXX.XX
            amount_pattern = r'£[\d,]+\.\d{2}'
            amounts = re.findall(amount_pattern, line)

            # Description is everything after date before the first amount
            description_part = after_date
            if amounts:
                first_amount_pos = after_date.find(amounts[0])
                if first_amount_pos > 0:
                    description_part = after_date[:first_amount_pos].strip()

            description = self._clean_description(description_part)

            # Parse amounts
            # If 2 amounts: first is transaction (out or in), last is balance
            # If 1 amount: it's the balance (need to look at "From:" to determine type)

            # Need to determine if it's money out or money in
            # Check next line for "From:" (refund/credit) or "To:" (payment)
            is_credit = False
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                if next_line.startswith('From:'):
                    is_credit = True

            if len(amounts) >= 2:
                # Transaction amount and balance present
                amount_str = amounts[0].replace('£', '').replace(',', '')
                balance_str = amounts[-1].replace('£', '').replace(',', '')

                try:
                    amount = float(amount_str)
                    balance = float(balance_str)

                    # Determine if credit or debit based on column position or "From:" indicator
                    if is_credit or 'Transfer from' in description or 'From:' in line:
                        debit = 0.0
                        credit = amount
                        tx_type = 'income'
                    else:
                        debit = amount
                        credit = 0.0
                        tx_type = 'expense'

                except ValueError:
                    print(f"  ❌ Invalid amount: {amounts}")
                    i += 1
                    continue

            elif len(amounts) == 1:
                # Only balance present, look for "From:" to determine type
                balance_str = amounts[0].replace('£', '').replace(',', '')

                # This might be a zero-amount transaction or we need more context
                # For now, skip these
                i += 1
                continue

            else:
                # No amounts found
                i += 1
                continue

            # Parse date
            try:
                date_obj = datetime.strptime(date_str, '%d %b %Y')
                parsed_date = date_obj.strftime('%Y-%m-%d')
            except:
                print(f"  ❌ Invalid date: {date_str}")
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
            print(f"  ✅ {parsed_date} | {description[:40]:40} | {'£'+str(credit) if credit > 0 else '-£'+str(debit):>10} | Balance: £{balance}")

            i += 1

        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])

        print(f"\n{'='*80}")
        print(f"✅ REVOLUT PARSER - Extracted {len(transactions)} transactions")
        print(f"{'='*80}\n")

        return transactions

    def _clean_description(self, text: str) -> str:
        """Clean transaction description"""
        if not text:
            return ""

        cleaned = text

        # Remove common artifacts
        cleaned = re.sub(r'\s+', ' ', cleaned)  # Normalize spaces
        cleaned = cleaned.strip()

        return cleaned
