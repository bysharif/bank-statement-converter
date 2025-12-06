"""
Base parser class for all UK bank statement parsers
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
from datetime import datetime


class BaseBankParser(ABC):
    """Base class for all UK bank parsers"""
    
    def __init__(self):
        self.bank_name = self.__class__.__name__.replace('Parser', '').title()
    
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

