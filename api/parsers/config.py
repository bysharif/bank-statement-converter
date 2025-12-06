"""
Bank-specific parser configurations.
Centralizes all bank-specific patterns, formats, and settings.
"""
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field


@dataclass
class BankConfig:
    """Configuration for a specific bank parser"""
    
    # Bank identification
    bank_id: str
    display_name: str
    
    # Date formats (in order of preference)
    date_formats: List[str] = field(default_factory=list)
    
    # Regex patterns
    date_pattern: str = ""
    amount_pattern: str = r'\d{1,5}(?:,\d{3})*\.\d{2}'
    
    # Transaction type codes (for classification)
    credit_type_codes: List[str] = field(default_factory=list)
    debit_type_codes: List[str] = field(default_factory=list)
    
    # Header detection keywords
    header_keywords: List[str] = field(default_factory=list)
    
    # Multi-line handling
    max_lookback_lines: int = 3
    max_lookahead_lines: int = 5
    
    # Skip patterns (lines to ignore)
    skip_patterns: List[str] = field(default_factory=list)
    
    # Amount limits (for validation)
    max_transaction_amount: float = 100000.0
    min_transaction_amount: float = 0.01
    
    # Processing options
    reverse_chronological: bool = False  # True if newest transactions first
    has_running_balance: bool = True
    
    # Additional metadata
    metadata: Dict[str, Any] = field(default_factory=dict)


# Bank configurations
BANK_CONFIGS: Dict[str, BankConfig] = {
    "barclays": BankConfig(
        bank_id="barclays",
        display_name="Barclays",
        date_formats=["%d %b %Y", "%d %b"],
        date_pattern=r'^\d{1,2}\s+\w{3}',
        header_keywords=["Date", "Description", "Money out", "Money in", "Balance"],
        credit_type_codes=["received", "payment from", "transfer from", "deposit", "refund", "credit"],
        debit_type_codes=["direct debit", "card payment", "bill payment", "transfer to", "standing order"],
        max_lookback_lines=3,
        max_lookahead_lines=25,
        skip_patterns=["start balance", "end balance", "continued", "barclays bank uk plc"],
        reverse_chronological=False,
        has_running_balance=True,
    ),
    
    "monzo": BankConfig(
        bank_id="monzo",
        display_name="Monzo",
        date_formats=["%d/%m/%Y"],
        date_pattern=r'^\d{1,2}/\d{1,2}/\d{4}',
        header_keywords=["Date", "Description", "Amount", "Balance"],
        credit_type_codes=["deposit", "received", "transfer in"],
        debit_type_codes=["payment", "transfer out", "withdrawal"],
        max_lookback_lines=4,
        max_lookahead_lines=3,
        skip_patterns=["reference:", "this relates to"],
        reverse_chronological=True,  # Monzo shows newest first
        has_running_balance=True,
    ),
    
    "lloyds": BankConfig(
        bank_id="lloyds",
        display_name="Lloyds Bank",
        date_formats=["%d %b %y", "%d %B %y"],
        date_pattern=r'\d{2}\s+[A-Z]{3}\s+\d{2}',
        header_keywords=["Date", "Description", "Type", "Money In", "Money Out", "Balance"],
        credit_type_codes=["PI", "FPI", "MPI", "BGC", "DEP", "TFR"],
        debit_type_codes=["PO", "FPO", "MPO", "EB", "DEB", "DD", "CHQ", "CPT", "SO", "BP"],
        max_lookback_lines=2,
        max_lookahead_lines=5,
        skip_patterns=["balance brought forward", "balance carried forward"],
        reverse_chronological=False,
        has_running_balance=True,
        metadata={
            "ocr_date_pattern": r'D2ate\s+(\d+)\s+([A-Z]{3})\s+(\d{2})',
            "type_code_pattern": r'\b(T[FDy]?ype\s+[A-Z]{2,3}|F?P[IO]|DEB|E\s?B)\b',
        }
    ),
    
    "hsbc": BankConfig(
        bank_id="hsbc",
        display_name="HSBC",
        date_formats=["%d %b %y"],
        date_pattern=r'^\d{2}\s+[A-Z][a-z]{2}\s+\d{2}',
        header_keywords=["Date", "Payment type", "Paid out", "Paid in", "Balance"],
        credit_type_codes=["CR", "WAGES", "SALARY", "DEPOSIT", "TRANSFER IN", "CREDIT", "BGC", "FPI"],
        debit_type_codes=["DD", "SO", "ATM", "VIS", "BP", "FPO", "CHQ", "CPT", "TFR"],
        max_lookback_lines=2,
        max_lookahead_lines=5,
        skip_patterns=["balance forward", "balance carried"],
        reverse_chronological=False,
        has_running_balance=True,
    ),
    
    "revolut": BankConfig(
        bank_id="revolut",
        display_name="Revolut",
        date_formats=["%d %b %Y"],
        date_pattern=r'^\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}',
        header_keywords=["Date", "Description", "Money in", "Money out", "Balance"],
        credit_type_codes=["transfer from", "received", "refund"],
        debit_type_codes=["transfer to", "payment", "purchase"],
        max_lookback_lines=2,
        max_lookahead_lines=3,
        skip_patterns=["from:", "to:"],
        reverse_chronological=False,
        has_running_balance=True,
    ),
    
    "natwest": BankConfig(
        bank_id="natwest",
        display_name="NatWest",
        date_formats=["%d %b %Y", "%-d %b %Y"],
        date_pattern=r'^\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}',
        header_keywords=["Date", "Type", "Description", "Paid in", "Paid out", "Balance"],
        credit_type_codes=["AUTOMATED CREDIT", "REFUND"],
        debit_type_codes=["DEBIT CARD", "MOBILE/ONLINE", "DIRECT DEBIT", "STANDING ORDER"],
        max_lookback_lines=2,
        max_lookahead_lines=4,
        skip_patterns=["brought forward"],
        reverse_chronological=False,
        has_running_balance=True,
    ),
    
    "santander": BankConfig(
        bank_id="santander",
        display_name="Santander",
        date_formats=[],  # Uses ordinal dates (3rd Dec)
        date_pattern=r'^\d{1,2}(?:st|nd|rd|th)\s+[A-Z][a-z]{2}',
        header_keywords=["Date", "Description", "Credits", "Debits", "Balance"],
        credit_type_codes=["RECEIPT", "TRANSFER FROM", "BANK GIRO CREDIT", "CREDIT REF"],
        debit_type_codes=["PAYMENT TO", "DIRECT DEBIT", "CARD PAYMENT", "BILL PAYMENT"],
        max_lookback_lines=2,
        max_lookahead_lines=4,
        skip_patterns=["previous statement balance", "total credits", "total debits", "current statement balance"],
        reverse_chronological=False,
        has_running_balance=True,
    ),
    
    "anna": BankConfig(
        bank_id="anna",
        display_name="ANNA Money",
        date_formats=["%d %b %Y"],
        date_pattern=r'\d{1,2}\s+[A-Z][a-z]{2}\s+\d{4}',
        header_keywords=["Processed on", "Created on", "Type", "Paid out", "Paid in", "Balance"],
        credit_type_codes=["FP", "P2P", "TFR"],
        debit_type_codes=["POS", "FEE", "DD", "ATM", "SO"],
        max_lookback_lines=2,
        max_lookahead_lines=4,
        skip_patterns=["anna is an electronic money", "page"],
        reverse_chronological=False,
        has_running_balance=True,
        metadata={
            "type_codes": ["POS", "FEE", "DD", "FP", "P2P", "ATM", "TFR", "SO"],
        }
    ),
    
    "wise": BankConfig(
        bank_id="wise",
        display_name="Wise",
        date_formats=["%d %B %Y", "%d %b %Y"],
        date_pattern=r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})',
        header_keywords=["Description", "Incoming", "Outgoing", "Balance"],
        credit_type_codes=["received", "incoming"],
        debit_type_codes=["sent", "outgoing", "converted"],
        max_lookback_lines=2,
        max_lookahead_lines=4,
        skip_patterns=["description", "total", "summary", "balance on", "generated on"],
        reverse_chronological=True,  # Wise shows newest first
        has_running_balance=True,
    ),
}


