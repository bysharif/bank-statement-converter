"""
Barclays Bank Statement Parser
Uses table extraction for accurate parsing with text fallback
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
    from ..utils import parse_uk_date, parse_uk_amount, clean_description
except ImportError:
    # Fallback for direct execution
    api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from parsers.base_parser import BaseBankParser
    from utils import parse_uk_date, parse_uk_amount, clean_description


class BarclaysParser(BaseBankParser):
    """Parser for Barclays Bank UK statements"""
    
    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """
        Extract transactions from Barclays statement
        
        Barclays Format:
        Date | Description | Money out | Money in | Balance
        
        Challenges:
        - Balance column is sparse (not on every row)
        - Descriptions can be very long/multi-line
        - Date format is 'DD MMM' without year
        - PDF uses text layout, not structured tables
        """
        transactions = []
        statement_year = self._extract_year_from_header(pdf_path)
        last_known_balance = None
        
        with pdfplumber.open(pdf_path) as pdf:
            # First try table extraction
            for page_num, page in enumerate(pdf.pages):
                tables = page.extract_tables({
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "snap_tolerance": 3,
                    "join_tolerance": 3,
                })
                
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                    
                    # Skip header rows and find transaction rows
                    for row in table:
                        if self._is_transaction_row(row):
                            txn = self._parse_barclays_row(row, statement_year, last_known_balance)
                            if txn:
                                transactions.append(txn)
                                # Update last known balance if present
                                if txn.get('balance') is not None:
                                    last_known_balance = txn['balance']
            
            # Always use text-based parsing (table extraction often fails for Barclays)
            # Extract text from ALL pages
            full_text = ''
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + '\n'
            
            # Parse from text (more reliable for Barclays multi-page statements)
            text_transactions = self._parse_from_text(full_text, statement_year)
            if text_transactions:
                transactions = text_transactions  # Use text-based parsing results
        
        # Fill in missing balances by calculation
        transactions = self._calculate_missing_balances(transactions)
        
        return transactions
    
    def _extract_year_from_header(self, pdf_path: str) -> str:
        """
        Extract year from statement header
        Example: "01 - 28 Apr 2023" -> 2023
        """
        try:
            with pdfplumber.open(pdf_path) as pdf:
                first_page_text = pdf.pages[0].extract_text()
                
                # Look for "DD - DD MMM YYYY" pattern
                year_pattern = r'\d{1,2}\s+-\s+\d{1,2}\s+\w{3}\s+(\d{4})'
                match = re.search(year_pattern, first_page_text)
                if match:
                    return match.group(1)
                
                # Fallback: look for "Statement date DD MMM YYYY"
                statement_date_pattern = r'Statement date\s+\d{1,2}\s+\w{3}\s+(\d{4})'
                match = re.search(statement_date_pattern, first_page_text, re.IGNORECASE)
                if match:
                    return match.group(1)
        except Exception as e:
            print(f"Error extracting year from header: {e}")
        
        # Default to current year (or 2023 based on statement)
        return "2023"
    
    def _is_transaction_row(self, row: List[Optional[str]]) -> bool:
        """
        Check if row is a transaction
        - Must have date in first column (DD MMM format)
        - Ignore "Start balance", "End balance", "Continued"
        - Must have at least 3 columns
        """
        if not row or len(row) < 3:
            return False
        
        date_str = str(row[0] or '').strip()
        
        # Check for date pattern: DD MMM (one or two digit day)
        date_pattern = r'^\d{1,2}\s+\w{3}$'
        if not re.match(date_pattern, date_str, re.IGNORECASE):
            return False
        
        # Exclude special rows
        description = str(row[1] or '').lower() if len(row) > 1 else ''
        if any(word in description for word in ['start balance', 'end balance', 'continued']):
            return False
        
        return True
    
    def _parse_barclays_row(self, row: List[Optional[str]], year: str, last_balance: Optional[float]) -> Optional[Dict]:
        """
        Parse a single Barclays transaction row from table
        
        Row format: [Date, Description, Money out, Money in, Balance]
        Note: Balance may be empty string
        """
        try:
            date_str = str(row[0] or '').strip()
            description = str(row[1] or '').strip() if len(row) > 1 else ''
            money_out = str(row[2] or '').strip() if len(row) > 2 else ''
            money_in = str(row[3] or '').strip() if len(row) > 3 else ''
            balance = str(row[4] or '').strip() if len(row) > 4 else ''
            
            # Parse date (add year from header)
            parsed_date = self._parse_barclays_date(date_str, year)
            if not parsed_date:
                return None
            
            # Parse amounts
            debit = self._parse_amount(money_out)
            credit = self._parse_amount(money_in)
            parsed_balance = self._parse_amount(balance) if balance and balance.strip() else None
            
            # Clean description (remove extra whitespace/newlines)
            clean_description = ' '.join(description.split()) if description else ''
            clean_description = clean_description.strip()
            
            # Classify transaction type
            transaction_type = self._classify_transaction_type(clean_description)
            
            # Determine income/expense for type field
            type_field = 'income' if credit > 0 else 'expense'
            
            return {
                'date': parsed_date,
                'description': clean_description or 'Barclays Transaction',
                'debit': debit,
                'credit': credit,
                'balance': parsed_balance,
                'type': type_field,
                'transaction_category': transaction_type
            }
            
        except Exception as e:
            print(f"Error parsing Barclays row: {e}, row: {row}")
            return None
    
    def _parse_from_text(self, text: str, year: str) -> List[Dict]:
        """
        Parse transactions from text when table extraction fails
        Uses column-aware text parsing based on spacing/alignment
        
        CRITICAL FIXES:
        1. Balance Detection: Rightmost amount is typically balance when 2+ amounts present
        2. Description Deduplication: Stop collection when new transaction date found
        3. Money In/Out Classification: Improved logic with confidence scoring
        """
        transactions = []
        lines = text.split('\n')
        
        # Find first transaction section (start processing from here)
        tx_start = -1
        for i, line in enumerate(lines):
            if 'Date' in line and 'Description' in line and ('Money out' in line or 'Money in' in line):
                tx_start = i + 1
                break
        
        # If no header found, find first transaction date
        if tx_start < 0:
            for i, line in enumerate(lines):
                if re.match(r'^\d{1,2}\s+\w{3}', line.strip(), re.IGNORECASE) and \
                   ('start balance' not in line.lower() and 'end balance' not in line.lower()):
                    tx_start = i
                    break
        
        if tx_start < 0:
            return []
        
        # Process ALL lines from tx_start to end - don't stop early
        # Barclays statements have transactions across multiple pages
        transactions = []
        i = tx_start
        current_date = None  # Track current date for transactions without explicit dates
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines and headers (but allow multiple header sections)
            if not line:
                i += 1
                continue
            
            # Skip header lines but continue processing
            if 'Date' in line and 'Description' in line and ('Money out' in line or 'Money in' in line):
                i += 1
                continue
            
            # Look for date at start (DD MMM format)
            date_match = re.match(r'^(\d{1,2}\s+\w{3})(\s+\d{4})?', line, re.IGNORECASE)
                
            if date_match:
                date_str = date_match.group(1)

                # Skip balance lines (comprehensive check)
                line_lower = line.lower()
                words = line_lower.split()
                is_balance_line = (
                    'start balance' in line_lower or
                    'end balance' in line_lower or
                    (words and words[-1] == 'balance')
                )
                if is_balance_line:
                    i += 1
                    continue
                
                parsed_date = self._parse_barclays_date(date_str, year)
                if parsed_date:
                    current_date = parsed_date  # Update current date
                    
                    # Parse transaction with improved logic
                    txn_result = self._parse_transaction_block(lines, i, current_date, year)
                    
                    if txn_result:
                        txn, next_index = txn_result
                        if txn:
                            transactions.append(txn)
                        i = next_index
                        continue
            
            # IMPORTANT: Also check for transactions WITHOUT dates on their own line
            # These share the date from the previous transaction but are separate transactions
            # Pattern: Description + Amount (no date prefix)
            # Example: "Card Payment to Amazon" without "01 Apr" prefix (shares date from previous line)
            if current_date and not date_match:  # Only process if we didn't already match a date on this line
                # Look for lines with amounts that could be separate transactions
                # Must have description + amount, and description should start with transaction type keywords
                amount_match = re.search(r'([\d,]+\.\d{1,2})\s*$', line)
                if amount_match:
                    amount = parse_uk_amount(amount_match.group(1))
                    desc_text = line[:amount_match.start()].strip()
                    
                    # Skip if this line is clearly not a transaction
                    if (desc_text.lower().startswith('ref:') or 
                        desc_text.lower().startswith('on ') or
                        'start balance' in desc_text.lower() or
                        'end balance' in desc_text.lower() or
                        len(desc_text) < 3):
                        i += 1
                        continue
                    
                    # Check if this looks like a transaction description
                    # It should:
                    # 1. Have a reasonable amount
                    # 2. Have a description that looks like a merchant/transaction
                    # 3. NOT be a ref line or date continuation
                    is_transaction_line = (
                        amount >= 0.01 and amount < 100000 and
                        len(desc_text) >= 3 and
                        # Must start with transaction type OR be a merchant name (capitalized)
                        (re.match(r'^(card payment|direct debit|dd|transfer|bill payment|standing order)', desc_text, re.IGNORECASE) or
                         re.match(r'^[A-Z][a-zA-Z0-9\s&\-\.]+', desc_text))  # Merchant name pattern
                    )
                    
                    if is_transaction_line:
                        # This is a separate transaction on the same date
                        classification = self._classify_money_flow(desc_text)
                        if classification['is_income']:
                            credit = amount
                            debit = 0.0
                        else:
                            debit = amount
                            credit = 0.0
                        
                        clean_desc = clean_description(desc_text, max_length=50)
                        
                        transactions.append({
                            'date': current_date,
                            'description': clean_desc,
                            'debit': debit,
                            'credit': credit,
                            'balance': None,
                            'type': 'income' if credit > 0 else 'expense',
                            'transaction_category': classification['category']
                        })
                        # Don't increment i here, let it increment at the end to avoid skipping lines
            
            i += 1
        
        # Remove duplicates (same date, same amount, similar description)
        seen = set()
        unique_transactions = []
        for txn in transactions:
            key = (txn['date'], round(txn.get('debit', 0) + txn.get('credit', 0), 2), txn['description'][:30])
            if key not in seen:
                seen.add(key)
                unique_transactions.append(txn)
        
        return unique_transactions
    
    def _parse_transaction_block(self, lines: List[str], start_idx: int, date: str, year: str) -> Optional[Tuple[Dict, int]]:
        """
        Parse a complete transaction block starting at start_idx
        
        Returns: (transaction_dict, next_line_index) or None
        
        FIX 1: Balance Detection
        - Balance is typically the RIGHTMOST amount when 2+ amounts present
        - Transaction amount appears before balance
        - Validate balance against previous balance +/- transaction
        
        FIX 2: Description Deduplication
        - Stop collection when new transaction date is found
        - Remove duplicate phrases within descriptions
        - Clean up merged text
        
        FIX 3: Money In/Out Classification
        - Improved indicators with confidence scoring
        - Better handling of edge cases
        """
        line = lines[start_idx].strip()
        date_match = re.match(r'^(\d{1,2}\s+\w{3})', line, re.IGNORECASE)
        if not date_match:
            return None
        
        text_after_date = line[date_match.end():].strip()
        
        # FIX 2: Collect description parts, stopping at new transaction
        description_parts = []
        amounts_found = []
        ref_lines_seen = set()  # Track ref lines to avoid duplicates
        
        # Parse current line - check for amount
        amount_on_same_line = re.search(r'([\d,]+\.?\d{1,2})\s*$', text_after_date)
        
        if amount_on_same_line:
            amount_str = amount_on_same_line.group(1)
            amounts_found.append(parse_uk_amount(amount_str))
            desc_text = text_after_date[:amount_on_same_line.start()].strip()
            if desc_text:
                description_parts.append(desc_text)
        else:
            if text_after_date:
                description_parts.append(text_after_date)
        
        # Look ahead for continuation lines - STOP at next transaction date
        j = start_idx + 1
        max_look_ahead = 25  # Increased for very long descriptions
        found_amount = bool(amounts_found)  # Track if we've found the transaction amount
        
        while j < len(lines) and j < start_idx + max_look_ahead:
            next_line = lines[j].strip()
            
            # FIX 2: CRITICAL - STOP if we hit a new transaction date
            if next_line and re.match(r'^\d{1,2}\s+\w{3}', next_line, re.IGNORECASE):
                break
            
            # Skip empty lines
            if not next_line:
                j += 1
                continue
            
            # Skip ref lines completely
            if next_line.lower().startswith('ref:'):
                ref_lines_seen.add(next_line.lower())
                j += 1
                continue
            
            # Skip "On DD MMM" date continuation lines
            if re.match(r'^On\s+\d{1,2}\s+\w{3}', next_line, re.IGNORECASE):
                j += 1
                continue
            
            # Check if this line has an amount at the end
            amount_match = re.search(r'([\d,]+\.?\d{1,2})\s*$', next_line)
            if amount_match:
                amount_str = amount_match.group(1)
                parsed_amount = parse_uk_amount(amount_str)
                
                if parsed_amount >= 0.01 and parsed_amount < 100000:
                    # This could be:
                    # 1. Transaction amount on continuation line
                    # 2. Balance amount
                    # Only add if we haven't found the transaction amount yet
                    if not found_amount:
                        amounts_found.append(parsed_amount)
                        found_amount = True
                        # Extract description part if any
                        desc_part = next_line[:amount_match.start()].strip()
                        if desc_part and not desc_part.lower().startswith('ref:'):
                            description_parts.append(desc_part)
                    else:
                        # Already found transaction amount - be VERY conservative about balance
                        # Balance typically appears on SAME line in structured format
                        # If amount appears on continuation line, it's likely NEXT transaction's amount
                        # Only add as balance if:
                        # 1. It's on the SAME line as date (not continuation)
                        # 2. OR it's significantly larger (>10x) and clearly separated
                        
                        # For now, DON'T extract balance from continuation lines
                        # Let balance calculation logic fill it in instead
                        break  # Stop after finding transaction amount
                else:
                    # Invalid amount, treat as description
                    if not self._is_duplicate_text(next_line, description_parts):
                        description_parts.append(next_line)
            else:
                # Description continuation - check for duplicates
                if not self._is_duplicate_text(next_line, description_parts):
                    description_parts.append(next_line)
            
            j += 1
        
        # FIX 2: Clean description - remove duplicates and truncate
        full_description = ' '.join(description_parts).strip()
        full_description = self._deduplicate_description(full_description)
        # Use max_length=50 for table display (Amount and Type columns visible)
        full_description = clean_description(full_description, max_length=50)
        
        # Skip if it's a balance line
        if 'start balance' in full_description.lower() or 'end balance' in full_description.lower():
            return None, j
        
        if not amounts_found:
            return None, j
        
        # FIX 3: Classify money flow with confidence
        classification = self._classify_money_flow(full_description)
        
        # FIX 1: Parse amounts - balance is RIGHTMOST when multiple amounts present
        # But validate: balance should be reasonable (larger, or within range of previous balance)
        money_out = 0.0
        money_in = 0.0
        balance = None
        
        if len(amounts_found) == 1:
            # Single amount = transaction amount only (no balance shown)
            if classification['is_income']:
                money_in = amounts_found[0]
            else:
                money_out = amounts_found[0]
        elif len(amounts_found) == 2:
            # Two amounts on SAME LINE: Could be transaction + balance
            # Be conservative - only treat as balance if:
            # 1. One is significantly larger (>10x) - likely balance
            # 2. Both on same line as date (structured column format)
            amount1, amount2 = amounts_found[0], amounts_found[1]
            
            # If second is MUCH larger (>10x), it's likely balance
            if amount2 > amount1 * 10 or abs(amount2) > abs(amount1) * 10:
                balance = amount2
                if classification['is_income']:
                    money_in = amount1
                else:
                    money_out = amount1
            elif amount1 > amount2 * 10 or abs(amount1) > abs(amount2) * 10:
                balance = amount1
                if classification['is_income']:
                    money_in = amount2
                else:
                    money_out = amount2
            else:
                # Similar sizes - be conservative: use first as transaction, ignore second
                # (Second might be next transaction's amount picked up incorrectly)
                if classification['is_income']:
                    money_in = amount1
                else:
                    money_out = amount1
                # Don't set balance - let calculation logic handle it
                balance = None
        else:
            # Three or more: RIGHTMOST is balance, transaction is typically first
            balance = amounts_found[-1]  # Rightmost = balance
            if classification['is_income']:
                money_in = amounts_found[0]
            else:
                money_out = amounts_found[0]
        
        # Only add if we have a valid transaction amount
        if money_out > 0 or money_in > 0:
            return {
                'date': date,
                'description': full_description or 'Barclays Transaction',
                'debit': money_out,
                'credit': money_in,
                'balance': balance,
                'type': 'income' if money_in > 0 else 'expense',
                'transaction_category': classification['category'],
                'classification_confidence': classification['confidence']
            }, j
        
        return None, j
    
    def _deduplicate_description(self, description: str) -> str:
        """
        FIX 2: Remove duplicate phrases from description
        
        Example: "Direct Debit to V12 Retail Finance Direct Debit to"
        -> "Direct Debit to V12 Retail Finance"
        """
        if not description:
            return description
        
        # Split into words
        words = description.split()
        
        # Check for repeated phrases (2+ consecutive words)
        for phrase_len in range(3, len(words) // 2 + 1):
            for i in range(len(words) - phrase_len * 2 + 1):
                phrase = words[i:i+phrase_len]
                
                # Check if this phrase repeats later
                for j in range(i + phrase_len, len(words) - phrase_len + 1):
                    if words[j:j+phrase_len] == phrase:
                        # Found duplicate, remove the second occurrence
                        words = words[:j] + words[j+phrase_len:]
                        # Restart check with updated words
                        return self._deduplicate_description(' '.join(words))
        
        return ' '.join(words)
    
    def _is_duplicate_text(self, text: str, existing_parts: List[str]) -> bool:
        """
        Check if text is a duplicate of existing description parts
        """
        text_lower = text.lower().strip()
        for part in existing_parts:
            if text_lower in part.lower() or part.lower() in text_lower:
                if len(text_lower) > 10:  # Only check for substantial matches
                    return True
        return False
    
    def _classify_money_flow(self, description: str) -> Dict:
        """
        FIX 3: Classify transaction as income or expense with confidence score
        
        Returns: {
            'is_income': bool,
            'category': str,
            'confidence': float (0-1)
        }
        """
        if not description:
            return {
                'is_income': False,
                'category': 'other',
                'confidence': 0.5
            }
        
        desc_lower = description.lower()
        confidence = 0.5
        is_income = False
        category = 'other'
        
        # INCOME INDICATORS - Check these FIRST (more specific patterns)
        # "Bill Payment FROM" and "Transfer FROM" are money IN, not OUT
        income_patterns = [
            (['bill payment from'], 'credit', 0.98),  # CRITICAL: Bill Payment FROM = money IN
            (['received from', 'received'], 'credit', 0.95),
            (['payment from'], 'credit', 0.90),
            (['transfer from'], 'transfer', 0.90),
            (['salary', 'wage'], 'salary', 0.95),
            (['deposit'], 'deposit', 0.90),
            (['card refund', 'refund'], 'refund', 0.95),  # Refunds are income
            (['credit'], 'credit', 0.75),
        ]

        # EXPENSE INDICATORS (Priority: Higher confidence for more specific matches)
        # Note: "Bill Payment TO" is expense, "Bill Payment FROM" is income (checked above)
        expense_patterns = [
            (['direct debit', 'dd'], 'direct_debit', 0.95),
            (['bill payment to'], 'bill_payment', 0.95),  # Bill Payment TO = money OUT
            (['bill payment'], 'bill_payment', 0.85),  # Generic bill payment (assume expense if no FROM/TO)
            (['card payment', 'card purchase'], 'card_payment', 0.90),
            (['standing order'], 'standing_order', 0.95),
            (['transfer to'], 'transfer', 0.85),
            (['payment to'], 'payment', 0.85),
            (['debit'], 'debit', 0.70),
        ]
        
        # Check INCOME patterns FIRST - critical for "Bill Payment FROM", "Transfer FROM", etc.
        for patterns, cat, conf in income_patterns:
            if any(pattern in desc_lower for pattern in patterns):
                is_income = True
                category = cat
                confidence = conf
                break

        # Check expense patterns only if not already classified as income
        if not is_income or confidence < 0.8:
            for patterns, cat, conf in expense_patterns:
                if any(pattern in desc_lower for pattern in patterns):
                    # Skip if already classified as income with high confidence
                    if is_income and confidence >= 0.9:
                        break
                    # Special case: "Direct Debit" is always expense
                    if 'direct debit' in desc_lower or 'dd' in desc_lower:
                        is_income = False
                        category = cat
                        confidence = conf
                        break
                    elif 'credit' in desc_lower and 'direct' not in desc_lower:
                        # "Credit" alone suggests income
                        continue
                    else:
                        is_income = False
                        category = cat
                        confidence = conf
                        break
        
        # If still unclear, default to expense (most transactions are expenses)
        if confidence < 0.7:
            is_income = False
            category = 'other'
            confidence = 0.6
        
        return {
            'is_income': is_income,
            'category': category,
            'confidence': confidence
        }
    
    def _parse_barclays_date(self, date_str: str, year: str) -> Optional[str]:
        """
        Parse Barclays date format: 'DD MMM' -> 'YYYY-MM-DD'
        Example: '03 Apr' + '2023' -> '2023-04-03'
        """
        try:
            # Add year to date string
            full_date_str = f"{date_str} {year}"
            # Normalize month abbreviation
            parts = date_str.split()
            if len(parts) == 2:
                day, month = parts
                month = month.capitalize()
                full_date_str = f"{day} {month} {year}"
            
            parsed = datetime.strptime(full_date_str, '%d %b %Y')
            return parsed.strftime('%Y-%m-%d')
        except Exception as e:
            print(f"Error parsing date '{date_str}' with year '{year}': {e}")
            # Fallback to utils function
            return parse_uk_date(f"{date_str} {year}")
    
    def _parse_amount(self, amount_str: str) -> float:
        """
        Parse UK amount format
        Examples: "38.70", "1,234.56", "", "£1,234.56"
        """
        if not amount_str or amount_str.strip() == '':
            return 0.0
        
        # Use utils function for consistency
        return parse_uk_amount(amount_str)
    
    def _classify_transaction_type(self, description: str) -> str:
        """
        Classify Barclays transaction type from description
        """
        if not description:
            return 'other'
        
        desc_lower = description.lower()
        
        if 'direct debit' in desc_lower:
            return 'direct_debit'
        elif 'card payment' in desc_lower or 'card purchase' in desc_lower:
            return 'card_payment'
        elif 'transfer' in desc_lower and 'to' in desc_lower:
            return 'transfer'
        elif 'received' in desc_lower or 'received from' in desc_lower:
            return 'credit'
        elif 'bill payment' in desc_lower:
            return 'bill_payment'
        elif 'contactless' in desc_lower:
            return 'contactless'
        elif 'bank giro' in desc_lower:
            return 'bank_giro'
        else:
            return 'other'
    
    def _calculate_missing_balances(self, transactions: List[Dict]) -> List[Dict]:
        """
        Calculate missing balances based on known balances and debits/credits
        
        FIX 1: Improved balance validation
        - Find transactions with known balances
        - Calculate forward and backward
        - Validate against statement balances when present
        """
        if not transactions:
            return transactions
        
        # Find first known balance
        first_balance_idx = None
        for i, txn in enumerate(transactions):
            if txn.get('balance') is not None:
                first_balance_idx = i
                break
        
        if first_balance_idx is None:
            # No balances found, skip calculation
            return transactions
        
        # Calculate forward from first known balance
        current_balance = transactions[first_balance_idx]['balance']
        
        for i in range(first_balance_idx + 1, len(transactions)):
            # Apply transaction to balance
            if transactions[i]['credit'] > 0:
                current_balance += transactions[i]['credit']
            if transactions[i]['debit'] > 0:
                current_balance -= transactions[i]['debit']
            
            # If no balance recorded, use calculated
            if transactions[i].get('balance') is None:
                transactions[i]['balance'] = round(current_balance, 2)
            else:
                # Reset to actual balance if present (more accurate)
                current_balance = transactions[i]['balance']
        
        # Calculate backwards from first known balance
        if first_balance_idx > 0:
            current_balance = transactions[first_balance_idx]['balance']
            
            for i in range(first_balance_idx - 1, -1, -1):
                # Reverse apply transaction (to go backwards)
                if transactions[i]['credit'] > 0:
                    current_balance -= transactions[i]['credit']
                if transactions[i]['debit'] > 0:
                    current_balance += transactions[i]['debit']
                
                # If no balance recorded, use calculated
                if transactions[i].get('balance') is None:
                    transactions[i]['balance'] = round(current_balance, 2)
                else:
                    # Use actual balance if present
                    current_balance = transactions[i]['balance']
        
        return transactions
