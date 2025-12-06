"""
Bank Statement Parsers Package
Provides parsers for UK bank statement PDFs.
"""

# Import core modules
from .base_parser import BaseBankParser
from .logger import (
    get_parser_logger,
    ParsingContext,
    log_parsing_start,
    log_parsing_complete,
    log_transaction,
    log_parse_error,
    log_critical_error,
    PARSER_DEBUG,
)
from .exceptions import (
    ParserException,
    BankDetectionError,
    UnsupportedBankError,
    PDFExtractionError,
    NoTransactionsFoundError,
    HeaderNotFoundError,
    DateParseError,
    AmountParseError,
    BalanceValidationError,
    ParserTimeoutError,
    InvalidPDFError,
    PasswordProtectedPDFError,
    ParserResult,
)
from .config import (
    BankConfig,
    BANK_CONFIGS,
    get_config,
    get_all_bank_ids,
    is_credit_type,
    is_debit_type,
    should_skip_line,
    get_type_name,
    TYPE_CODE_NAMES,
)

# Import individual parsers
from .barclays_parser import BarclaysParser
from .monzo_parser import MonzoParser
from .lloyds_parser import LloydsParser
from .hsbc_parser import HSBCParser
from .revolut_parser import RevolutParser
from .natwest_parser import NatWestParser
from .santander_parser import SantanderParser
from .anna_parser import ANNAParser
from .wise_parser import WiseParser

# Parser registry for easy access
PARSER_REGISTRY = {
    'barclays': BarclaysParser,
    'monzo': MonzoParser,
    'lloyds': LloydsParser,
    'hsbc': HSBCParser,
    'revolut': RevolutParser,
    'natwest': NatWestParser,
    'santander': SantanderParser,
    'anna': ANNAParser,
    'wise': WiseParser,
}


def get_parser(bank_id: str) -> BaseBankParser:
    """
    Get a parser instance for a specific bank.
    
    Args:
        bank_id: Bank identifier (e.g., 'barclays', 'monzo')
        
    Returns:
        Parser instance
        
    Raises:
        UnsupportedBankError: If bank is not supported
    """
    parser_class = PARSER_REGISTRY.get(bank_id.lower())
    if not parser_class:
        raise UnsupportedBankError(bank_id)
    return parser_class()


def list_supported_banks() -> list:
    """Get list of supported bank IDs"""
    return list(PARSER_REGISTRY.keys())


__all__ = [
    # Base classes
    'BaseBankParser',
    
    # Logging
    'get_parser_logger',
    'ParsingContext',
    'log_parsing_start',
    'log_parsing_complete',
    'log_transaction',
    'log_parse_error',
    'log_critical_error',
    'PARSER_DEBUG',
    
    # Exceptions
    'ParserException',
    'BankDetectionError',
    'UnsupportedBankError',
    'PDFExtractionError',
    'NoTransactionsFoundError',
    'HeaderNotFoundError',
    'DateParseError',
    'AmountParseError',
    'BalanceValidationError',
    'ParserTimeoutError',
    'InvalidPDFError',
    'PasswordProtectedPDFError',
    'ParserResult',
    
    # Config
    'BankConfig',
    'BANK_CONFIGS',
    'get_config',
    'get_all_bank_ids',
    'is_credit_type',
    'is_debit_type',
    'should_skip_line',
    'get_type_name',
    'TYPE_CODE_NAMES',
    
    # Parsers
    'BarclaysParser',
    'MonzoParser',
    'LloydsParser',
    'HSBCParser',
    'RevolutParser',
    'NatWestParser',
    'SantanderParser',
    'ANNAParser',
    'WiseParser',
    
    # Registry
    'PARSER_REGISTRY',
    'get_parser',
    'list_supported_banks',
]
