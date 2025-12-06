"""
Main Bank Statement Converter Orchestrator
Provides robust bank detection, parsing, and error handling.
"""
from typing import Dict, List, Optional
import pdfplumber
import os
import sys
import time

# Handle both relative imports (when used as module) and absolute imports (when run directly)
try:
    from .bank_detector import detect_uk_bank, get_bank_display_name
    from .parsers import (
        get_parser,
        get_parser_logger,
        ParserException,
        BankDetectionError,
        UnsupportedBankError,
        PDFExtractionError,
        NoTransactionsFoundError,
        ParserResult,
        list_supported_banks,
    )
    from .utils import calculate_accuracy_score
except ImportError:
    # Fallback for direct execution
    api_dir = os.path.dirname(os.path.abspath(__file__))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from bank_detector import detect_uk_bank, get_bank_display_name
    from parsers import (
        get_parser,
        get_parser_logger,
        ParserException,
        BankDetectionError,
        UnsupportedBankError,
        PDFExtractionError,
        NoTransactionsFoundError,
        ParserResult,
        list_supported_banks,
    )
    from utils import calculate_accuracy_score


# Initialize logger
logger = get_parser_logger('converter')


class BankStatementConverter:
    """Main converter orchestrator with improved error handling and logging"""
    
    def __init__(self):
        self.supported_banks = list_supported_banks()
        logger.info(f"Initialized converter with {len(self.supported_banks)} supported banks")
    
    def convert(self, pdf_file) -> Dict:
        """
        Main conversion method with structured error handling.
        
        Args:
            pdf_file: File-like object or file path to PDF
            
        Returns:
            Dictionary with keys:
            {
                'success': bool,
                'bank': str (bank identifier),
                'bank_display_name': str,
                'transactions': list,
                'count': int,
                'validation_errors': list,
                'validation_warnings': list,
                'accuracy_score': float,
                'processing_time_ms': int,
                'error': str (if failed),
                'error_code': str (if failed)
            }
        """
        start_time = time.time()
        
        try:
            # Step 1: Detect bank
            logger.info("Starting bank detection...")
            pdf_text = self._extract_text_for_detection(pdf_file)
            
            if not pdf_text or len(pdf_text.strip()) < 50:
                raise PDFExtractionError("PDF contains no readable text. It may be scanned or image-based.")
            
            bank_id = detect_uk_bank(pdf_text)
            bank_display_name = get_bank_display_name(bank_id)
            
            logger.info(f"Detected bank: {bank_display_name} ({bank_id})")
            
            if bank_id == 'unknown':
                raise BankDetectionError(
                    "Could not identify the bank from the PDF content. "
                    "Please ensure this is a valid UK bank statement."
                )
            
            # Step 2: Get appropriate parser
            if bank_id not in self.supported_banks:
                raise UnsupportedBankError(
                    bank_id,
                    f"Parser for {bank_display_name} is not yet available. "
                    f"Supported banks: {', '.join(self.supported_banks)}"
                )
            
            parser = get_parser(bank_id)
            logger.info(f"Using {parser.__class__.__name__}")
            
            # Step 3: Extract transactions
            logger.info("Extracting transactions...")
            transactions = parser.extract_transactions(pdf_file)
            
            if not transactions:
                raise NoTransactionsFoundError(
                    bank_display_name,
                    "No transactions could be extracted from the PDF. "
                    "Please ensure it is a valid bank statement with transaction data."
                )
            
            logger.info(f"Extracted {len(transactions)} transactions")
            
            # Step 4: Normalize transactions
            normalized_transactions = []
            for txn in transactions:
                normalized = parser.normalize_transaction(txn)
                normalized_transactions.append(normalized)
            
            # Step 5: Validate
            validation_errors = parser.validate_running_balance(normalized_transactions)
            validation_warnings = parser.validate_transaction_count(normalized_transactions)
            
            if validation_errors:
                logger.warning(f"Found {len(validation_errors)} validation errors")
            
            # Step 6: Calculate accuracy
            accuracy_score = calculate_accuracy_score(normalized_transactions, validation_errors)
            
            processing_time = int((time.time() - start_time) * 1000)
            logger.info(f"Conversion complete in {processing_time}ms with {accuracy_score:.1f}% accuracy")
            
            # Step 7: Format response
            return {
                'success': True,
                'bank': bank_id,
                'bank_display_name': bank_display_name,
                'transactions': normalized_transactions,
                'count': len(normalized_transactions),
                'validation_errors': validation_errors,
                'validation_warnings': validation_warnings,
                'accuracy_score': accuracy_score,
                'processing_time_ms': processing_time
            }
            
        except ParserException as e:
            processing_time = int((time.time() - start_time) * 1000)
            logger.error(f"Parser error: {e.message}")
            
            return {
                'success': False,
                'bank': getattr(e, 'details', {}).get('bank_name', 'unknown'),
                'bank_display_name': get_bank_display_name(getattr(e, 'details', {}).get('bank_name', 'unknown')),
                'transactions': [],
                'count': 0,
                'validation_errors': [],
                'validation_warnings': [],
                'accuracy_score': 0.0,
                'processing_time_ms': processing_time,
                'error': e.user_message,
                'error_code': e.error_code,
                'recoverable': e.recoverable
            }
            
        except Exception as e:
            processing_time = int((time.time() - start_time) * 1000)
            logger.error(f"Unexpected error: {str(e)}")
            
            import traceback
            traceback.print_exc()
            
            return {
                'success': False,
                'bank': 'unknown',
                'bank_display_name': 'Unknown',
                'transactions': [],
                'count': 0,
                'validation_errors': [],
                'validation_warnings': [],
                'accuracy_score': 0.0,
                'processing_time_ms': processing_time,
                'error': f'Conversion failed: {str(e)}',
                'error_code': 'UNEXPECTED_ERROR',
                'recoverable': False
            }
    
    def _extract_text_for_detection(self, pdf_file) -> str:
        """
        Extract text from first page for bank detection
        
        Args:
            pdf_file: File-like object or file path
            
        Returns:
            Text content from first few pages
        """
        try:
            with pdfplumber.open(pdf_file) as pdf:
                text = ''
                # Get text from first 3 pages (usually enough for bank detection)
                for page in pdf.pages[:3]:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + '\n'
                return text
        except Exception as e:
            logger.error(f"Error extracting text for detection: {str(e)}")
            return ''
    
    def get_supported_banks(self) -> List[Dict]:
        """
        Get list of supported banks with display names.
        
        Returns:
            List of dicts with bank_id and display_name
        """
        return [
            {
                'bank_id': bank_id,
                'display_name': get_bank_display_name(bank_id)
            }
            for bank_id in self.supported_banks
        ]


# Convenience function for direct usage
def convert_statement(pdf_path: str) -> Dict:
    """
    Convert a bank statement PDF to structured data.
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Conversion result dictionary
    """
    converter = BankStatementConverter()
    return converter.convert(pdf_path)
