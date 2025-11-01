"""
Lloyds Bank Statement Parser
Handles Lloyds Bank UK current account statements
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
        print(f"LLOYDS PARSER - Processing {len(lines)} lines")
        print(f"{'='*80}\n")

        # Date pattern: DD MMM YY (e.g., "06 JUN 25", "09 JUL 25")
        date_pattern = r'^(\d{2}\s+[A-Z]{3}\s+\d{2})\s+'

        # Transaction type codes (for credit/debit detection)
        credit_types = ['PI', 'FPI', 'MPI', 'BGC', 'DEP', 'TFR']  # Payments In
        debit_types = ['PO', 'FPO', 'MPO', 'EB', 'DEB', 'DD', 'CHQ', 'CPT', 'SO', 'BP']  # Payments Out

        for i, line in enumerate(lines):
            # Look for date pattern at start of line
            date_match = re.match(date_pattern, line)
            if not date_match:
                continue

            date_str = date_match.group(1)

            # Everything after the date
            after_date = line[len(date_str):].strip()

            # FIRST: Remove account numbers and card numbers before looking for amounts
            # This prevents picking them up as transaction amounts
            cleaned_line = after_date
            cleaned_line = re.sub(r'\b\d{10,}\b', ' ', cleaned_line)  # Remove account numbers (10+ digits)
            cleaned_line = re.sub(r'\bCD\s+\d+', ' ', cleaned_line)  # Remove card numbers (e.g., "CD 3649")
            cleaned_line = re.sub(r'\b\d{1,2}[A-Z]{3}\d{2}\b', ' ', cleaned_line)  # Remove date refs (e.g., "10JUN25")

            # Extract merchant name (before the account number or type code)
            # Lloyds format: DATE MERCHANT [ACCOUNT_NUM] [TYPE] AMOUNT BALANCE

            # Try to find transaction type code
            type_code = None
            for code in credit_types + debit_types:
                # Look for type code (may be "Type PO", "TFype PI", "FPI", etc.)
                type_pattern = rf'\b(T[FDy]?ype\s+)?{code}\b'
                if re.search(type_pattern, after_date):
                    type_code = code
                    break

            # Extract amounts and balance from cleaned line
            # Look for numbers with 1-2 decimal places (typical currency format)
            # Pattern: digits.digits (e.g., "299.66", "15.00", "11.40")
            amount_pattern = r'(\d{1,5}\.\d{2})'  # Max 99999.99 (realistic transaction amounts)
            amounts = re.findall(amount_pattern, cleaned_line)

            if not amounts or len(amounts) < 1:
                # No amounts found, skip
                continue

            # Last amount is typically the balance
            balance_str = amounts[-1] if amounts else None

            # Determine transaction amount
            # If we have 2 amounts: first is transaction, last is balance
            # If we have 3+ amounts: might be Money Out, Money In, Balance or just extra noise

            amount_str = None
            if len(amounts) >= 2:
                # Typically: [transaction amount] [balance]
                amount_str = amounts[0]
            elif len(amounts) == 1:
                # Only balance? Skip this transaction
                continue

            # Extract merchant name
            # It's between the date and the first number/account number
            # Account numbers are typically long sequences of digits

            # Remove the date from the beginning
            merchant_part = after_date

            # Remove account numbers (sequences of 10+ digits)
            merchant_part = re.sub(r'\b\d{10,}\b', '', merchant_part)

            # Remove type codes
            for code in credit_types + debit_types:
                merchant_part = re.sub(rf'\b(T[FDy]?ype\s+)?{code}\b', '', merchant_part)

            # Remove amounts and "Money In/Out" text
            merchant_part = re.sub(r'\d+\.?\d*\s*(Money In|Money Out|£|\(£\))?', '', merchant_part)

            # Remove card references (e.g., "CD 3649", "CD 4718")
            merchant_part = re.sub(r'\bCD\s+\d+', '', merchant_part)

            # Remove reference numbers (e.g., "10JUN25", "17JUN25", "23JUN25")
            merchant_part = re.sub(r'\b\d{1,2}[A-Z]{3}\d{2}\b', '', merchant_part)

            # Remove common artifacts from PDF extraction
            merchant_part = re.sub(r'MboInlneay n\(k£\.\)', '', merchant_part)
            merchant_part = re.sub(r'Mbounle ayt On\( £k \) \.', '', merchant_part)
            merchant_part = re.sub(r'\.Money Out\(£\)', '', merchant_part)
            merchant_part = re.sub(r'\.Money In\(£\)', '', merchant_part)
            merchant_part = re.sub(r'\(£\)\.?', '', merchant_part)
            merchant_part = re.sub(r'\s+\.\s+', ' ', merchant_part)  # Remove standalone dots
            merchant_part = re.sub(r'^\.\s*', '', merchant_part)  # Remove leading dots
            merchant_part = re.sub(r'\s*\.$', '', merchant_part)  # Remove trailing dots

            # Clean up extra spaces
            merchant_part = re.sub(r'\s+', ' ', merchant_part).strip()

            # Final cleanup
            description = merchant_part.strip()

            if not description:
                description = "Transaction"

            # Parse date (DD MMM YY -> YYYY-MM-DD)
            try:
                # Convert "06 JUN 25" to "2025-06-06"
                date_obj = datetime.strptime(date_str, '%d %b %y')
                parsed_date = date_obj.strftime('%Y-%m-%d')
            except Exception as e:
                print(f"  ❌ Invalid date: {date_str} - {e}")
                continue

            # Determine if credit or debit based on type code
            try:
                amount = float(amount_str.replace(',', ''))

                if type_code in credit_types:
                    # Money In
                    debit = 0.0
                    credit = amount
                    tx_type = 'income'
                elif type_code in debit_types:
                    # Money Out
                    debit = amount
                    credit = 0.0
                    tx_type = 'expense'
                else:
                    # Default: assume debit if no type found
                    debit = amount
                    credit = 0.0
                    tx_type = 'expense'

            except ValueError:
                print(f"  ❌ Invalid amount: {amount_str}")
                continue

            # Parse balance
            try:
                balance = float(balance_str.replace(',', '')) if balance_str else None
            except ValueError:
                balance = None

            # Clean description
            cleaned_description = clean_description(description, max_length=100)

            transaction = {
                'date': parsed_date,
                'description': cleaned_description,
                'debit': debit,
                'credit': credit,
                'balance': balance,
                'type': tx_type
            }

            transactions.append(transaction)
            print(f"  ✅ {parsed_date} | {cleaned_description} | {'£'+str(credit) if credit > 0 else '-£'+str(debit)} | Balance: £{balance}")

        # Sort by date (oldest first)
        transactions.sort(key=lambda x: x['date'])

        print(f"\n{'='*80}")
        print(f"✅ LLOYDS PARSER - Extracted {len(transactions)} transactions")
        print(f"{'='*80}\n")

        return transactions
