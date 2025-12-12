"""
Enhanced Base Parser for UK Bank Statement Parsing
Provides universal utilities for accurate extraction across all banks.

This is the foundation that all bank-specific parsers should inherit from.
Implements the hybrid extraction strategy (table → text → validation).
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from dataclasses import dataclass
import pdfplumber
import re
import os

from .logger import get_parser_logger, ParsingContext
from .exceptions import (
    ParserException,
    PDFExtractionError,
    NoTransactionsFoundError,
    HeaderNotFoundError,
    ParserResult,
)
from .config import get_config, BankConfig


@dataclass
class ExtractionResult:
    """Structured result from extraction operations"""
    transactions: List[Dict]
    confidence: float  # 0.0 to 1.0
    method: str  # 'table', 'text', 'hybrid'
    warnings: List[str]


class EnhancedBaseBankParser(ABC):
    """
    Enhanced base class for all UK bank parsers.
    
    Key Features:
    1. Hybrid extraction (table + text)
    2. Safe amount extraction with noise removal
    3. Universal date parsing for all UK formats
    4. Block-based text grouping
    5. Balance calculation and validation
    6. Deduplication
    
    Usage:
        class MyBankParser(EnhancedBaseBankParser):
            def _get_date_pattern(self) -> str:
                return r'^\\d{2}/\\d{2}/\\d{4}'  # Bank-specific date regex
            
            def _extract_from_tables(self, pdf, metadata) -> List[Dict]:
                # Bank-specific table extraction
                pass
                
            def _extract_from_text(self, pdf, metadata) -> List[Dict]:
                # Bank-specific text extraction
                pass
    """
    
    # =========================================================================
    # CONFIGURATION
    # =========================================================================
    
    # UK Date formats to try (in order of specificity)
    UK_DATE_FORMATS = [
        '%d/%m/%Y',       # 18/09/2023
        '%d/%m/%y',       # 18/09/23
        '%d-%m-%Y',       # 18-09-2023
        '%d-%m-%y',       # 18-09-23
        '%d %B %Y',       # 18 September 2023
        '%d %b %Y',       # 18 Sep 2023
        '%d %b %y',       # 18 Sep 23
        '%d %b',          # 18 Sep (needs year inference)
    ]
    
    # Month mappings for manual parsing
    MONTH_MAP = {
        'jan': 1, 'january': 1,
        'feb': 2, 'february': 2,
        'mar': 3, 'march': 3,
        'apr': 4, 'april': 4,
        'may': 5,
        'jun': 6, 'june': 6,
        'jul': 7, 'july': 7,
        'aug': 8, 'august': 8,
        'sep': 9, 'sept': 9, 'september': 9,
        'oct': 10, 'october': 10,
        'nov': 11, 'november': 11,
        'dec': 12, 'december': 12,
    }
    
    # Realistic amount limits
    MIN_AMOUNT = 0.01
    MAX_AMOUNT = 99999.99
    
    # Table extraction settings (optimized for bank statements)
    TABLE_SETTINGS = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "join_tolerance": 3,
        "edge_min_length": 3,
    }
    
    # Alternative table settings for text-based tables
    TABLE_SETTINGS_TEXT = {
        "vertical_strategy": "text",
        "horizontal_strategy": "text",
        "snap_tolerance": 5,
    }
    
    def __init__(self):
        class_name = self.__class__.__name__
        self.parser_name = class_name.replace('Parser', '').lower()
        self.bank_name = class_name.replace('Parser', '').title()
        self.logger = get_parser_logger(self.parser_name)
        self.config = get_config(self.parser_name)
    
    # =========================================================================
    # MAIN EXTRACTION METHOD (HYBRID STRATEGY)
    # =========================================================================
    
    def extract_transactions(self, pdf_path: str) -> List[Dict]:
        """
        Main extraction method using hybrid strategy.
        
        Strategy:
        1. Extract metadata (year, account info) from first page
        2. Try table extraction (most accurate for structured PDFs)
        3. Try text extraction (handles edge cases)
        4. Use whichever yields better results
        5. Post-process (fill balances, dedupe, validate)
        
        Args:
            pdf_path: Path to PDF file or file-like object
            
        Returns:
            List of normalized transaction dictionaries
        """
        transactions = []
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                # Step 1: Extract metadata
                metadata = self._extract_metadata(pdf)
                self.logger.info(f"Extracted metadata: year={metadata.get('year')}")
                
                # Step 2: Try table extraction
                table_result = self._try_table_extraction(pdf, metadata)
                
                # Step 3: Try text extraction
                text_result = self._try_text_extraction(pdf, metadata)
                
                # Step 4: Choose best result
                if table_result.confidence > text_result.confidence:
                    transactions = table_result.transactions
                    self.logger.info(f"Using table extraction ({table_result.confidence:.0%} confidence, {len(transactions)} txns)")
                else:
                    transactions = text_result.transactions
                    self.logger.info(f"Using text extraction ({text_result.confidence:.0%} confidence, {len(transactions)} txns)")
            
            # Step 5: Post-process
            transactions = self._post_process(transactions, metadata)
            
            self.logger.info(f"Final: {len(transactions)} transactions extracted")
            
        except Exception as e:
            self.logger.error(f"Extraction failed: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return transactions
    
    def _try_table_extraction(self, pdf: pdfplumber.PDF, metadata: Dict) -> ExtractionResult:
        """Attempt table-based extraction"""
        try:
            transactions = self._extract_from_tables(pdf, metadata)
            confidence = self._calculate_confidence(transactions)
            return ExtractionResult(
                transactions=transactions,
                confidence=confidence,
                method='table',
                warnings=[]
            )
        except Exception as e:
            self.logger.debug(f"Table extraction failed: {e}")
            return ExtractionResult(
                transactions=[],
                confidence=0.0,
                method='table',
                warnings=[str(e)]
            )
    
    def _try_text_extraction(self, pdf: pdfplumber.PDF, metadata: Dict) -> ExtractionResult:
        """Attempt text-based extraction"""
        try:
            transactions = self._extract_from_text(pdf, metadata)
            confidence = self._calculate_confidence(transactions)
            return ExtractionResult(
                transactions=transactions,
                confidence=confidence,
                method='text',
                warnings=[]
            )
        except Exception as e:
            self.logger.debug(f"Text extraction failed: {e}")
            return ExtractionResult(
                transactions=[],
                confidence=0.0,
                method='text',
                warnings=[str(e)]
            )
    
    def _calculate_confidence(self, transactions: List[Dict]) -> float:
        """
        Calculate confidence score based on extraction quality.
        
        Factors:
        - Number of transactions
        - Completeness of fields
        - Balance reconciliation
        """
        if not transactions:
            return 0.0
        
        score = 0.0
        
        # Base score from transaction count
        score += min(len(transactions) / 10, 1.0) * 0.3  # 30% for having transactions
        
        # Completeness score
        complete_count = sum(
            1 for txn in transactions
            if txn.get('date') and txn.get('description') and 
            (txn.get('debit', 0) > 0 or txn.get('credit', 0) > 0)
        )
        score += (complete_count / len(transactions)) * 0.4  # 40% for completeness
        
        # Balance score
        has_balance = sum(1 for txn in transactions if txn.get('balance') is not None)
        score += (has_balance / len(transactions)) * 0.3  # 30% for balances
        
        return min(score, 1.0)
    
    # =========================================================================
    # ABSTRACT METHODS (Bank-Specific Implementation Required)
    # =========================================================================
    
    @abstractmethod
    def _extract_from_tables(self, pdf: pdfplumber.PDF, metadata: Dict) -> List[Dict]:
        """
        Extract transactions from PDF tables.
        
        Bank-specific implementation should:
        1. Iterate through pages
        2. Extract tables with appropriate settings
        3. Parse rows into transaction dictionaries
        
        Args:
            pdf: Open pdfplumber PDF object
            metadata: Extracted metadata (year, etc.)
            
        Returns:
            List of transaction dictionaries
        """
        pass
    
    @abstractmethod
    def _extract_from_text(self, pdf: pdfplumber.PDF, metadata: Dict) -> List[Dict]:
        """
        Extract transactions from PDF text.
        
        Bank-specific implementation should:
        1. Extract text from all pages
        2. Group lines into transaction blocks
        3. Parse blocks into transaction dictionaries
        
        Args:
            pdf: Open pdfplumber PDF object
            metadata: Extracted metadata (year, etc.)
            
        Returns:
            List of transaction dictionaries
        """
        pass
    
    def _get_date_pattern(self) -> str:
        """
        Get regex pattern for date detection (bank-specific).
        
        Override in subclass to provide bank's date format.
        
        Returns:
            Regex pattern string
        """
        # Default: matches common UK formats
        return r'\d{1,2}[/\-\s]\d{1,2}[/\-\s]?\d{2,4}|\d{1,2}\s+[A-Za-z]{3}\s*\d{2,4}?'
    
    # =========================================================================
    # METADATA EXTRACTION
    # =========================================================================
    
    def _extract_metadata(self, pdf: pdfplumber.PDF) -> Dict:
        """
        Extract metadata from statement (year, account info, etc.)
        
        Args:
            pdf: Open pdfplumber PDF object
            
        Returns:
            Dictionary with:
            - year: Statement year (str)
            - account_number: Account number if found (str)
            - statement_period: Statement period if found (str)
        """
        metadata = {
            'year': str(datetime.now().year),
            'account_number': None,
            'statement_period': None,
        }
        
        try:
            first_page_text = pdf.pages[0].extract_text() or ''
            
            # Extract year from various patterns
            year = self._extract_year_from_text(first_page_text)
            if year:
                metadata['year'] = year
            
            # Extract account number (8 digits)
            account_match = re.search(r'\b(\d{8})\b', first_page_text)
            if account_match:
                metadata['account_number'] = account_match.group(1)
            
            # Extract statement period
            period_patterns = [
                r'(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})\s*(?:to|-)\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})',
                r'Statement\s+(?:for\s+)?(?:period\s+)?(\d{1,2}/\d{1,2}/\d{4})\s*(?:to|-)\s*(\d{1,2}/\d{1,2}/\d{4})',
            ]
            for pattern in period_patterns:
                match = re.search(pattern, first_page_text, re.IGNORECASE)
                if match:
                    metadata['statement_period'] = f"{match.group(1)} to {match.group(2)}"
                    break
                    
        except Exception as e:
            self.logger.debug(f"Metadata extraction failed: {e}")
        
        return metadata
    
    def _extract_year_from_text(self, text: str) -> Optional[str]:
        """Extract year from statement text"""
        # Pattern 1: Statement period with year
        patterns = [
            r'\d{1,2}\s+-\s+\d{1,2}\s+\w{3}\s+(\d{4})',  # "01 - 28 Apr 2023"
            r'Statement\s+date[:\s]+\d{1,2}\s+\w{3}\s+(\d{4})',  # "Statement date: 28 Apr 2023"
            r'(\d{4})[-/]\d{2}[-/]\d{2}',  # "2023-04-28"
            r'\d{1,2}[-/]\d{1,2}[-/](\d{4})',  # "28/04/2023"
            r'\b(20\d{2})\b',  # Any year 2000-2099
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return None
    
    # =========================================================================
    # SAFE AMOUNT EXTRACTION
    # =========================================================================
    
    def extract_amounts_safely(
        self, 
        text: str, 
        max_amount: float = None,
        pre_clean: bool = True
    ) -> List[float]:
        """
        Extract amounts from text with noise removal.
        
        This is critical for avoiding false positives like account numbers.
        
        Args:
            text: Text to extract amounts from
            max_amount: Maximum valid amount (default: self.MAX_AMOUNT)
            pre_clean: Whether to pre-clean noise
            
        Returns:
            List of valid amounts
        """
        if max_amount is None:
            max_amount = self.MAX_AMOUNT
        
        if not text:
            return []
        
        cleaned = text
        
        if pre_clean:
            # Remove account numbers (10+ digits)
            cleaned = re.sub(r'\b\d{10,}\b', ' ', cleaned)
            # Remove card numbers (CD XXXX, 4-digit groups)
            cleaned = re.sub(r'\bCD\s+\d+', ' ', cleaned)
            # Remove sort codes (XX-XX-XX)
            cleaned = re.sub(r'\b\d{2}-\d{2}-\d{2}\b', ' ', cleaned)
            # Remove reference codes (mix of letters and 6+ digits)
            cleaned = re.sub(r'\b[A-Z]{2,}\d{8,}\b', ' ', cleaned)
        
        # Extract amounts (max 5 digits before decimal, exactly 2 after)
        amount_pattern = r'(\d{1,5}(?:,\d{3})*\.\d{2})'
        matches = re.findall(amount_pattern, cleaned)
        
        # Convert and validate
        amounts = []
        for match in matches:
            try:
                amount = float(match.replace(',', ''))
                if self.MIN_AMOUNT <= amount <= max_amount:
                    amounts.append(amount)
            except ValueError:
                continue
        
        return amounts
    
    def parse_amount(self, amount_str: str) -> float:
        """
        Parse a single amount string.
        
        Handles:
        - £1,234.56
        - 1234.56
        - (1234.56) for negative
        - -1234.56
        
        Args:
            amount_str: Amount string
            
        Returns:
            Float value (0.0 if invalid)
        """
        if not amount_str:
            return 0.0
        
        clean = str(amount_str).strip()
        
        # Handle brackets as negative
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
            if not (self.MIN_AMOUNT <= amount <= self.MAX_AMOUNT):
                return 0.0
            return -amount if is_negative else amount
        except (ValueError, TypeError):
            return 0.0
    
    # =========================================================================
    # UNIVERSAL DATE PARSING
    # =========================================================================
    
    def parse_date_universal(
        self, 
        date_str: str, 
        year: str = None,
        formats: List[str] = None
    ) -> Optional[str]:
        """
        Parse date string using all known UK formats.
        
        Args:
            date_str: Date string to parse
            year: Year to append if not in string
            formats: List of formats to try (default: UK_DATE_FORMATS)
            
        Returns:
            ISO format date (YYYY-MM-DD) or None
        """
        if not date_str:
            return None
        
        date_str = date_str.strip()
        
        # Handle ordinal dates (1st, 2nd, 3rd, 4th, etc.)
        date_str = re.sub(r'(\d+)(st|nd|rd|th)\b', r'\1', date_str, flags=re.IGNORECASE)
        
        if formats is None:
            formats = self.UK_DATE_FORMATS
        
        # Append year if not present and year is provided
        if year and not re.search(r'\d{4}', date_str):
            date_str = f"{date_str} {year}"
        
        for fmt in formats:
            try:
                date_obj = datetime.strptime(date_str, fmt)
                
                # Validate year is reasonable (within 2 years of now)
                current_year = datetime.now().year
                if abs(date_obj.year - current_year) > 3:
                    continue
                
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        # Manual parsing fallback
        return self._parse_date_manual(date_str, year)
    
    def _parse_date_manual(self, date_str: str, year: str = None) -> Optional[str]:
        """Manual date parsing for edge cases"""
        # Pattern: DD MMM or DD MMM YYYY
        match = re.match(r'(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{2,4}))?', date_str)
        if match:
            day = int(match.group(1))
            month_str = match.group(2).lower()
            year_str = match.group(3) or year
            
            month = self.MONTH_MAP.get(month_str[:3])
            if not month:
                return None
            
            if year_str:
                if len(year_str) == 2:
                    year_int = 2000 + int(year_str) if int(year_str) < 50 else 1900 + int(year_str)
                else:
                    year_int = int(year_str)
            else:
                year_int = datetime.now().year
            
            try:
                date_obj = datetime(year_int, month, day)
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                return None
        
        # Pattern: DD/MM/YYYY or DD/MM/YY
        match = re.match(r'(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})', date_str)
        if match:
            day, month, year_str = int(match.group(1)), int(match.group(2)), match.group(3)
            if len(year_str) == 2:
                year_int = 2000 + int(year_str) if int(year_str) < 50 else 1900 + int(year_str)
            else:
                year_int = int(year_str)
            
            try:
                date_obj = datetime(year_int, month, day)
                return date_obj.strftime('%Y-%m-%d')
            except ValueError:
                return None
        
        return None
    
    # =========================================================================
    # BLOCK-BASED TEXT GROUPING
    # =========================================================================
    
    def group_text_into_blocks(
        self, 
        lines: List[str], 
        date_pattern: str = None,
        max_block_lines: int = 10
    ) -> List[Dict]:
        """
        Group text lines into transaction blocks.
        
        A transaction block starts with a date and includes all following
        lines until the next date (or max lines reached).
        
        Args:
            lines: List of text lines
            date_pattern: Regex for detecting dates (default: universal)
            max_block_lines: Maximum lines per block
            
        Returns:
            List of block dictionaries with 'lines', 'date_line', 'start_idx'
        """
        if date_pattern is None:
            date_pattern = self._get_date_pattern()
        
        blocks = []
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                i += 1
                continue
            
            # Check if line starts with date
            date_match = re.match(date_pattern, line, re.IGNORECASE)
            
            if date_match:
                block_lines = [line]
                start_idx = i
                
                # Look ahead for continuation lines
                j = i + 1
                while j < len(lines) and j < i + max_block_lines:
                    next_line = lines[j].strip()
                    
                    # Stop if we hit another date line
                    if next_line and re.match(date_pattern, next_line, re.IGNORECASE):
                        break
                    
                    if next_line:
                        block_lines.append(next_line)
                    
                    j += 1
                
                blocks.append({
                    'lines': block_lines,
                    'date_line': line,
                    'date_match': date_match.group(0),
                    'start_idx': start_idx,
                    'end_idx': j - 1
                })
                
                i = j
            else:
                i += 1
        
        return blocks
    
    def look_backward_for_description(
        self, 
        lines: List[str], 
        current_idx: int, 
        max_lookback: int = 3,
        stop_patterns: List[str] = None
    ) -> str:
        """
        Look backward from current line for merchant/description.
        
        Used for banks like Monzo where merchant name appears before the date line.
        
        Args:
            lines: All lines
            current_idx: Current position
            max_lookback: How far back to look
            stop_patterns: Patterns that indicate we should stop looking
            
        Returns:
            Combined description from previous lines
        """
        if stop_patterns is None:
            stop_patterns = ['Date', 'Description', 'Balance', r'\d{1,2}[/-]\d{1,2}[/-]']
        
        description_parts = []
        
        for j in range(1, min(max_lookback + 1, current_idx + 1)):
            prev_line = lines[current_idx - j].strip()
            
            # Stop if we hit a stop pattern
            should_stop = False
            for pattern in stop_patterns:
                if re.search(pattern, prev_line, re.IGNORECASE):
                    should_stop = True
                    break
            
            if should_stop:
                break
            
            # Skip very short lines or pure numbers
            if len(prev_line) < 3 or re.match(r'^[\d\.\-,\s]+$', prev_line):
                continue
            
            description_parts.insert(0, prev_line)
        
        return ' '.join(description_parts)
    
    # =========================================================================
    # POST-PROCESSING
    # =========================================================================
    
    def _post_process(self, transactions: List[Dict], metadata: Dict = None) -> List[Dict]:
        """
        Post-process transactions.
        
        Steps:
        1. Normalize all transactions
        2. Fill missing balances
        3. Remove duplicates
        4. Sort chronologically
        """
        if not transactions:
            return []
        
        # Normalize
        normalized = [self.normalize_transaction(txn) for txn in transactions]
        
        # Fill balances
        normalized = self.calculate_missing_balances(normalized)
        
        # Deduplicate
        normalized = self.deduplicate_transactions(normalized)
        
        # Sort by date
        normalized.sort(key=lambda x: x.get('date', ''))
        
        return normalized
    
    def normalize_transaction(self, txn: Dict) -> Dict:
        """
        Normalize transaction to standard format.
        
        Standard format:
        {
            'date': 'YYYY-MM-DD',
            'description': str,
            'debit': float,
            'credit': float,
            'balance': float or None,
            'type': 'income' or 'expense',
            'amount': float
        }
        """
        def safe_float(val):
            if val is None:
                return 0.0
            try:
                f = float(val)
                return 0.0 if f != f else f  # NaN check
            except (ValueError, TypeError):
                return 0.0
        
        normalized = {
            'date': txn.get('date', ''),
            'description': str(txn.get('description', '')).strip(),
            'debit': safe_float(txn.get('debit', 0)),
            'credit': safe_float(txn.get('credit', 0)),
            'balance': txn.get('balance'),
            'type': txn.get('type', 'expense'),
        }
        
        # Calculate amount and type
        if normalized['credit'] > 0:
            normalized['amount'] = normalized['credit']
            normalized['type'] = 'income'
        elif normalized['debit'] > 0:
            normalized['amount'] = normalized['debit']
            normalized['type'] = 'expense'
        else:
            normalized['amount'] = 0.0
        
        # Normalize balance
        if normalized['balance'] is not None:
            try:
                bal = float(normalized['balance'])
                normalized['balance'] = None if bal != bal else bal
            except (ValueError, TypeError):
                normalized['balance'] = None
        
        return normalized
    
    def calculate_missing_balances(
        self, 
        transactions: List[Dict], 
        direction: str = 'both'
    ) -> List[Dict]:
        """
        Calculate missing balances from known values.
        
        Args:
            transactions: List of transactions
            direction: 'forward', 'backward', or 'both'
            
        Returns:
            Transactions with balances filled in
        """
        if not transactions or len(transactions) < 2:
            return transactions
        
        # Find first known balance
        first_balance_idx = None
        for i, txn in enumerate(transactions):
            if txn.get('balance') is not None:
                first_balance_idx = i
                break
        
        if first_balance_idx is None:
            return transactions
        
        # Calculate forward
        if direction in ('forward', 'both'):
            current_balance = transactions[first_balance_idx]['balance']
            for i in range(first_balance_idx + 1, len(transactions)):
                credit = transactions[i].get('credit', 0) or 0
                debit = transactions[i].get('debit', 0) or 0
                current_balance = current_balance + credit - debit
                
                if transactions[i].get('balance') is None:
                    transactions[i]['balance'] = round(current_balance, 2)
                else:
                    current_balance = transactions[i]['balance']
        
        # Calculate backward
        if direction in ('backward', 'both') and first_balance_idx > 0:
            current_balance = transactions[first_balance_idx]['balance']
            for i in range(first_balance_idx - 1, -1, -1):
                credit = transactions[i + 1].get('credit', 0) or 0
                debit = transactions[i + 1].get('debit', 0) or 0
                current_balance = current_balance - credit + debit
                
                if transactions[i].get('balance') is None:
                    transactions[i]['balance'] = round(current_balance, 2)
                else:
                    current_balance = transactions[i]['balance']
        
        return transactions
    
    def deduplicate_transactions(self, transactions: List[Dict]) -> List[Dict]:
        """
        Remove duplicate transactions.
        
        Uses date + amount + description prefix as key.
        """
        seen = set()
        unique = []
        
        for txn in transactions:
            # Create key from date, total amount, and description prefix
            amount = round(txn.get('debit', 0) + txn.get('credit', 0), 2)
            desc_prefix = txn.get('description', '')[:30].lower()
            key = (txn.get('date'), amount, desc_prefix)
            
            if key not in seen:
                seen.add(key)
                unique.append(txn)
        
        return unique
    
    # =========================================================================
    # VALIDATION
    # =========================================================================
    
    def validate_running_balance(self, transactions: List[Dict]) -> List[str]:
        """Validate that running balance is correct"""
        errors = []
        
        if not transactions or len(transactions) < 2:
            return errors
        
        first_balance = transactions[0].get('balance')
        if first_balance is None:
            return errors
        
        calculated_balance = float(first_balance)
        
        for i, txn in enumerate(transactions[1:], 1):
            credit = float(txn.get('credit', 0) or 0)
            debit = float(txn.get('debit', 0) or 0)
            calculated_balance = calculated_balance + credit - debit
            
            actual_balance = txn.get('balance')
            if actual_balance is not None:
                diff = abs(calculated_balance - float(actual_balance))
                if diff > 0.01:
                    errors.append(
                        f"Transaction {i+1} ({txn.get('date', 'unknown')}): "
                        f"Balance mismatch. Expected £{calculated_balance:.2f}, "
                        f"got £{actual_balance:.2f} (diff: £{diff:.2f})"
                    )
        
        return errors
    
    def validate_transaction_count(
        self, 
        transactions: List[Dict], 
        expected_count: Optional[int] = None
    ) -> List[str]:
        """Validate transaction count"""
        warnings = []
        
        if not transactions:
            warnings.append("No transactions extracted")
        elif expected_count and len(transactions) != expected_count:
            warnings.append(
                f"Transaction count mismatch: extracted {len(transactions)}, "
                f"expected {expected_count}"
            )
        
        return warnings
    
    # =========================================================================
    # CLASSIFICATION UTILITIES
    # =========================================================================
    
    def classify_transaction_type(self, description: str) -> str:
        """Classify transaction type from description"""
        if not description:
            return 'other'
        
        desc_lower = description.lower()
        
        classifications = [
            ('direct_debit', ['direct debit', 'dd ']),
            ('card_payment', ['card payment', 'card purchase', 'contactless', 'visa', 'mastercard']),
            ('standing_order', ['standing order', 'so ']),
            ('transfer', ['transfer', 'tfr ']),
            ('credit', ['received', 'from', 'salary', 'wages', 'deposit', 'refund']),
            ('bill_payment', ['bill payment', 'bp ']),
            ('atm', ['atm', 'cash', 'cashpoint', 'withdrawal']),
            ('bank_giro', ['bank giro', 'bgc']),
        ]
        
        for tx_type, keywords in classifications:
            if any(kw in desc_lower for kw in keywords):
                return tx_type
        
        return 'other'
    
    def is_credit_transaction(self, description: str) -> bool:
        """Check if transaction is a credit (income)"""
        if not description:
            return False
        
        desc_lower = description.lower()
        credit_indicators = [
            'received from', 'payment from', 'transfer from',
            'salary', 'wage', 'deposit', 'refund', 'credit',
            'interest', 'dividend'
        ]
        
        return any(indicator in desc_lower for indicator in credit_indicators)
    
    # =========================================================================
    # TEXT EXTRACTION UTILITIES
    # =========================================================================
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract all text from PDF"""
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
            
        except Exception as e:
            if "password" in str(e).lower():
                from .exceptions import PasswordProtectedPDFError
                raise PasswordProtectedPDFError()
            raise PDFExtractionError(f"Failed to extract text: {str(e)}")
    
    def clean_description(self, description: str, max_length: int = 100) -> str:
        """Clean and normalize transaction description"""
        if not description:
            return ''
        
        cleaned = description
        
        # Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        
        # Remove common noise patterns
        cleaned = re.sub(r'Ref:\s*[A-Za-z0-9\-_/\.]+', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'On\s+\d{1,2}\s+[A-Za-z]{3}(\s+\d{4})?', '', cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r'\*[A-Za-z0-9]+', '', cleaned)
        
        # Clean up after removals
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        cleaned = cleaned.strip('.,;:- ')
        
        # Truncate intelligently
        if len(cleaned) > max_length:
            truncated = cleaned[:max_length]
            last_space = truncated.rfind(' ')
            if last_space > max_length * 0.6:
                cleaned = truncated[:last_space] + '...'
            else:
                cleaned = truncated + '...'
        
        return cleaned

