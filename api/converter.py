"""
Main Bank Statement Converter Orchestrator
"""
from typing import Dict, List, Optional
import pdfplumber
import os
import sys

# Handle both relative imports (when used as module) and absolute imports (when run directly)
try:
    from .bank_detector import detect_uk_bank, get_bank_display_name
    from .parsers.wise_parser import WiseParser
    from .parsers.barclays_parser import BarclaysParser
    from .parsers.monzo_parser import MonzoParser
    from .parsers.lloyds_parser import LloydsParser
    from .parsers.revolut_parser import RevolutParser
    from .parsers.hsbc_parser import HSBCParser
    from .parsers.anna_parser import ANNAParser
    from .parsers.santander_parser import SantanderParser
    from .parsers.natwest_parser import NatWestParser
    from .utils import calculate_accuracy_score
except ImportError:
    # Fallback for direct execution
    api_dir = os.path.dirname(os.path.abspath(__file__))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    from bank_detector import detect_uk_bank, get_bank_display_name
    from parsers.wise_parser import WiseParser
    from parsers.barclays_parser import BarclaysParser
    from parsers.monzo_parser import MonzoParser
    from parsers.lloyds_parser import LloydsParser
    from parsers.revolut_parser import RevolutParser
    from parsers.hsbc_parser import HSBCParser
    from parsers.anna_parser import ANNAParser
    from parsers.santander_parser import SantanderParser
    from parsers.natwest_parser import NatWestParser
    from utils import calculate_accuracy_score


class BankStatementConverter:
    """Main converter orchestrator"""
    
    # Map of bank IDs to parser classes
    PARSERS = {
        'wise': WiseParser,
        'barclays': BarclaysParser,
        'monzo': MonzoParser,
        'lloyds': LloydsParser,
        'revolut': RevolutParser,
        'hsbc': HSBCParser,
        'anna': ANNAParser,
        'santander': SantanderParser,
        'natwest': NatWestParser,
        # Add more as parsers are built
        # etc.
    }
    
    def __init__(self):
        self.parsers = {bank_id: parser_class() for bank_id, parser_class in self.PARSERS.items()}
    
    def convert(self, pdf_file) -> Dict:
        """
        Main conversion method
        
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
                'error': str (if failed)
            }
        """
        try:
            # Step 1: Detect bank
            pdf_text = self._extract_text_for_detection(pdf_file)
            bank_id = detect_uk_bank(pdf_text)
            bank_display_name = get_bank_display_name(bank_id)
            
            if bank_id == 'unknown':
                return {
                    'success': False,
                    'bank': 'unknown',
                    'bank_display_name': 'Unknown Bank',
                    'transactions': [],
                    'count': 0,
                    'validation_errors': [],
                    'validation_warnings': ['Could not detect bank from PDF'],
                    'accuracy_score': 0.0,
                    'error': 'Bank detection failed. Please ensure PDF is from a supported UK bank.'
                }
            
            # Step 2: Get appropriate parser
            if bank_id not in self.parsers:
                return {
                    'success': False,
                    'bank': bank_id,
                    'bank_display_name': bank_display_name,
                    'transactions': [],
                    'count': 0,
                    'validation_errors': [],
                    'validation_warnings': [f'{bank_display_name} parser not yet implemented'],
                    'accuracy_score': 0.0,
                    'error': f'Parser for {bank_display_name} is not yet available. Please check back soon.'
                }
            
            parser = self.parsers[bank_id]
            
            # Step 3: Extract transactions
            transactions = parser.extract_transactions(pdf_file)
            
            if not transactions:
                return {
                    'success': False,
                    'bank': bank_id,
                    'bank_display_name': bank_display_name,
                    'transactions': [],
                    'count': 0,
                    'validation_errors': [],
                    'validation_warnings': ['No transactions found in PDF'],
                    'accuracy_score': 0.0,
                    'error': 'No transactions could be extracted from the PDF. Please ensure it is a valid bank statement.'
                }
            
            # Step 4: Normalize transactions
            normalized_transactions = []
            for txn in transactions:
                normalized = parser.normalize_transaction(txn)
                normalized_transactions.append(normalized)
            
            # Step 5: Validate
            validation_errors = parser.validate_running_balance(normalized_transactions)
            validation_warnings = parser.validate_transaction_count(normalized_transactions)
            
            # Step 6: Calculate accuracy
            accuracy_score = calculate_accuracy_score(normalized_transactions, validation_errors)
            
            # Step 7: Format response
            return {
                'success': True,
                'bank': bank_id,
                'bank_display_name': bank_display_name,
                'transactions': normalized_transactions,
                'count': len(normalized_transactions),
                'validation_errors': validation_errors,
                'validation_warnings': validation_warnings,
                'accuracy_score': accuracy_score
            }
            
        except Exception as e:
            return {
                'success': False,
                'bank': 'unknown',
                'bank_display_name': 'Unknown',
                'transactions': [],
                'count': 0,
                'validation_errors': [],
                'validation_warnings': [],
                'accuracy_score': 0.0,
                'error': f'Conversion failed: {str(e)}'
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
            print(f"Error extracting text for detection: {str(e)}")
            return ''

