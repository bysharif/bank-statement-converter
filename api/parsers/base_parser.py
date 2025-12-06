"""
Base parser class for all UK bank statement parsers.
Provides common functionality, logging, and error handling.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import pdfplumber
import re
import os

# Import new modules
from .logger import get_parser_logger, ParsingContext, log_critical_error
from .exceptions import (
    ParserException,
    PDFExtractionError,
    NoTransactionsFoundError,
    HeaderNotFoundError,
    DateParseError,
    AmountParseError,
    BalanceValidationError,
    ParserResult,
)
from .config import get_config, BankConfig


class BaseBankParser(ABC):
    """Base class for all UK bank parsers"""
    
    def __init__(self):
        # Get parser name from class name (e.g., "BarclaysParser" -> "barclays")
        class_name = self.__class__.__name__
        self.parser_name = class_name.replace('Parser', '').lower()
        self.bank_name = class_name.replace('Parser', '').title()
        
        # Initialize logger
        self.logger = get_parser_logger(self.parser_name)
        
        # Get bank configuration
        self.config = get_config(self.parser_name)
    
    @abstractmethod
    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """
        Extract transactions from PDF
        
        Args:
            pdf_path: Path to PDF file or file-like object
            
        Returns:
            List of dicts with keys: date, description, debit, credit, balance, type
            Format:
            {
                'date': 'YYYY-MM-DD',
                'description': str,
                'debit': float (or 0.0),
                'credit': float (or 0.0),
                'balance': float (or None),
                'type': 'income' or 'expense'
            }
        """
        pass
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from all pages of a PDF.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Combined text from all pages
            
        Raises:
            PDFExtractionError: If text extraction fails
        """
        try:
            all_text = ''
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        all_text += page_text + '\n'
            
            if not all_text.strip():
                raise PDFExtractionError("PDF contains no extractable text")
            
            return all_text
            
        except pdfplumber.pdfminer.pdfparser.PDFSyntaxError as e:
            raise PDFExtractionError(f"Invalid PDF format: {str(e)}")
        except Exception as e:
            if "password" in str(e).lower():
                from .exceptions import PasswordProtectedPDFError
                raise PasswordProtectedPDFError()
            raise PDFExtractionError(f"Failed to extract text: {str(e)}")
    
    def find_header_line(self, lines: List[str], keywords: List[str] = None) -> Tuple[int, str]:
        """
        Find the header line in the extracted text.
        
        Args:
            lines: List of text lines
            keywords: Keywords to look for (uses config if not provided)
            
        Returns:
            Tuple of (line_index, header_text)
            
        Raises:
            HeaderNotFoundError: If header cannot be found
        """
        if keywords is None and self.config:
            keywords = self.config.header_keywords
        
        if not keywords:
            keywords = ["Date", "Description", "Amount", "Balance"]
        
        for i, line in enumerate(lines):
            # Check if line contains multiple header keywords
            matches = sum(1 for kw in keywords if kw.lower() in line.lower())
            if matches >= 2:  # At least 2 keywords must match
                self.logger.debug(f"Found header at line {i}: {line[:70]}")
                return i, line
        
        raise HeaderNotFoundError(
            self.bank_name,
            expected_columns=keywords
        )
    
    def parse_date(self, date_str: str, formats: List[str] = None, year: str = None) -> Optional[str]:
        """
        Parse a date string into ISO format (YYYY-MM-DD).
        
        Args:
            date_str: Date string to parse
            formats: List of formats to try (uses config if not provided)
            year: Year to append if not in date string
            
        Returns:
            ISO formatted date string or None if parsing fails
        """
        if not date_str:
            return None
        
        date_str = date_str.strip()
        
        if formats is None and self.config:
            formats = self.config.date_formats
        
        if not formats:
            formats = ['%d/%m/%Y', '%d-%m-%Y', '%d %b %Y', '%d %B %Y']
        
        # If year is provided and not in date string, append it
        if year and not re.search(r'\d{4}', date_str):
            date_str = f"{date_str} {year}"
        
        for fmt in formats:
            try:
                # Handle format with year
                if '%Y' in fmt or '%y' in fmt:
                    date_obj = datetime.strptime(date_str, fmt)
                    return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        # Log but don't raise - let caller handle
        self.logger.debug(f"Could not parse date: '{date_str}'")
        return None
    
    def parse_amount(self, amount_str: str) -> float:
        """
        Parse an amount string into a float.
        
        Args:
            amount_str: Amount string (e.g., "£1,234.56", "1234.56", "(50.00)")
            
        Returns:
            Float value (0.0 if parsing fails)
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
    
    def validate_running_balance(self, transactions: List[Dict]) -> List[str]:
        """
        Validate that running balance is correct
        
        Args:
            transactions: List of transaction dictionaries
            
        Returns:
            List of validation error messages
        """
        errors = []
        
        if not transactions or len(transactions) < 2:
            return errors
        
        # Start with first transaction's balance (or calculate from scratch)
        first_balance = transactions[0].get('balance')
        
        # If no balance in first transaction, try to calculate from scratch
        if first_balance is None:
            # Skip validation if we don't have starting balance
            return errors
        
        calculated_balance = float(first_balance)
        
        for i, txn in enumerate(transactions[1:], 1):
            # Calculate expected balance
            credit = float(txn.get('credit', 0) or 0)
            debit = float(txn.get('debit', 0) or 0)
            
            # Add credits, subtract debits
            calculated_balance = calculated_balance + credit - debit
            
            # Get actual balance from statement
            actual_balance = txn.get('balance')
            
            if actual_balance is not None:
                actual_balance = float(actual_balance)
                
                # Check if it matches statement balance (within 1p tolerance)
                diff = abs(calculated_balance - actual_balance)
                if diff > 0.01:
                    errors.append(
                        f"Transaction {i+1} ({txn.get('date', 'unknown date')}): "
                        f"Balance mismatch. Expected £{calculated_balance:.2f}, "
                        f"got £{actual_balance:.2f} (diff: £{diff:.2f})"
                    )
        
        return errors
    
    def validate_transaction_count(self, transactions: List[Dict], expected_count: Optional[int] = None) -> List[str]:
        """
        Validate transaction count
        
        Args:
            transactions: List of transactions
            expected_count: Expected number of transactions (if known)
            
        Returns:
            List of validation warnings
        """
        warnings = []
        
        if not transactions:
            warnings.append("No transactions extracted")
            return warnings
        
        if expected_count and len(transactions) != expected_count:
            warnings.append(
                f"Transaction count mismatch: extracted {len(transactions)}, "
                f"expected {expected_count}"
            )
        
        return warnings
    
    def normalize_transaction(self, txn: Dict) -> Dict:
        """
        Normalize transaction format

        Args:
            txn: Transaction dictionary

        Returns:
            Normalized transaction with all required fields
        """
        # Safely convert to float, handling None and NaN
        def safe_float(val):
            if val is None:
                return 0.0
            try:
                f = float(val)
                # Check for NaN
                if f != f:  # NaN check
                    return 0.0
                return f
            except (ValueError, TypeError):
                return 0.0

        # Ensure all fields exist
        normalized = {
            'date': txn.get('date', ''),
            'description': str(txn.get('description', '')).strip(),
            'debit': safe_float(txn.get('debit', 0)),
            'credit': safe_float(txn.get('credit', 0)),
            'balance': txn.get('balance'),
            'type': txn.get('type', 'expense')
        }

        # Calculate amount and type if not set
        if normalized['credit'] > 0:
            normalized['amount'] = normalized['credit']
            normalized['type'] = 'income'
        elif normalized['debit'] > 0:
            normalized['amount'] = normalized['debit']
            normalized['type'] = 'expense'
        else:
            normalized['amount'] = 0.0

        # Handle balance - convert None to None (not NaN)
        if normalized['balance'] is not None:
            try:
                bal = float(normalized['balance'])
                if bal != bal:  # NaN check
                    normalized['balance'] = None
                else:
                    normalized['balance'] = bal
            except (ValueError, TypeError):
                normalized['balance'] = None

        return normalized
    
    def should_skip_line(self, line: str) -> bool:
        """
        Check if a line should be skipped during parsing.
        
        Args:
            line: Line of text to check
            
        Returns:
            True if line should be skipped
        """
        if not line or not line.strip():
            return True
        
        if self.config:
            line_lower = line.lower()
            return any(pattern in line_lower for pattern in self.config.skip_patterns)
        
        return False
    
    def classify_transaction_type(self, description: str) -> str:
        """
        Classify transaction type from description.
        
        Args:
            description: Transaction description
            
        Returns:
            Transaction type string (e.g., 'card_payment', 'direct_debit')
        """
        if not description:
            return 'other'
        
        desc_lower = description.lower()
        
        # Common classifications
        if 'direct debit' in desc_lower:
            return 'direct_debit'
        elif 'card payment' in desc_lower or 'card purchase' in desc_lower:
            return 'card_payment'
        elif 'standing order' in desc_lower:
            return 'standing_order'
        elif 'transfer' in desc_lower and 'to' in desc_lower:
            return 'transfer'
        elif 'received' in desc_lower or 'from' in desc_lower:
            return 'credit'
        elif 'bill payment' in desc_lower:
            return 'bill_payment'
        elif 'contactless' in desc_lower:
            return 'contactless'
        elif 'bank giro' in desc_lower:
            return 'bank_giro'
        elif 'atm' in desc_lower or 'cash' in desc_lower:
            return 'atm'
        else:
            return 'other'
    
    def is_credit_transaction(self, description: str) -> bool:
        """
        Check if transaction is a credit (income).
        
        Args:
            description: Transaction description
            
        Returns:
            True if transaction appears to be income/credit
        """
        if not description:
            return False
        
        desc_lower = description.lower()
        
        credit_indicators = [
            'received from', 'payment from', 'transfer from',
            'salary', 'wage', 'deposit', 'refund', 'credit'
        ]
        
        return any(indicator in desc_lower for indicator in credit_indicators)
    
    def clean_description(self, description: str, max_length: int = 50) -> str:
        """
        Clean and truncate a transaction description.
        
        Args:
            description: Raw description
            max_length: Maximum length
            
        Returns:
            Cleaned description
        """
        if not description:
            return ''
        
        cleaned = description
        
        # Normalize spaces
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        # Truncate intelligently at word boundary
        if len(cleaned) > max_length:
            truncated = cleaned[:max_length]
            last_space = truncated.rfind(' ')
            if last_space > max_length * 0.6:
                cleaned = truncated[:last_space] + '...'
            else:
                cleaned = truncated + '...'
        
        return cleaned
    
    def create_parsing_context(self, total_lines: int = 0) -> ParsingContext:
        """
        Create a parsing context for structured logging.
        
        Args:
            total_lines: Total number of lines to process
            
        Returns:
            ParsingContext instance
        """
        return ParsingContext(self.logger, self.parser_name, total_lines)
