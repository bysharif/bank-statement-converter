"""
Monzo Bank Statement Parser
"""
import pdfplumber
import re
from typing import List, Dict, Optional
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


class MonzoParser(BaseBankParser):
    """Parser for Monzo Bank UK statements"""
    
    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """
        Extract transactions from Monzo statement
        
        Monzo Format:
        - Text-based format (not tables)
        - Each transaction can be:
          1. Description on previous line(s), then date + amount + balance
          2. Date + description + amount + balance all on one line
        - Date format: DD/MM/YYYY
        - Amount can be negative (outgoing) or positive (incoming)
        """
        transactions = []
        
        try:
            # Extract text from all pages
            all_text = ''
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + '\n'
            
            # Parse transactions from text
            transactions = self._parse_monzo_text(all_text)
            
        except Exception as e:
            print(f"Error parsing Monzo PDF: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return transactions
    
    def _parse_monzo_text(self, text: str) -> List[Dict]:
        """Parse transactions from Monzo statement text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Find the header row
        header_found = False
        i = 0
        
        while i < len(lines):
            line = lines[i]
            if 'Date' in line and 'Description' in line and 'Amount' in line:
                header_found = True
                i += 1
                break
            i += 1
        
        if not header_found:
            return transactions
        
        # Parse transactions
        while i < len(lines):
            line = lines[i]
            
            # Check if line starts with date (DD/MM/YYYY format)
            date_match = re.match(r'(\d{1,2}/\d{1,2}/\d{4})', line)
            
            if not date_match:
                i += 1
                continue
            
            date_str = date_match.group(1)
            
            # Try to find amount and balance on this line
            # Pattern: date ... description ... amount balance (at end)
            amount_balance_pattern = r'(-?[\d,]+\.?\d{2})\s+([\d,]+\.?\d{2})$'
            amount_balance_match = re.search(amount_balance_pattern, line)
            
            if not amount_balance_match:
                # No amount/balance on this line, skip
                i += 1
                continue
            
            amount_str = amount_balance_match.group(1).strip().replace(',', '')
            balance_str = amount_balance_match.group(2).strip().replace(',', '')
            
            # Extract description from date line (between date and amount)
            desc_on_date_line = line[len(date_str):amount_balance_match.start()].strip()
            
            # Monzo format analysis:
            # - Merchant/vendor name appears on the line immediately before the date line
            # - Generic terms like "Withdrawal", "Card payment" appear on the date line itself
            # - Sometimes there are reference numbers or locations on additional lines
            
            # Look back for merchant name - be more aggressive in capturing it
            merchant_name = None
            reference_info = []
            
            # Check up to 2 lines back for merchant name
            for j in range(1, min(3, i + 1)):
                prev_line = lines[i - j].strip()
                
                # Stop if we hit a date line (new transaction)
                if re.match(r'^\d{1,2}/\d{1,2}/\d{4}', prev_line):
                    break
                
                # Skip if this line is just amount/balance
                if re.match(r'^-?[\d,]+\.?\d{2}\s+[\d,]+\.?\d{2}$', prev_line):
                    continue
                
                # Skip header-like text (but allow through if we're on first line back)
                header_keywords = ['date', 'description', 'amount', 'balance']
                if j > 1 and any(keyword in prev_line.lower() for keyword in header_keywords):
                    break
                
                # Skip if line is too short (likely not meaningful)
                if len(prev_line) < 2:
                    continue
                
                # First line back is usually the merchant name
                if j == 1:
                    # Don't skip if it looks like a merchant name (has letters, reasonable length)
                    # Only skip if it's clearly a header or generic term
                    is_header = any(keyword in prev_line.lower() for keyword in ['statement', 'account', 'iban', 'bic', 'sort code', 'account number'])
                    is_generic = prev_line.lower() in ['withdrawal', 'card payment', 'faster payment', 'direct debit', 'standing order']
                    
                    if not is_header and not is_generic and len(prev_line) >= 3:
                        merchant_name = prev_line
                else:
                    # Additional lines might be reference numbers, locations, etc.
                    # These can add context but aren't the primary merchant name
                    if len(prev_line) > 5 and not re.match(r'^[A-Z]{2,3}$', prev_line):  # Skip country codes alone
                        reference_info.insert(0, prev_line)
            
            # Build description: prioritize merchant name, then reference info, then date line text
            description_parts = []
            
            # Add merchant name if found
            if merchant_name:
                description_parts.append(merchant_name)
            
            # Add reference info if available
            if reference_info:
                description_parts.extend(reference_info)
            
            # Add text from date line (but skip generic terms if we have merchant name)
            if desc_on_date_line:
                generic_terms = ['withdrawal', 'card payment', 'faster payment', 'direct debit']
                is_generic = desc_on_date_line.lower().strip() in generic_terms
                
                if merchant_name:
                    # If we have merchant name, only add date line if it's not generic or adds info
                    if not is_generic or len(desc_on_date_line) > 20:
                        description_parts.append(desc_on_date_line)
                else:
                    # No merchant name found, use date line text even if generic
                    description_parts.append(desc_on_date_line)
            
            description = ' '.join(description_parts).strip()
            
            # Skip if description is empty or looks like a header
            # Skip header-like lines and invalid descriptions  
            invalid_keywords = ['date description', 'total balance', 'business account', 'account statement', 
                              'iban:', 'bic:', 'sort code', 'account number', 'total deposits', 
                              'total outgoings', 'balance in pots', 'pot name', 'depo']
            if not description or any(keyword in description.lower() for keyword in invalid_keywords):
                i += 1
                continue
            
            # Parse date
            # Monzo uses DD/MM/YYYY format
            date_parts = date_str.split('/')
            if len(date_parts) == 3:
                try:
                    day = int(date_parts[0])
                    month = int(date_parts[1])
                    year = int(date_parts[2])
                    
                    from datetime import datetime
                    parsed_date = datetime(year, month, day).strftime('%Y-%m-%d')
                except (ValueError, IndexError):
                    i += 1
                    continue
            else:
                i += 1
                continue
            
            # Parse amount
            try:
                amount = float(amount_str)
                debit = abs(amount) if amount < 0 else 0.0
                credit = amount if amount > 0 else 0.0
            except ValueError:
                i += 1
                continue
            
            # Parse balance
            try:
                balance = float(balance_str)
            except ValueError:
                balance = None
            
            # Clean description
            cleaned_description = clean_description(description, max_length=80)
            
            transactions.append({
                'date': parsed_date,
                'description': cleaned_description,
                'debit': debit,
                'credit': credit,
                'balance': balance,
                'type': 'income' if credit > 0 else 'expense'
            })
            
            i += 1
        
        # Reverse transactions to chronological order (oldest first)
        # Monzo statements show newest transactions first
        transactions.reverse()
        
        return transactions

