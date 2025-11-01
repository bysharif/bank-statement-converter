"""
Wise (formerly TransferWise) Bank Statement Parser
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


class WiseParser(BaseBankParser):
    """Parser for Wise (formerly TransferWise) statements"""
    
    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """
        Extract transactions from Wise statement
        
        Wise Format:
        - Text-based format (not tables)
        - Each transaction has:
          1. Description line: "Description text -amount balance" or "Description text amount balance"
          2. Date line: "DD MMMM YYYY Transaction: TYPE-ID [Additional info]"
        
        Challenges:
        - Amount and balance are on the description line (not separate columns)
        - Negative amounts indicate outgoing (debit), positive indicate incoming (credit)
        - Date format is "DD MMMM YYYY" (full month name)
        - Descriptions can be multi-line or include references
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
            transactions = self._parse_wise_text(all_text)
            
        except Exception as e:
            print(f"Error parsing Wise PDF: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return transactions
    
    def _parse_wise_text(self, text: str) -> List[Dict]:
        """Parse transactions from Wise statement text"""
        transactions = []
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Find the header row
        header_found = False
        i = 0
        
        while i < len(lines):
            line = lines[i]
            if 'Description' in line and 'Incoming' in line and 'Outgoing' in line:
                header_found = True
                i += 1
                break
            i += 1
        
        if not header_found:
            return transactions
        
        # Parse transactions
        while i < len(lines):
            line = lines[i]
            
            # Pattern: Description text followed by amount and balance
            amount_balance_pattern = r'(.+?)\s+(-?[\d,]+\.?\d{0,2})\s+([\d,]+\.?\d{2})$'
            match = re.match(amount_balance_pattern, line)
            
            if not match:
                i += 1
                continue
            
            description = match.group(1).strip()
            amount_str = match.group(2).strip().replace(',', '')
            balance_str = match.group(3).strip().replace(',', '')
            
            # Skip header/summary lines
            if any(keyword in description.lower() for keyword in ['description', 'total', 'summary', 'balance on', 'generated on']):
                i += 1
                continue
            
            # Skip page numbers
            if re.match(r'^(ref:|^\d+\s*/\s*\d+)', description, re.IGNORECASE):
                i += 1
                continue
            
            # Look ahead for date line
            date_str = None
            j = i + 1
            
            while j < min(i + 4, len(lines)):
                next_line = lines[j]
                date_match = re.match(r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})', next_line)
                
                if date_match:
                    month_map = {
                        'january': 1, 'february': 2, 'march': 3, 'april': 4,
                        'may': 5, 'june': 6, 'july': 7, 'august': 8,
                        'september': 9, 'october': 10, 'november': 11, 'december': 12,
                        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4,
                        'may': 5, 'jun': 6, 'jul': 7, 'aug': 8,
                        'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
                    }
                    
                    try:
                        day = int(date_match.group(1))
                        month_name = date_match.group(2).lower()
                        year = int(date_match.group(3))
                        
                        month = None
                        for month_key, month_num in month_map.items():
                            if month_name.startswith(month_key):
                                month = month_num
                                break
                        
                        if month and 1 <= day <= 31:
                            from datetime import datetime
                            date_str = datetime(year, month, day).strftime('%Y-%m-%d')
                            
                            # Extract reference if present
                            if 'Reference:' in next_line:
                                ref_match = re.search(r'Reference:\s*(.+)', next_line)
                                if ref_match:
                                    ref_text = ref_match.group(1).strip()
                                    if ref_text and ref_text not in description:
                                        description += f' ({ref_text})'
                            
                            break
                    except (ValueError, KeyError):
                        pass
                
                j += 1
            
            # Process transaction if date found
            if date_str:
                try:
                    amount = float(amount_str)
                    debit = abs(amount) if amount < 0 else 0.0
                    credit = amount if amount > 0 else 0.0
                    
                    try:
                        balance = float(balance_str)
                    except ValueError:
                        balance = None
                    
                    cleaned_description = clean_description(description, max_length=80)
                    
                    transactions.append({
                        'date': date_str,
                        'description': cleaned_description,
                        'debit': debit,
                        'credit': credit,
                        'balance': balance,
                        'type': 'income' if credit > 0 else 'expense'
                    })
                    
                    i = j
                except ValueError:
                    i += 1
            else:
                i += 1
        
        # Reverse transactions to chronological order (oldest first)
        # Wise statements show newest transactions first
        transactions.reverse()
        
        return transactions