def get_config(bank_id: str) -> Optional[BankConfig]:
    """Get configuration for a specific bank"""
    return BANK_CONFIGS.get(bank_id.lower())


def get_all_bank_ids() -> List[str]:
    """Get list of all supported bank IDs"""
    return list(BANK_CONFIGS.keys())


def is_credit_type(bank_id: str, type_text: str) -> bool:
    """Check if a transaction type indicates credit/income"""
    config = get_config(bank_id)
    if not config:
        return False
    
    type_lower = type_text.lower()
    return any(code.lower() in type_lower for code in config.credit_type_codes)


def is_debit_type(bank_id: str, type_text: str) -> bool:
    """Check if a transaction type indicates debit/expense"""
    config = get_config(bank_id)
    if not config:
        return False
    
    type_lower = type_text.lower()
    return any(code.lower() in type_lower for code in config.debit_type_codes)


def should_skip_line(bank_id: str, line: str) -> bool:
    """Check if a line should be skipped based on bank config"""
    config = get_config(bank_id)
    if not config:
        return False
    
    line_lower = line.lower()
    return any(pattern in line_lower for pattern in config.skip_patterns)


# Type code mappings for human-readable descriptions
TYPE_CODE_NAMES: Dict[str, str] = {
    # Lloyds/HSBC codes
    "PO": "Payment Out",
    "PI": "Payment In",
    "FPO": "Faster Payment Out",
    "FPI": "Faster Payment In",
    "MPO": "Mobile Payment Out",
    "MPI": "Mobile Payment In",
    "DD": "Direct Debit",
    "SO": "Standing Order",
    "BGC": "Bank Giro Credit",
    "DEB": "Debit",
    "CHQ": "Cheque",
    "CPT": "Card Payment",
    "TFR": "Transfer",
    "ATM": "ATM Withdrawal",
    "VIS": "Visa Transaction",
    "EB": "Electronic Banking",
    "BP": "Bill Payment",
    "CR": "Credit",
    
    # ANNA codes
    "POS": "Point of Sale",
    "FEE": "Fee",
    "P2P": "Peer to Peer Transfer",
}


def get_type_name(type_code: str) -> str:
    """Get human-readable name for a transaction type code"""
    return TYPE_CODE_NAMES.get(type_code.upper(), type_code)

