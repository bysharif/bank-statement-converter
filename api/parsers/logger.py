"""
Centralized logging system for bank statement parsers.
Replaces print statements with proper structured logging.
"""
import logging
import os
import sys
from typing import Optional
from functools import wraps
import time


# Environment variable to control debug mode
PARSER_DEBUG = os.getenv('PARSER_DEBUG', 'false').lower() == 'true'

# Create a custom formatter for parser logs
class ParserFormatter(logging.Formatter):
    """Custom formatter with emoji indicators for different log levels"""
    
    FORMATS = {
        logging.DEBUG: "🔍 %(name)s - %(message)s",
        logging.INFO: "✅ %(name)s - %(message)s",
        logging.WARNING: "⚠️  %(name)s - %(message)s",
        logging.ERROR: "❌ %(name)s - %(message)s",
        logging.CRITICAL: "🚨 %(name)s - %(message)s",
    }
    
    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno, "%(name)s - %(message)s")
        formatter = logging.Formatter(log_fmt)
        return formatter.format(record)


# Singleton handler to avoid duplicate logs
_handler_initialized = False
_console_handler = None


def _init_handler():
    """Initialize the console handler once"""
    global _handler_initialized, _console_handler
    if not _handler_initialized:
        _console_handler = logging.StreamHandler(sys.stdout)
        _console_handler.setFormatter(ParserFormatter())
        _handler_initialized = True
    return _console_handler


def get_parser_logger(parser_name: str) -> logging.Logger:
    """
    Get a logger for a specific parser.
    
    Args:
        parser_name: Name of the parser (e.g., 'barclays', 'monzo')
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(f"bankparser.{parser_name}")
    
    # Set level based on debug mode
    if PARSER_DEBUG:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)
    
    # Add handler if not already added
    if not logger.handlers:
        handler = _init_handler()
        logger.addHandler(handler)
    
    # Prevent propagation to root logger
    logger.propagate = False
    
    return logger


def log_parsing_start(logger: logging.Logger, parser_name: str, line_count: int):
    """Log the start of parsing operation"""
    logger.info(f"{parser_name.upper()} PARSER - Starting to process {line_count} lines")


def log_parsing_complete(logger: logging.Logger, parser_name: str, transaction_count: int):
    """Log successful completion of parsing"""
    logger.info(f"{parser_name.upper()} PARSER - Extracted {transaction_count} transactions")


def log_transaction(logger: logging.Logger, date: str, description: str, amount: float, balance: Optional[float] = None):
    """Log a single transaction extraction (debug level)"""
    balance_str = f"£{balance:.2f}" if balance is not None else "N/A"
    amount_str = f"£{amount:.2f}" if amount >= 0 else f"-£{abs(amount):.2f}"
    logger.debug(f"Transaction: {date} | {description[:40]:40} | {amount_str:>10} | Balance: {balance_str}")


def log_block(logger: logging.Logger, block_num: int, line_count: int, preview: str):
    """Log a transaction block (debug level)"""
    logger.debug(f"Block {block_num}: {line_count} lines - {preview[:60]}")


def log_header_found(logger: logging.Logger, line_num: int, header_text: str):
    """Log when header is found"""
    logger.debug(f"Found header at line {line_num}: {header_text[:70]}")


def log_skipped_line(logger: logging.Logger, reason: str, line: str):
    """Log when a line is skipped (debug level only)"""
    logger.debug(f"Skipped ({reason}): {line[:50]}")


def log_parse_error(logger: logging.Logger, error_type: str, details: str):
    """Log a parsing error"""
    logger.warning(f"{error_type}: {details}")


def log_critical_error(logger: logging.Logger, error: Exception, context: str = ""):
    """Log a critical error with traceback"""
    context_str = f" [{context}]" if context else ""
    logger.error(f"Critical error{context_str}: {str(error)}")


def timed_operation(logger: logging.Logger, operation_name: str):
    """
    Decorator to time and log operations.
    
    Usage:
        @timed_operation(logger, "extract_transactions")
        def extract_transactions(self, pdf_path):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                elapsed = time.time() - start_time
                logger.debug(f"{operation_name} completed in {elapsed:.2f}s")
                return result
            except Exception as e:
                elapsed = time.time() - start_time
                logger.error(f"{operation_name} failed after {elapsed:.2f}s: {str(e)}")
                raise
        return wrapper
    return decorator


class ParsingContext:
    """
    Context manager for parsing operations with automatic logging.
    
    Usage:
        with ParsingContext(logger, "lloyds", total_lines=150) as ctx:
            # parsing code
            ctx.add_transaction(...)
    """
    
    def __init__(self, logger: logging.Logger, parser_name: str, total_lines: int = 0):
        self.logger = logger
        self.parser_name = parser_name
        self.total_lines = total_lines
        self.start_time = None
        self.transactions_found = 0
        self.errors = []
        self.warnings = []
    
    def __enter__(self):
        self.start_time = time.time()
        log_parsing_start(self.logger, self.parser_name, self.total_lines)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time
        
        if exc_type is not None:
            self.logger.error(f"Parsing failed after {elapsed:.2f}s: {str(exc_val)}")
            return False
        
        log_parsing_complete(self.logger, self.parser_name, self.transactions_found)
        self.logger.debug(f"Processing time: {elapsed:.2f}s")
        
        if self.warnings:
            self.logger.warning(f"{len(self.warnings)} warnings during parsing")
        
        return True
    
    def add_transaction(self, transaction: dict):
        """Record a successful transaction extraction"""
        self.transactions_found += 1
        if PARSER_DEBUG:
            log_transaction(
                self.logger,
                transaction.get('date', 'unknown'),
                transaction.get('description', 'unknown'),
                transaction.get('credit', 0) or -transaction.get('debit', 0),
                transaction.get('balance')
            )
    
    def add_warning(self, warning: str):
        """Record a parsing warning"""
        self.warnings.append(warning)
        self.logger.warning(warning)
    
    def add_error(self, error: str):
        """Record a parsing error"""
        self.errors.append(error)
        self.logger.error(error)


