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
    from .logger import get_parser_logger
    from .config import get_config, get_type_name
    from ..utils import clean_description
except ImportError:
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from parsers.base_parser import BaseBankParser
    from parsers.logger import get_parser_logger
    from parsers.config import get_config, get_type_name
    from utils import clean_description


class HSBCParser(BaseBankParser):
    """Parser for HSBC Bank UK statements"""

    def __init__(self):
        super().__init__()
        self.logger = get_parser_logger('hsbc')
        self.config = get_config('hsbc')

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """Extract transactions from HSBC statement"""
        transactions = []

        try:
            all_text = ''
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + '\n'

            transactions = self._parse_hsbc_text(all_text)

        except Exception as e:
            self.logger.error(f"Error parsing HSBC PDF: {str(e)}")
            import traceback
            traceback.print_exc()

        return transactions

    def _parse_hsbc_text(self, text: str) -> List[Dict]:
        """Parse transactions from HSBC statement text using block-based approach"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        self.logger.info(f"Processing {len(lines)} lines")

        # Date pattern: DD MMM YY
        date_pattern = r'^(\d{2}\s+[A-Z][a-z]{2}\s+\d{2})\s+'
        amount_pattern = r'\d{1,5}(?:,\d{3})*\.\d{2}'

        # Find header line
        header_idx = -1
        for i, line in enumerate(lines):
            if 'Date' in line and 'Payment type' in line and 'Balance' in line:
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
        last_date = None

        while i < len(lines):
            line = lines[i]

            # Skip balance forward/carried lines
            if 'BALANCE' in line.upper() and ('FORWARD' in line.upper() or 'CARRIED' in line.upper()):
                self.logger.debug(f"Skipping: {line}")
                i += 1
                continue

            date_match = re.match(date_pattern, line)
            type_code_pattern = r'^(DD|SO|ATM|VIS|CR|BP|FPI|FPO|BGC|CHQ|CPT|TFR)\s+'
            type_match = re.match(type_code_pattern, line) if not date_match else None

            if date_match or (type_match and last_date):
                block_start_idx = i

                if date_match:
                    current_date = date_match.group(1)
                    last_date = current_date
                    block_lines = [line]
                else:
                    current_date = last_date
                    block_lines = [f"{current_date}  {line}"]

                j = i + 1
                found_amount = bool(re.search(amount_pattern, line))

                while j < len(lines):
                    next_line = lines[j]

                    if re.match(date_pattern, next_line):
                        break

                    if 'BALANCE' in next_line.upper() and ('FORWARD' in next_line.upper() or 'CARRIED' in next_line.upper()):
                        break

                    if re.match(type_code_pattern, next_line):
                        break

                    block_lines.append(next_line)

                    if re.search(amount_pattern, next_line):
                        found_amount = True
                        j += 1
                        if j < len(lines) and not re.match(date_pattern, lines[j]):
                            potential_balance_line = lines[j]
                            if re.match(r'^\d{1,5}(?:,\d{3})*\.\d{2}\s*$', potential_balance_line):
                                block_lines.append(potential_balance_line)
                                j += 1
                        break

                    j += 1

                if found_amount or len(block_lines) > 1:
                    blocks.append({
                        'lines': block_lines,
                        'start_idx': block_start_idx,
                        'end_idx': j - 1
                    })
                    self.logger.debug(f"Block {len(blocks)}: {len(block_lines)} lines")

                i = j
            else:
                i += 1

        self.logger.debug(f"Created {len(blocks)} transaction blocks")

        # Parse each block
        for block_num, block in enumerate(blocks, 1):
            block_lines = block['lines']

            if not block_lines:
                continue

            first_line = block_lines[0]
            date_match = re.match(date_pattern, first_line)

            if not date_match:
                self.logger.debug(f"Block {block_num}: No date found")
                continue

            date_str = date_match.group(1)
            after_date = first_line[len(date_str):].strip()
            combined_text = ' '.join(block_lines)
            amounts = re.findall(amount_pattern, combined_text)

            if len(amounts) < 1:
                self.logger.debug(f"Block {block_num}: No amounts found, skipping")
                continue

            # Build description
            description_parts = []
            if after_date:
                description_parts.append(after_date)

            for line in block_lines[1:]:
                line_without_amounts = re.sub(amount_pattern, '', line).strip()
                line_without_amounts = re.sub(r'£', '', line_without_amounts).strip()
                if line_without_amounts and len(line_without_amounts) > 2:
                    description_parts.append(line_without_amounts)

            full_description = ' '.join(description_parts)

            transaction = self._parse_hsbc_transaction_block(
                date_str=date_str,
                description=full_description,
                amounts=amounts,
                block_num=block_num
            )

            if transaction:
                transactions.append(transaction)

        transactions.sort(key=lambda x: x['date'])

        self.logger.info(f"Extracted {len(transactions)} transactions")

        return transactions

    def _parse_hsbc_transaction_block(self, date_str: str, description: str, amounts: list, block_num: int) -> Dict:
        """Parse a transaction block into a transaction dictionary"""
        paid_out = 0.0
        paid_in = 0.0
        balance = None

        if len(amounts) == 1:
            transaction_amount_str = amounts[0].replace(',', '')
            transaction_amount = float(transaction_amount_str)

            if any(keyword in description.upper() for keyword in [' CR ', 'WAGES', 'SALARY', 'DEPOSIT', 'TRANSFER IN', 'CREDIT', 'PAYMENT IN']):
                paid_in = transaction_amount
            else:
                paid_out = transaction_amount
            balance = None

        elif len(amounts) == 2:
            transaction_amount_str = amounts[0].replace(',', '')
            balance_str = amounts[1].replace(',', '')

            transaction_amount = float(transaction_amount_str)
            balance = float(balance_str)

            if any(keyword in description.upper() for keyword in [' CR ', 'WAGES', 'SALARY', 'DEPOSIT', 'TRANSFER IN', 'CREDIT']):
                paid_in = transaction_amount
            else:
                paid_out = transaction_amount

        elif len(amounts) == 3:
            balance_str = amounts[2].replace(',', '')
            balance = float(balance_str)

            try:
                amt1 = float(amounts[0].replace(',', ''))
                amt2 = float(amounts[1].replace(',', ''))

                if amt1 > 0:
                    paid_out = amt1
                if amt2 > 0:
                    paid_in = amt2
            except:
                pass

        elif len(amounts) > 3:
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
        clean_desc = description
        for amount in amounts:
            clean_desc = clean_desc.replace(amount, '')
        clean_desc = clean_desc.replace('£', '')
        clean_desc = self._clean_hsbc_description(clean_desc)

        # Parse date
        try:
            date_obj = datetime.strptime(date_str, '%d %b %y')
            parsed_date = date_obj.strftime('%Y-%m-%d')
        except:
            self.logger.debug(f"Block {block_num}: Invalid date: {date_str}")
            return None

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
            'description': clean_desc,
            'debit': debit,
            'credit': credit,
            'balance': balance,
            'type': tx_type
        }

        amount_display = f"£{credit:.2f}" if credit > 0 else f"-£{debit:.2f}"
        balance_display = f"£{balance:.2f}" if balance else "N/A"
        self.logger.debug(f"Block {block_num}: {parsed_date} | {clean_desc[:40]:40} | {amount_display:>12} | Balance: {balance_display}")

        return transaction

    def _clean_hsbc_description(self, text: str) -> str:
        """Clean HSBC transaction description"""
        if not text:
            return ""

        cleaned = text

        # Handle special patterns
        cleaned = re.sub(r'CASH\s+LLOYTSB', '', cleaned)
        cleaned = re.sub(r'CASHPOINT', 'ATM', cleaned)

        # Map type codes
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

        for pattern, replacement in type_mappings.items():
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        # Remove duplicates
        cleaned = re.sub(r'ATM\s+-\s+ATM Withdrawal', 'ATM', cleaned)
        cleaned = re.sub(r'ATM Withdrawal\s+-\s+ATM Withdrawal', 'ATM Withdrawal', cleaned)

        # Remove standalone type codes
        cleaned = re.sub(r'^(DD|SO|ATM|VIS|CR|BP|FPI|FPO|BGC|CHQ|CPT|TFR|ATM/VIS)\s*$', 'Transaction', cleaned)

        # Remove reference numbers
        cleaned = re.sub(r'\b\d{10,}\b', '', cleaned)
        cleaned = re.sub(r'\b[A-Z]{3}\d{1,2}\b', '', cleaned)
        cleaned = re.sub(r'@\d{2}:\d{2}', '', cleaned)

        # Clean spaces
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()
        cleaned = cleaned.strip('.,;:- ')

        if re.match(r'^(Direct Debit|Standing Order|Card Payment|ATM|Transfer|Credit|Bill Payment)\s*-?\s*$', cleaned):
            return cleaned.replace(' -', '')

        return cleaned if cleaned else "Transaction"
