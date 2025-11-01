"""
Common utilities for bank statement parsing
"""
import re
from datetime import datetime
from typing import List, Dict, Optional


def parse_uk_date(date_str: str) -> Optional[str]:
    """
    Parse UK date formats: DD/MM/YYYY, DD/MM/YY, DD-MM-YYYY, DD MMM YYYY
    
    Args:
        date_str: Date string in various UK formats
        
    Returns:
        ISO format YYYY-MM-DD or None if parsing fails
    """
    if not date_str or not isinstance(date_str, str):
        return None
    
    date_str = date_str.strip()
    
    # Pattern 1: DD/MM/YYYY or DD-MM-YYYY
    match = re.match(r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})', date_str)
    if match:
        try:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            if 1 <= day <= 31 and 1 <= month <= 12:
                return datetime(year, month, day).strftime('%Y-%m-%d')
        except (ValueError, IndexError):
            pass
    
    # Pattern 2: DD/MM/YY (2-digit year)
    match = re.match(r'(\d{1,2})[/-](\d{1,2})[/-](\d{2})', date_str)
    if match:
        try:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            # Assume years 00-30 are 2000-2030, 31-99 are 1931-1999
            full_year = 2000 + year if year <= 30 else 1900 + year
            if 1 <= day <= 31 and 1 <= month <= 12:
                return datetime(full_year, month, day).strftime('%Y-%m-%d')
        except (ValueError, IndexError):
            pass
    
    # Pattern 3: DD MMM YYYY (e.g., "03 Apr 2023")
    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }
    
    match = re.match(r'(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})', date_str)
    if match:
        try:
            day = int(match.group(1))
            month_name = match.group(2).lower()[:3]
            year = int(match.group(3))
            
            if month_name in month_map:
                month = month_map[month_name]
                if 1 <= day <= 31:
                    return datetime(year, month, day).strftime('%Y-%m-%d')
        except (ValueError, IndexError):
            pass
    
    # Pattern 4: DD MMM (without year - will use statement year if available)
    match = re.match(r'(\d{1,2})\s+([A-Za-z]{3})', date_str)
    if match:
        try:
            day = int(match.group(1))
            month_name = match.group(2).lower()[:3]
            
            if month_name in month_map:
                # Return format that indicates year needs to be added
                return f"{day:02d} {month_name.capitalize()}"
        except (ValueError, IndexError):
            pass
    
    return None


def parse_uk_amount(amount_str: str) -> float:
    """
    Parse UK amounts: £1,234.56, 1234.56, (1234.56), -1234.56
    
    Args:
        amount_str: Amount string in various formats
        
    Returns:
        Float value (negative for debits in brackets)
    """
    if not amount_str:
        return 0.0
    
    # Convert to string and clean
    clean = str(amount_str).strip()
    
    # Handle brackets as negative: (1234.56) = -1234.56
    is_negative = False
    if clean.startswith('(') and clean.endswith(')'):
        clean = clean[1:-1]
        is_negative = True
    
    # Remove £, commas, spaces
    clean = clean.replace('£', '').replace(',', '').replace(' ', '').strip()
    
    # Check for explicit negative
    if clean.startswith('-'):
        is_negative = True
        clean = clean[1:]
    
    try:
        amount = float(clean)
        return -amount if is_negative else amount
    except (ValueError, TypeError):
        return 0.0


def calculate_accuracy_score(transactions: List[Dict], validation_errors: List[str]) -> float:
    """
    Calculate accuracy score based on validation errors
    
    Args:
        transactions: List of transaction dictionaries
        validation_errors: List of validation error messages
        
    Returns:
        Accuracy score 0-100
    """
    if not transactions:
        return 0.0
    
    error_count = len(validation_errors)
    total_transactions = len(transactions)
    
    if total_transactions == 0:
        return 0.0
    
    accuracy = ((total_transactions - error_count) / total_transactions) * 100
    return round(max(0.0, min(100.0, accuracy)), 2)


def clean_description(description: str, max_length: int = 50) -> str:
    """
    Clean transaction description by removing common noise and truncating
    
    Args:
        description: Raw description string
        max_length: Maximum length for description (default 50 chars for table display)
        
    Returns:
        Cleaned and truncated description
    """
    if not description:
        return ''
    
    cleaned = description
    
    # Remove common prefixes that add no value
    cleaned = re.sub(r'^(card payment to|direct debit to|payment to|card purchase)\s*', '', cleaned, flags=re.IGNORECASE)
    
    # Remove reference numbers
    cleaned = re.sub(r'Ref:\s*\w+', '', cleaned, flags=re.IGNORECASE)
    
    # Remove card numbers
    cleaned = re.sub(r'Card:\s*\d+', '', cleaned, flags=re.IGNORECASE)
    
    # Remove "On DD MMM" patterns (date continuation markers)
    cleaned = re.sub(r'\s*On\s+\d{1,2}\s+[A-Za-z]{3}(\s+\d{4})?', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+On\s+\d{1,2}(\s+[A-Za-z]{3})?$', '', cleaned, flags=re.IGNORECASE)  # Remove trailing "On DD" or "On DD MMM"
    cleaned = re.sub(r'\s+On\s+\d{1,2}\s*$', '', cleaned, flags=re.IGNORECASE)  # Remove "On 01" at end
    
    # Remove exchange rate details (common in foreign transactions)
    cleaned = re.sub(r'\s*EUR\s+\d+\.\d+\s+at\s+VISA\s+Exchange\s+Rate[^.]*\.', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*The\s+Final\s+GBP\s+Amount\s+Includes.*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*Non-Sterling\s+Transaction\s+Fee.*', '', cleaned, flags=re.IGNORECASE)
    
    # Remove Barclays footer/legal text
    cleaned = re.sub(r'\s*Barclays Bank UK PLC.*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*Authorised by.*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*Continued.*', '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*Registered.*', '', cleaned, flags=re.IGNORECASE)
    
    # Remove country codes and locations that are redundant
    cleaned = re.sub(r'\s*Spain\s+', ' ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s*\(Hotel\s+\d+.*?\)', '', cleaned, flags=re.IGNORECASE)
    
    # Normalize spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    # Truncate intelligently at word boundary
    if len(cleaned) > max_length:
        truncated = cleaned[:max_length]
        # Try to break at last space before max_length
        last_space = truncated.rfind(' ')
        if last_space > max_length * 0.6:  # If we can break reasonably early
            cleaned = truncated[:last_space] + '...'
        else:
            cleaned = truncated + '...'
    
    return cleaned

