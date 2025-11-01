"""
UK Bank Detection System
Detects which UK bank a statement belongs to based on PDF content
"""
import re
from typing import Optional


def detect_uk_bank(pdf_text: str) -> str:
    """
    Detect UK bank from PDF content
    
    Args:
        pdf_text: Full text content extracted from PDF
        
    Returns:
        Bank identifier: 'barclays', 'hsbc', 'lloyds', 'natwest', 'santander', 
                        'wise', 'monzo', 'starling', 'revolut', or 'unknown'
    """
    if not pdf_text or not isinstance(pdf_text, str):
        return 'unknown'
    
    pdf_text_lower = pdf_text.lower()
    
    # Define bank patterns with priority order (most specific first)
    bank_patterns = {
        'barclays': [
            'barclays bank uk plc',
            'barclays bank',
            'barclays.co.uk',
            'bukb',
            'barclays'
        ],
        'hsbc': [
            'hsbc uk bank',
            'hsbc bank plc',
            'hsbc.co.uk',
            'hsbc'
        ],
        'lloyds': [
            'lloyds bank plc',
            'lloyds banking group',
            'lloyds.co.uk',
            'lloyds bank'
        ],
        'natwest': [
            'natwest bank plc',
            'national Westminster bank',
            'natwest.com',
            'natwest'
        ],
        'santander': [
            'santander uk plc',
            'santander.co.uk',
            'santander'
        ],
        'wise': [
            'wise',
            'transferwise',
            'wise.com'
        ],
        'monzo': [
            'monzo bank limited',
            'monzo bank',
            'monzo.com',
            'monzo'
        ],
        'starling': [
            'starling bank limited',
            'starling bank',
            'starlingbank.com',
            'starling'
        ],
        'revolut': [
            'revolut bank uab',
            'revolut ltd',
            'revolut.com',
            'revolut'
        ],
        'anna': [
            'anna is an electronic money account',
            'payrnet ltd',
            'anna subscription',
            'anna money',
            'anna.money',
            'absolutely no nonsense admin',
            'anna'
        ],
        'tide': [
            'tide platform',
            'tide.co',
            'tide'
        ]
    }
    
    # Score each bank based on pattern matches
    bank_scores = {}
    
    for bank, patterns in bank_patterns.items():
        score = 0
        for pattern in patterns:
            # Case-insensitive search
            if re.search(re.escape(pattern), pdf_text_lower, re.IGNORECASE):
                # More specific patterns get higher scores
                score += len(pattern) / 10
        if score > 0:
            bank_scores[bank] = score
    
    # Return bank with highest score
    if bank_scores:
        return max(bank_scores, key=bank_scores.get)
    
    return 'unknown'


def get_bank_display_name(bank_id: str) -> str:
    """
    Get human-readable bank name from bank identifier
    
    Args:
        bank_id: Bank identifier (e.g., 'barclays', 'wise')
        
    Returns:
        Display name (e.g., 'Barclays', 'Wise')
    """
    bank_names = {
        'barclays': 'Barclays',
        'hsbc': 'HSBC',
        'lloyds': 'Lloyds Bank',
        'natwest': 'NatWest',
        'santander': 'Santander',
        'wise': 'Wise',
        'monzo': 'Monzo',
        'starling': 'Starling Bank',
        'revolut': 'Revolut',
        'anna': 'ANNA Money',
        'tide': 'Tide',
        'unknown': 'Unknown Bank'
    }
    
    return bank_names.get(bank_id.lower(), 'Unknown Bank')

