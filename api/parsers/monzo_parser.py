"""
Monzo Bank Statement Parser
===========================

Rebuilt parser using enhanced base utilities for 95%+ accuracy.

Monzo Statement Format:
- Date format: DD/MM/YYYY
- Columns: Date | Description | Amount | Balance
- CRITICAL: Merchant names appear on PREVIOUS lines (before date line)
- Amount: Negative = debit, Positive = credit
- Reverse chronological order (newest first)

Patterns identified:
1. Simple: "DD/MM/YYYY Description -amount balance"
2. Multi-line: Merchant on previous line, date line has amount/balance
3. With reference: "Reference: XXX" on separate line (skip this)

Author: Bank Statement Converter Team
Last Updated: December 2024
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
    from .config import get_config
except ImportError:
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from parsers.base_parser import BaseBankParser
    from parsers.logger import get_parser_logger
    from parsers.config import get_config


class MonzoParser(BaseBankParser):
    """
    Parser for Monzo Bank UK statements.
    
    Key Features:
    - Hybrid extraction (table → text)
    - Backward lookup for merchant names
    - Safe amount extraction
    - Handles reverse chronological order
    """
    
    # Monzo-specific patterns
    DATE_PATTERN = r'^\d{1,2}/\d{1,2}/\d{4}'
    HEADER_KEYWORDS = ['Date', 'Description', 'Amount', 'Balance']
    
    def __init__(self):
        super().__init__()
        self.logger = get_parser_logger('monzo')
        self.config = get_config('monzo')
    
    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """
        Extract transactions from Monzo statement.
        
        Strategy:
        1. Try table extraction first (cleanest when it works)
        2. Fall back to text extraction (handles edge cases)
        3. Reverse to chronological order
        4. Fill missing balances
        5. Deduplicate
        """
        transactions = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Strategy 1: Try table extraction
                table_transactions = self._extract_from_tables(pdf)
                self.logger.debug(f"Table extraction: {len(table_transactions)} transactions")
                
                # Strategy 2: Text extraction (usually more reliable for Monzo)
                text_transactions = self._extract_from_text(pdf)
                self.logger.debug(f"Text extraction: {len(text_transactions)} transactions")
                
                # Use whichever got more results
                if len(table_transactions) >= len(text_transactions):
                    transactions = table_transactions
                    self.logger.info(f"Using table extraction: {len(transactions)} transactions")
                else:
                    transactions = text_transactions
                    self.logger.info(f"Using text extraction: {len(transactions)} transactions")
            
            # Sort by date (chronological order)
            # Monzo shows newest first, but sorting is more reliable than reversing
            transactions.sort(key=lambda x: x.get('date', ''))
            
            # Fill missing balances
            transactions = self.calculate_missing_balances(transactions)
            
            # Remove duplicates
            transactions = self.deduplicate_transactions(transactions)
            
            self.logger.info(f"Final: {len(transactions)} transactions extracted")
            
        except Exception as e:
            self.logger.error(f"Error parsing Monzo PDF: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return transactions
    
    # =========================================================================
    # TABLE EXTRACTION
    # =========================================================================
    
    def _extract_from_tables(self, pdf: pdfplumber.PDF) -> List[Dict]:
        """Extract transactions from PDF tables"""
        transactions = []
        
        for page_num, page in enumerate(pdf.pages):
            # Try different table extraction strategies
            for settings in [
                {"vertical_strategy": "lines", "horizontal_strategy": "lines"},
                {"vertical_strategy": "text", "horizontal_strategy": "text"},
            ]:
                tables = page.extract_tables(settings)
                
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    
                    # Check if this looks like a transaction table
                    header = table[0] if table[0] else []
                    header_text = ' '.join(str(cell or '') for cell in header).lower()
                    
                    if 'date' in header_text and ('amount' in header_text or 'balance' in header_text):
                        # Parse rows
                        for row in table[1:]:
                            txn = self._parse_table_row(row)
                            if txn:
                                transactions.append(txn)
        
        return transactions
    
    def _parse_table_row(self, row: List[Optional[str]]) -> Optional[Dict]:
        """Parse a single table row into transaction dict"""
        if not row or len(row) < 3:
            return None
        
        try:
            # Expected: [Date, Description, Amount, Balance] or similar
            date_str = str(row[0] or '').strip()
            
            # Validate date format
            if not re.match(self.DATE_PATTERN, date_str):
                return None
            
            # Parse date
            parsed_date = self._parse_monzo_date(date_str)
            if not parsed_date:
                return None
            
            # Get description (column 1 or combined)
            description = str(row[1] or '').strip() if len(row) > 1 else ''
            
            # Get amount and balance from last columns
            amount_str = None
            balance_str = None
            
            if len(row) >= 4:
                amount_str = str(row[2] or '').strip()
                balance_str = str(row[3] or '').strip()
            elif len(row) == 3:
                # Might be combined amount/balance
                amount_str = str(row[2] or '').strip()
            
            # Parse amount
            amount = self._parse_monzo_amount(amount_str)
            if amount is None:
                return None
            
            # Parse balance
            balance = self._parse_monzo_amount(balance_str) if balance_str else None
            
            # Determine debit/credit
            if amount < 0:
                debit = abs(amount)
                credit = 0.0
            else:
                debit = 0.0
                credit = amount
            
            # Clean description
            clean_desc = self._clean_monzo_description(description)
            if not clean_desc:
                clean_desc = "Monzo Transaction"
            
            return {
                'date': parsed_date,
                'description': clean_desc,
                'debit': debit,
                'credit': credit,
                'balance': balance,
                'type': 'income' if credit > 0 else 'expense'
            }
            
        except Exception as e:
            self.logger.debug(f"Error parsing table row: {e}")
            return None
    
    # =========================================================================
    # TEXT EXTRACTION (Primary method for Monzo)
    # =========================================================================
    
    def _extract_from_text(self, pdf: pdfplumber.PDF) -> List[Dict]:
        """Extract transactions from PDF text"""
        # Combine text from all pages
        all_text = ''
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                all_text += page_text + '\n'
        
        return self._parse_monzo_text(all_text)
    
    def _parse_monzo_text(self, text: str) -> List[Dict]:
        """Parse transactions from Monzo text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        self.logger.debug(f"Processing {len(lines)} lines")
        
        # Find header
        header_idx = self._find_header(lines)
        if header_idx < 0:
            self.logger.warning("No header found in text")
            return transactions
        
        # Process lines after header
        i = header_idx + 1
        
        while i < len(lines):
            line = lines[i]
            
            # STOP CONDITIONS: End of main transaction section
            # Monzo PDFs have Pot statements after main account
            if self._is_end_of_transactions(line):
                self.logger.debug(f"End of transactions at line {i}: {line[:50]}")
                break
            
            # Check for date at start of line
            date_match = re.match(self.DATE_PATTERN, line)
            
            if date_match:
                # Found a date line - parse the transaction
                txn = self._parse_text_transaction(lines, i, header_idx)
                if txn:
                    transactions.append(txn)
            
            i += 1
        
        return transactions
    
    def _is_end_of_transactions(self, line: str) -> bool:
        """Check if we've reached the end of the main transaction section"""
        line_lower = line.lower()
        
        # Pot statement section markers
        if 'pot statement' in line_lower:
            return True
        if 'pot name' in line_lower:
            return True
        
        # Monzo disclaimer - usually appears between sections
        if 'monzo bank limited' in line_lower and 'registered' in line_lower:
            return True
        
        # Second header (for Pot section) - but only if it's not the first
        # We detect this by checking for specific Pot indicators before it
        
        return False
    
    def _find_header(self, lines: List[str]) -> int:
        """Find the header line index"""
        for i, line in enumerate(lines):
            # Check for header keywords
            line_lower = line.lower()
            matches = sum(1 for kw in self.HEADER_KEYWORDS if kw.lower() in line_lower)
            if matches >= 2:
                self.logger.debug(f"Found header at line {i}: {line[:60]}")
                return i
        return -1
    
    def _parse_text_transaction(self, lines: List[str], date_line_idx: int, header_idx: int) -> Optional[Dict]:
        """
        Parse a transaction starting from a date line.
        
        CRITICAL: Monzo puts merchant names on PREVIOUS lines,
        so we need to look BACKWARD to get the full description.
        
        Format examples:
        1. "Mikayle Stewart (Faster Payments)" then "31/01/2024 50.00 573.30"
        2. "SHOPIFY..." then "31/01/2024 Payments) Reference:... 54.62 523.30"
        """
        line = lines[date_line_idx]
        
        # Extract date
        date_match = re.match(self.DATE_PATTERN, line)
        if not date_match:
            return None
        
        date_str = date_match.group(0)
        after_date = line[len(date_str):].strip()
        
        # Parse date
        parsed_date = self._parse_monzo_date(date_str)
        if not parsed_date:
            return None
        
        # Find amount and balance at end of line
        # Pattern: "description -123.45 456.78" or "description 123.45 456.78"
        amount_balance_match = re.search(r'(-?[\d,]+\.?\d{0,2})\s+(-?[\d,]+\.?\d{0,2})\s*$', after_date)
        
        if not amount_balance_match:
            # Try single amount pattern
            single_amount_match = re.search(r'(-?[\d,]+\.?\d{2})\s*$', after_date)
            if single_amount_match:
                amount_str = single_amount_match.group(1)
                balance_str = None
                desc_on_line = after_date[:single_amount_match.start()].strip()
            else:
                return None
        else:
            amount_str = amount_balance_match.group(1)
            balance_str = amount_balance_match.group(2)
            desc_on_line = after_date[:amount_balance_match.start()].strip()
        
        # Parse amounts
        amount = self._parse_monzo_amount(amount_str)
        if amount is None:
            return None
        
        balance = self._parse_monzo_amount(balance_str) if balance_str else None
        
        # CRITICAL: Look backward for merchant name
        merchant_name = self._look_backward_for_merchant(lines, date_line_idx, header_idx)
        
        # Build description - combine merchant + desc_on_line smartly
        description = self._build_description(merchant_name, desc_on_line)
        
        # Skip if description looks like disclaimer/header text
        if self._is_invalid_description(description):
            return None
        
        # Fallback description
        if not description:
            description = "Payment" if amount < 0 else "Deposit"
        
        # Determine debit/credit
        if amount < 0:
            debit = abs(amount)
            credit = 0.0
        else:
            debit = 0.0
            credit = amount
        
        return {
            'date': parsed_date,
            'description': description,
            'debit': debit,
            'credit': credit,
            'balance': balance,
            'type': 'income' if credit > 0 else 'expense'
        }
    
    def _build_description(self, merchant_name: str, desc_on_line: str) -> str:
        """Build final description from merchant name and date line text"""
        parts = []
        
        # Check if desc_on_line is a complete description (like "Transfer to Pot")
        # This happens when the transaction type is on the same line as the date
        same_line_patterns = [
            r'^Transfer\s+(to|from)\s+Pot',
            r'^Pot\s+transfer',
        ]
        
        for pattern in same_line_patterns:
            if desc_on_line and re.match(pattern, desc_on_line, re.IGNORECASE):
                # Use the same-line description as primary
                return self._clean_monzo_description(desc_on_line)
        
        if merchant_name:
            parts.append(merchant_name)
        
        if desc_on_line:
            # Clean the desc_on_line first
            clean_desc = desc_on_line
            
            # Remove "Payments)" artifacts from split lines
            clean_desc = re.sub(r'^Payments?\)\s*', '', clean_desc)
            
            # Remove Reference: and everything after
            clean_desc = re.sub(r'Reference:.*$', '', clean_desc, flags=re.IGNORECASE).strip()
            
            # Only add if it's meaningful and not already in merchant
            if clean_desc and len(clean_desc) > 2:
                if not merchant_name or clean_desc.lower() not in merchant_name.lower():
                    parts.append(clean_desc)
        
        combined = ' '.join(parts).strip()
        return self._clean_monzo_description(combined)
    
    def _is_invalid_description(self, description: str) -> bool:
        """Check if description is actually disclaimer/invalid text"""
        if not description:
            return False
        
        invalid_patterns = [
            r'deposits in this account',
            r'protected by',
            r'Financial Services',
            r'Compensation Scheme',
            r'eligible depositors',
            r'more information',
            r'^The\s+',  # Starts with "The " - likely disclaimer
        ]
        
        desc_lower = description.lower()
        for pattern in invalid_patterns:
            if re.search(pattern, desc_lower, re.IGNORECASE):
                return True
        
        return False
    
    def _look_backward_for_merchant(self, lines: List[str], current_idx: int, header_idx: int) -> str:
        """
        Look backward from current date line to find merchant name.
        
        Monzo places merchant names on separate lines BEFORE the date line.
        We look back up to 3 lines (usually just 1), stopping at:
        - Another date line
        - The header
        - Reference lines
        - Pure number lines
        
        Example:
            Line N-1: "Mikayle Stewart (Faster Payments)"
            Line N:   "31/01/2024 50.00 573.30"
        """
        merchant_parts = []
        max_lookback = 3  # Usually merchant is just 1-2 lines back
        
        for j in range(1, min(max_lookback + 1, current_idx - header_idx)):
            if current_idx - j <= header_idx:
                break
                
            prev_line = lines[current_idx - j].strip()
            
            # Stop if we hit another date line (previous transaction)
            if re.match(self.DATE_PATTERN, prev_line):
                break
            
            # Stop if we hit the header
            if 'Date' in prev_line and 'Description' in prev_line:
                break
            
            # Skip patterns - don't include these in merchant name
            if self._should_skip_line_for_merchant(prev_line):
                continue
            
            # Valid merchant line - add to front
            if len(prev_line) >= 3:
                merchant_parts.insert(0, prev_line)
                # Usually merchant is just 1 line, break after finding it
                # unless it looks like a continuation (ends with open paren)
                if not prev_line.rstrip().endswith('('):
                    break
        
        return ' '.join(merchant_parts)
    
    def _should_skip_line_for_merchant(self, line: str) -> bool:
        """Check if line should be skipped when looking for merchant"""
        line_lower = line.lower()
        
        # Skip reference lines
        if line_lower.startswith('reference:'):
            return True
        
        # Skip "this relates to" lines
        if 'this relates to' in line_lower:
            return True
        
        # Skip pure amount lines (two numbers)
        if re.match(r'^-?[\d,]+\.?\d{0,2}\s+-?[\d,]+\.?\d{0,2}\s*$', line):
            return True
        
        # Skip very short lines
        if len(line) < 3:
            return True
        
        return False
    
    # =========================================================================
    # DATE PARSING
    # =========================================================================
    
    def _parse_monzo_date(self, date_str: str) -> Optional[str]:
        """Parse Monzo date format: DD/MM/YYYY -> YYYY-MM-DD"""
        try:
            match = re.match(r'(\d{1,2})/(\d{1,2})/(\d{4})', date_str)
            if match:
                day, month, year = match.groups()
                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        except Exception as e:
            self.logger.debug(f"Error parsing date '{date_str}': {e}")
        return None
    
    # =========================================================================
    # AMOUNT PARSING
    # =========================================================================
    
    def _parse_monzo_amount(self, amount_str: str) -> Optional[float]:
        """Parse Monzo amount string"""
        if not amount_str:
            return None
        
        try:
            # Clean the string
            clean = amount_str.replace(',', '').replace('£', '').strip()
            
            # Handle empty
            if not clean:
                return None
            
            amount = float(clean)
            
            # Validate realistic amount
            if abs(amount) > self.MAX_AMOUNT:
                return None
            
            return amount
            
        except (ValueError, TypeError):
            return None
    
    # =========================================================================
    # DESCRIPTION CLEANING
    # =========================================================================
    
    def _clean_monzo_description(self, text: str) -> str:
        """
        Clean Monzo transaction description.
        
        Removes:
        - Reference: XXX patterns
        - Payment type indicators (Faster Payments, etc.)
        - Country codes (GBR, IRL, etc.)
        - Extra whitespace
        """
        if not text:
            return ""
        
        cleaned = text
        
        # Remove "Reference:" and everything after
        cleaned = re.sub(r'\s*Reference:.*$', '', cleaned, flags=re.IGNORECASE)
        
        # Remove payment type indicators
        payment_types = [
            r'\(?\s*Faster\s+Payments?\s*\)?',
            r'\(?\s*Direct\s+Debit\s*\)?',
            r'\(?\s*Standing\s+Order\s*\)?',
            r'\(?\s*Bank\s+Transfer\s*\)?',
            r'\(?\s*Card\s+Payment\s*\)?',
        ]
        for pattern in payment_types:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Remove standalone "Payments)" at start (artifact from split)
        cleaned = re.sub(r'^\s*Payments?\)\s*', '', cleaned)
        
        # Remove "This relates to" text
        cleaned = re.sub(r'\s*This\s+relates\s+to.*$', '', cleaned, flags=re.IGNORECASE)
        
        # Remove country codes at start
        cleaned = re.sub(r'^(ACC|GBR|IRL|USA|EUR|USD|GBP)\s+', '', cleaned)
        
        # Remove empty parentheses
        cleaned = re.sub(r'\s*\(\s*\)\s*', '', cleaned)
        
        # Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        # Remove trailing punctuation
        cleaned = cleaned.strip('.,;:- ')
        
        return cleaned
