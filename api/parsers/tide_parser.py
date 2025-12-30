"""
Tide Bank Statement Parser
Parses Tide business bank statement PDFs
"""
import pdfplumber
import re
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import sys
import os

# Handle imports
try:
    from .base_parser import BaseBankParser
    from .logger import get_parser_logger
    from .config import get_config, should_skip_line
    from ..utils import parse_uk_date, parse_uk_amount, clean_description
except ImportError:
    # Fallback for direct execution
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from parsers.base_parser import BaseBankParser
    from parsers.logger import get_parser_logger
    from parsers.config import get_config, should_skip_line
    from utils import parse_uk_date, parse_uk_amount, clean_description


class TideParser(BaseBankParser):
    """Parser for Tide Bank business statements"""

    def __init__(self):
        super().__init__()
        self.logger = get_parser_logger('tide')

    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """
        Extract transactions from Tide statement

        Tide Format:
        Date | Transaction type | Details | Paid in (£) | Paid out (£) | Balance (£)

        Challenges:
        - Multi-line descriptions (card details on separate lines)
        - Reverse chronological order in PDF (newest first)
        - "Tide Card: **** **** **** XXXX" lines to filter
        - Date format is 'DD MMM YYYY' (e.g., "31 Aug 2024")
        """
        transactions = []

        with pdfplumber.open(pdf_path) as pdf:
            # First try table extraction (most reliable for Tide's structured format)
            table_transactions = self._extract_from_tables(pdf)

            if table_transactions:
                transactions = table_transactions
            else:
                # Fallback to text-based parsing
                full_text = ''
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + '\n'

                transactions = self._parse_from_text(full_text)

        # Sort chronologically (oldest first) - Tide PDFs are reverse chronological
        transactions.sort(key=lambda x: self._parse_date_for_sorting(x.get('date', '')))

        # Calculate missing balances if needed
        transactions = self._calculate_missing_balances(transactions)

        self.logger.info(f"Extracted {len(transactions)} transactions from Tide statement")
        return transactions

    def _extract_from_tables(self, pdf) -> List[Dict]:
        """Extract transactions using pdfplumber table extraction"""
        transactions = []

        for page_num, page in enumerate(pdf.pages):
            # Try to extract tables with various strategies
            tables = page.extract_tables({
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "snap_tolerance": 5,
                "join_tolerance": 5,
            })

            if not tables:
                # Try text-based strategy if lines don't work
                tables = page.extract_tables({
                    "vertical_strategy": "text",
                    "horizontal_strategy": "text",
                    "snap_tolerance": 10,
                    "join_tolerance": 10,
                })

            for table in tables:
                if not table or len(table) < 2:
                    continue

                # Find header row to identify column positions
                header_idx = self._find_header_row(table)
                if header_idx < 0:
                    continue

                # Process rows after header
                current_transaction = None

                for row_idx in range(header_idx + 1, len(table)):
                    row = table[row_idx]

                    if self._is_transaction_row(row):
                        # Save previous transaction if exists
                        if current_transaction:
                            transactions.append(current_transaction)

                        # Parse new transaction
                        current_transaction = self._parse_tide_row(row)

                    elif current_transaction and self._is_continuation_row(row):
                        # Append continuation details to current transaction
                        self._append_continuation(current_transaction, row)

                # Don't forget last transaction
                if current_transaction:
                    transactions.append(current_transaction)

        return transactions

    def _find_header_row(self, table: List[List]) -> int:
        """Find the header row in a table"""
        for i, row in enumerate(table):
            row_text = ' '.join(str(cell or '') for cell in row).lower()
            if 'date' in row_text and ('paid in' in row_text or 'paid out' in row_text):
                return i
        return -1

    def _is_transaction_row(self, row: List[Optional[str]]) -> bool:
        """
        Check if row is a transaction (starts with date)
        Tide date format: "31 Aug 2024"
        """
        if not row or len(row) < 3:
            return False

        date_str = str(row[0] or '').strip()

        # Check for Tide date pattern: DD MMM YYYY
        date_pattern = r'^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$'
        return bool(re.match(date_pattern, date_str))

    def _is_continuation_row(self, row: List[Optional[str]]) -> bool:
        """
        Check if row is a continuation of previous transaction
        (e.g., "Tide Card: **** **** **** 6642" or additional description)
        """
        if not row:
            return False

        # First cell should be empty (no date)
        first_cell = str(row[0] or '').strip()
        if first_cell and re.match(r'^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$', first_cell):
            return False  # This is a new transaction

        # Check if there's content in other cells
        has_content = any(str(cell or '').strip() for cell in row[1:])
        return has_content

    def _parse_tide_row(self, row: List[Optional[str]]) -> Optional[Dict]:
        """
        Parse a single Tide transaction row from table

        Expected columns: [Date, Transaction type, Details, Paid in, Paid out, Balance]
        """
        try:
            date_str = str(row[0] or '').strip()
            transaction_type = str(row[1] or '').strip() if len(row) > 1 else ''
            details = str(row[2] or '').strip() if len(row) > 2 else ''
            paid_in = str(row[3] or '').strip() if len(row) > 3 else ''
            paid_out = str(row[4] or '').strip() if len(row) > 4 else ''
            balance = str(row[5] or '').strip() if len(row) > 5 else ''

            # Parse date
            parsed_date = self._parse_tide_date(date_str)
            if not parsed_date:
                return None

            # Parse amounts
            credit = self._parse_amount(paid_in)
            debit = self._parse_amount(paid_out)
            parsed_balance = self._parse_amount(balance) if balance else None

            # Build description from transaction type and details
            description = self._build_description(transaction_type, details)

            # Determine type
            type_field = 'income' if credit > 0 else 'expense'

            return {
                'date': parsed_date,
                'description': description or 'Tide Transaction',
                'debit': debit,
                'credit': credit,
                'balance': parsed_balance,
                'type': type_field,
                'transaction_type': transaction_type,
            }

        except Exception as e:
            self.logger.debug(f"Error parsing Tide row: {e}")
            return None

    def _append_continuation(self, transaction: Dict, row: List[Optional[str]]) -> None:
        """Append continuation row details to transaction"""
        # Get details from continuation row (usually in position 2)
        continuation_text = ''
        for cell in row:
            cell_text = str(cell or '').strip()
            if cell_text:
                continuation_text += ' ' + cell_text

        continuation_text = continuation_text.strip()

        # Skip card reference lines but note we have it
        if 'Tide Card:' in continuation_text or re.search(r'\*{4}\s*\*{4}\s*\*{4}\s*\d{4}', continuation_text):
            return  # Don't append card reference to description

        # Skip "Orig. Amt" currency conversion lines
        if continuation_text.lower().startswith('orig.') or 'EGP' in continuation_text or 'TRY' in continuation_text:
            return  # Foreign currency info - optional to include

        # Append meaningful continuation
        if continuation_text and len(continuation_text) > 2:
            current_desc = transaction.get('description', '')
            if continuation_text not in current_desc:
                transaction['description'] = f"{current_desc} {continuation_text}".strip()

    def _build_description(self, transaction_type: str, details: str) -> str:
        """Build clean description from transaction type and details"""
        # Clean details - remove card reference if present
        clean_details = details

        # Remove "Tide Card: **** **** **** XXXX" patterns
        clean_details = re.sub(r'Tide Card:\s*\*+\s*\*+\s*\*+\s*\d+', '', clean_details)
        clean_details = re.sub(r'\*{4}\s*\*{4}\s*\*{4}\s*\d{4}', '', clean_details)

        # Clean up whitespace
        clean_details = ' '.join(clean_details.split()).strip()

        # Combine transaction type with details if both present
        if transaction_type and clean_details:
            # For transfers, include the type
            if 'transfer' in transaction_type.lower():
                return f"{transaction_type}: {clean_details}"
            # For card transactions, just use details (the merchant name)
            elif 'card' in transaction_type.lower():
                return clean_details
            # For direct debits
            elif 'direct debit' in transaction_type.lower():
                return f"Direct Debit: {clean_details}"
            else:
                return f"{transaction_type}: {clean_details}"

        return clean_details or transaction_type or 'Tide Transaction'

    def _parse_from_text(self, text: str) -> List[Dict]:
        """
        Parse transactions from text when table extraction fails
        """
        transactions = []
        lines = text.split('\n')

        # Find transaction section
        tx_start = -1
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if 'date' in line_lower and 'transaction type' in line_lower:
                tx_start = i + 1
                break

        if tx_start < 0:
            # Try to find first transaction date
            for i, line in enumerate(lines):
                if re.match(r'^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}', line.strip()):
                    tx_start = i
                    break

        if tx_start < 0:
            return []

        # Process lines
        current_transaction = None

        for i in range(tx_start, len(lines)):
            line = lines[i].strip()

            if not line:
                continue

            # Check for date at start (new transaction)
            date_match = re.match(r'^(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})', line)

            if date_match:
                # Save previous transaction
                if current_transaction and (current_transaction['debit'] > 0 or current_transaction['credit'] > 0):
                    transactions.append(current_transaction)

                # Start new transaction
                date_str = date_match.group(1)
                parsed_date = self._parse_tide_date(date_str)

                if parsed_date:
                    rest_of_line = line[date_match.end():].strip()
                    current_transaction = self._parse_text_transaction(parsed_date, rest_of_line, lines, i)

            elif current_transaction:
                # Check if this is a continuation line
                if 'Tide Card:' not in line and not line.startswith('Page '):
                    # Could be additional description or amounts
                    self._process_continuation_line(current_transaction, line)

        # Don't forget last transaction
        if current_transaction and (current_transaction['debit'] > 0 or current_transaction['credit'] > 0):
            transactions.append(current_transaction)

        return transactions

    def _parse_text_transaction(self, date: str, line_content: str, lines: List[str], line_idx: int) -> Dict:
        """Parse transaction from text line"""
        transaction = {
            'date': date,
            'description': '',
            'debit': 0.0,
            'credit': 0.0,
            'balance': None,
            'type': 'expense',
        }

        # Try to extract amounts from line
        amounts = re.findall(r'([\d,]+\.\d{2})', line_content)

        if amounts:
            # Last amount is usually balance, others are transaction amounts
            if len(amounts) >= 3:
                # paid_in, paid_out, balance
                transaction['credit'] = self._parse_amount(amounts[0]) if amounts[0] else 0.0
                transaction['debit'] = self._parse_amount(amounts[1]) if amounts[1] else 0.0
                transaction['balance'] = self._parse_amount(amounts[-1])
            elif len(amounts) == 2:
                # Amount and balance
                transaction['debit'] = self._parse_amount(amounts[0])
                transaction['balance'] = self._parse_amount(amounts[1])
            elif len(amounts) == 1:
                transaction['debit'] = self._parse_amount(amounts[0])

            # Extract description (text before amounts)
            first_amount_pos = line_content.find(amounts[0])
            if first_amount_pos > 0:
                transaction['description'] = line_content[:first_amount_pos].strip()
        else:
            transaction['description'] = line_content

        # Determine income/expense
        if transaction['credit'] > 0:
            transaction['type'] = 'income'

        return transaction

    def _process_continuation_line(self, transaction: Dict, line: str) -> None:
        """Process a continuation line for text-based parsing"""
        # Skip card reference lines
        if 'Tide Card:' in line or re.search(r'\*{4}\s*\*{4}\s*\*{4}\s*\d{4}', line):
            return

        # Skip currency conversion lines
        if line.lower().startswith('orig.'):
            return

        # Check for amounts
        amounts = re.findall(r'([\d,]+\.\d{2})', line)
        if amounts and not transaction.get('balance'):
            # Might have found balance
            if len(amounts) >= 1:
                transaction['balance'] = self._parse_amount(amounts[-1])

        # Append to description if meaningful
        desc_part = re.sub(r'[\d,]+\.\d{2}', '', line).strip()
        if desc_part and len(desc_part) > 2:
            current_desc = transaction.get('description', '')
            if desc_part not in current_desc:
                transaction['description'] = f"{current_desc} {desc_part}".strip()

    def _parse_tide_date(self, date_str: str) -> Optional[str]:
        """Parse Tide date format: 'DD MMM YYYY' -> 'DD/MM/YYYY'"""
        try:
            # Handle various formats
            formats = ['%d %b %Y', '%d %B %Y']

            for fmt in formats:
                try:
                    parsed = datetime.strptime(date_str.strip(), fmt)
                    return parsed.strftime('%d/%m/%Y')
                except ValueError:
                    continue

            return None

        except Exception as e:
            self.logger.debug(f"Error parsing date '{date_str}': {e}")
            return None

    def _parse_date_for_sorting(self, date_str: str) -> datetime:
        """Parse date string for sorting purposes"""
        try:
            # Date is in DD/MM/YYYY format
            return datetime.strptime(date_str, '%d/%m/%Y')
        except:
            return datetime.min

    def _parse_amount(self, amount_str: str) -> float:
        """Parse UK amount format"""
        if not amount_str or amount_str.strip() == '':
            return 0.0

        try:
            # Remove currency symbols and commas
            cleaned = amount_str.replace('£', '').replace(',', '').strip()
            return float(cleaned) if cleaned else 0.0
        except ValueError:
            return 0.0

    def _calculate_missing_balances(self, transactions: List[Dict]) -> List[Dict]:
        """Calculate missing balances based on known balances and debits/credits"""
        if not transactions:
            return transactions

        # Find first known balance
        first_balance_idx = None
        for i, txn in enumerate(transactions):
            if txn.get('balance') is not None:
                first_balance_idx = i
                break

        if first_balance_idx is None:
            return transactions

        # Calculate forward from first known balance
        current_balance = transactions[first_balance_idx]['balance']

        for i in range(first_balance_idx + 1, len(transactions)):
            if transactions[i]['credit'] > 0:
                current_balance += transactions[i]['credit']
            if transactions[i]['debit'] > 0:
                current_balance -= transactions[i]['debit']

            if transactions[i].get('balance') is None:
                transactions[i]['balance'] = round(current_balance, 2)
            else:
                # Use the actual balance if present
                current_balance = transactions[i]['balance']

        # Calculate backwards if needed
        if first_balance_idx > 0:
            current_balance = transactions[first_balance_idx]['balance']

            for i in range(first_balance_idx - 1, -1, -1):
                # Go backwards: subtract credits, add debits
                if transactions[i+1]['credit'] > 0:
                    current_balance -= transactions[i+1]['credit']
                if transactions[i+1]['debit'] > 0:
                    current_balance += transactions[i+1]['debit']

                if transactions[i].get('balance') is None:
                    transactions[i]['balance'] = round(current_balance, 2)
                else:
                    current_balance = transactions[i]['balance']

        return transactions
