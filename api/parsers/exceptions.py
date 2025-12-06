"""
Custom exceptions for bank statement parsing.
Provides structured error handling with error codes and recovery hints.
"""
from typing import Optional, Dict, Any


class ParserException(Exception):
    """Base exception for all parser errors"""
    
    error_code: str = "PARSER_ERROR"
    recoverable: bool = False
    user_message: str = "An error occurred while parsing your bank statement."
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        recoverable: Optional[bool] = None,
        user_message: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message)
        self.message = message
        if error_code:
            self.error_code = error_code
        if recoverable is not None:
            self.recoverable = recoverable
        if user_message:
            self.user_message = user_message
        self.details = details or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for API responses"""
        return {
            "error": True,
            "error_code": self.error_code,
            "message": self.user_message,
            "technical_message": self.message,
            "recoverable": self.recoverable,
            "details": self.details
        }


class BankDetectionError(ParserException):
    """Raised when bank cannot be detected from PDF"""
    
    error_code = "BANK_NOT_DETECTED"
    user_message = "We couldn't identify your bank. Please ensure this is a valid UK bank statement PDF."
    
    def __init__(self, message: str = "Could not detect bank from PDF content", **kwargs):
        super().__init__(message, **kwargs)


class UnsupportedBankError(ParserException):
    """Raised when detected bank is not supported"""
    
    error_code = "BANK_NOT_SUPPORTED"
    recoverable = True
    user_message = "This bank is not yet supported. We're adding new banks regularly!"
    
    def __init__(self, bank_name: str, message: Optional[str] = None, **kwargs):
        msg = message or f"Bank '{bank_name}' is not currently supported"
        super().__init__(msg, details={"bank_name": bank_name}, **kwargs)


class PDFExtractionError(ParserException):
    """Raised when PDF text cannot be extracted"""
    
    error_code = "PDF_EXTRACTION_FAILED"
    user_message = "We couldn't read your PDF. It might be password-protected, corrupted, or scanned."
    
    def __init__(self, message: str = "Failed to extract text from PDF", **kwargs):
        super().__init__(message, **kwargs)


class NoTransactionsFoundError(ParserException):
    """Raised when no transactions could be extracted"""
    
    error_code = "NO_TRANSACTIONS"
    recoverable = True
    user_message = "No transactions were found in your statement. Please ensure this is a valid bank statement with transaction data."
    
    def __init__(self, bank_name: str, message: Optional[str] = None, **kwargs):
        msg = message or f"No transactions found in {bank_name} statement"
        super().__init__(msg, details={"bank_name": bank_name}, **kwargs)


class HeaderNotFoundError(ParserException):
    """Raised when the transaction table header cannot be found"""
    
    error_code = "HEADER_NOT_FOUND"
    user_message = "We couldn't find the transaction table in your statement. The format might not be recognized."
    
    def __init__(self, bank_name: str, expected_columns: Optional[list] = None, **kwargs):
        msg = f"Could not find transaction header in {bank_name} statement"
        details = {"bank_name": bank_name}
        if expected_columns:
            details["expected_columns"] = expected_columns
        super().__init__(msg, details=details, **kwargs)


class DateParseError(ParserException):
    """Raised when a date cannot be parsed"""
    
    error_code = "DATE_PARSE_ERROR"
    recoverable = True
    
    def __init__(self, date_string: str, expected_format: Optional[str] = None, **kwargs):
        msg = f"Could not parse date: '{date_string}'"
        details = {"date_string": date_string}
        if expected_format:
            details["expected_format"] = expected_format
        super().__init__(msg, details=details, **kwargs)


class AmountParseError(ParserException):
    """Raised when an amount cannot be parsed"""
    
    error_code = "AMOUNT_PARSE_ERROR"
    recoverable = True
    
    def __init__(self, amount_string: str, **kwargs):
        msg = f"Could not parse amount: '{amount_string}'"
        super().__init__(msg, details={"amount_string": amount_string}, **kwargs)


class BalanceValidationError(ParserException):
    """Raised when running balance validation fails"""
    
    error_code = "BALANCE_VALIDATION_FAILED"
    recoverable = True
    user_message = "Some transactions may have incorrect amounts. Please verify the output."
    
    def __init__(
        self,
        transaction_index: int,
        expected_balance: float,
        actual_balance: float,
        **kwargs
    ):
        diff = abs(expected_balance - actual_balance)
        msg = f"Balance mismatch at transaction {transaction_index}: expected £{expected_balance:.2f}, got £{actual_balance:.2f} (diff: £{diff:.2f})"
        super().__init__(
            msg,
            details={
                "transaction_index": transaction_index,
                "expected_balance": expected_balance,
                "actual_balance": actual_balance,
                "difference": diff
            },
            **kwargs
        )


class ParserTimeoutError(ParserException):
    """Raised when parsing takes too long"""
    
    error_code = "PARSER_TIMEOUT"
    recoverable = True
    user_message = "Processing took too long. Please try with a smaller file or contact support."
    
    def __init__(self, timeout_seconds: float, **kwargs):
        msg = f"Parsing timed out after {timeout_seconds} seconds"
        super().__init__(msg, details={"timeout_seconds": timeout_seconds}, **kwargs)


class InvalidPDFError(ParserException):
    """Raised when the file is not a valid PDF"""
    
    error_code = "INVALID_PDF"
    user_message = "This doesn't appear to be a valid PDF file. Please upload a PDF bank statement."
    
    def __init__(self, message: str = "Invalid or corrupted PDF file", **kwargs):
        super().__init__(message, **kwargs)


class PasswordProtectedPDFError(ParserException):
    """Raised when PDF is password protected"""
    
    error_code = "PASSWORD_PROTECTED"
    user_message = "This PDF is password-protected. Please remove the password and try again."
    
    def __init__(self, **kwargs):
        super().__init__("PDF is password protected", **kwargs)


class ParserResult:
    """
    Structured result from parser operations.
    Encapsulates both success and failure states.
    """
    
    def __init__(
        self,
        success: bool,
        transactions: list = None,
        bank_name: str = "",
        bank_display_name: str = "",
        error: Optional[ParserException] = None,
        warnings: list = None,
        metadata: dict = None
    ):
        self.success = success
        self.transactions = transactions or []
        self.bank_name = bank_name
        self.bank_display_name = bank_display_name
        self.error = error
        self.warnings = warnings or []
        self.metadata = metadata or {}
    
    @property
    def count(self) -> int:
        return len(self.transactions)
    
    @classmethod
    def success_result(
        cls,
        transactions: list,
        bank_name: str,
        bank_display_name: str,
        warnings: list = None,
        metadata: dict = None
    ) -> "ParserResult":
        """Create a successful result"""
        return cls(
            success=True,
            transactions=transactions,
            bank_name=bank_name,
            bank_display_name=bank_display_name,
            warnings=warnings,
            metadata=metadata
        )
    
    @classmethod
    def error_result(
        cls,
        error: ParserException,
        bank_name: str = "",
        bank_display_name: str = ""
    ) -> "ParserResult":
        """Create an error result"""
        return cls(
            success=False,
            bank_name=bank_name,
            bank_display_name=bank_display_name,
            error=error
        )
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses"""
        result = {
            "success": self.success,
            "bank": self.bank_name,
            "bank_display_name": self.bank_display_name,
            "transactions": self.transactions,
            "count": self.count,
            "validation_warnings": self.warnings,
        }
        
        if self.error:
            result.update(self.error.to_dict())
        
        if self.metadata:
            result["metadata"] = self.metadata
        
        return result

