"""
Universal Bank Statement Parser
Uses Claude AI to analyze and parse statements from any bank
"""
import pdfplumber
import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from anthropic import Anthropic

# Initialize Anthropic client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

class UniversalParser:
    """AI-powered universal parser for any bank statement"""

    def __init__(self):
        self.model = "claude-sonnet-4-5-20250929"

    def parse_statement(self, pdf_path: str) -> Dict:
        """
        Parse a bank statement using AI

        Returns:
            {
                'success': bool,
                'transactions': list,
                'confidence': float (0-1),
                'bank_detected': str,
                'needs_review': bool,
                'metadata': dict
            }
        """
        try:
            # Extract text and tables from PDF
            extracted_data = self._extract_pdf_data(pdf_path)

            if not extracted_data['text'] and not extracted_data['tables']:
                return {
                    'success': False,
                    'error': 'Could not extract data from PDF',
                    'confidence': 0.0
                }

            # Use Claude AI to analyze and parse
            result = self._analyze_with_claude(extracted_data)

            return result

        except Exception as e:
            print(f"Error in universal parser: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e),
                'confidence': 0.0
            }

    def _extract_pdf_data(self, pdf_path: str) -> Dict:
        """Extract text and tables from PDF"""
        data = {
            'text': '',
            'tables': [],
            'pages': 0
        }

        try:
            with pdfplumber.open(pdf_path) as pdf:
                data['pages'] = len(pdf.pages)

                # Extract from first 5 pages (or all if less)
                pages_to_process = min(5, len(pdf.pages))

                for page_num in range(pages_to_process):
                    page = pdf.pages[page_num]

                    # Extract text
                    page_text = page.extract_text()
                    if page_text:
                        data['text'] += f"\n=== PAGE {page_num + 1} ===\n{page_text}\n"

                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            if table and len(table) > 0:
                                data['tables'].append({
                                    'page': page_num + 1,
                                    'data': table
                                })

        except Exception as e:
            print(f"Error extracting PDF data: {e}")

        return data

    def _analyze_with_claude(self, extracted_data: Dict) -> Dict:
        """Use Claude AI to analyze and parse the statement"""

        # Prepare the data for Claude
        text_sample = extracted_data['text'][:8000]  # Limit text size
        tables_info = f"Found {len(extracted_data['tables'])} tables"

        if extracted_data['tables']:
            # Include first table as sample
            first_table = extracted_data['tables'][0]['data']
            tables_info += f"\n\nSample table (first 10 rows):\n"
            for row in first_table[:10]:
                tables_info += f"{row}\n"

        prompt = f"""Analyze this bank statement and extract all transactions.

PDF Data:
{text_sample}

{tables_info}

Your task:
1. Identify the bank name
2. Extract ALL transactions with these fields:
   - date (in YYYY-MM-DD format)
   - description
   - debit (amount paid out, 0 if none)
   - credit (amount paid in, 0 if none)
   - balance (account balance after transaction, null if not shown)
   - type ('income' or 'expense')

3. Provide a confidence score (0.0-1.0) for accuracy
4. Detect if this needs manual review

Return ONLY valid JSON in this exact format:
{{
  "bank_detected": "Bank Name",
  "currency": "GBP",
  "statement_period": "YYYY-MM-DD to YYYY-MM-DD",
  "transactions": [
    {{
      "date": "YYYY-MM-DD",
      "description": "Transaction description",
      "debit": 0.00,
      "credit": 0.00,
      "balance": 0.00,
      "type": "income"
    }}
  ],
  "confidence": 0.95,
  "needs_review": false,
  "notes": "Any important observations"
}}

Important:
- Extract ALL transactions, not just samples
- Ensure dates are in YYYY-MM-DD format
- Set debit OR credit (not both) for each transaction
- Type is 'income' if credit > 0, 'expense' if debit > 0
- Confidence should reflect parsing accuracy
- Set needs_review=true if confidence < 0.85 or if issues found
- Return ONLY the JSON, no other text
"""

        try:
            # Call Claude API
            message = client.messages.create(
                model=self.model,
                max_tokens=8000,
                temperature=0,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            # Extract JSON from response
            response_text = message.content[0].text

            # Try to parse JSON (handle potential markdown wrapping)
            if '```json' in response_text:
                # Extract JSON from markdown code block
                json_start = response_text.find('```json') + 7
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()
            elif '```' in response_text:
                # Extract from generic code block
                json_start = response_text.find('```') + 3
                json_end = response_text.find('```', json_start)
                response_text = response_text[json_start:json_end].strip()

            parsed_result = json.loads(response_text)

            # Validate and format response
            transactions = parsed_result.get('transactions', [])
            confidence = float(parsed_result.get('confidence', 0.0))

            # Sort transactions by date
            try:
                transactions.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))
            except:
                pass

            return {
                'success': True,
                'transactions': transactions,
                'confidence': confidence,
                'bank_detected': parsed_result.get('bank_detected', 'Unknown'),
                'needs_review': parsed_result.get('needs_review', confidence < 0.85),
                'metadata': {
                    'currency': parsed_result.get('currency', 'GBP'),
                    'statement_period': parsed_result.get('statement_period'),
                    'transaction_count': len(transactions),
                    'notes': parsed_result.get('notes'),
                    'pages_analyzed': extracted_data['pages']
                }
            }

        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Response was: {response_text[:500]}...")
            return {
                'success': False,
                'error': 'Failed to parse AI response',
                'confidence': 0.0,
                'raw_response': response_text[:500]
            }
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e),
                'confidence': 0.0
            }


# For direct testing
if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python universal_parser.py <pdf_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    parser = UniversalParser()
    result = parser.parse_statement(pdf_path)

    print(json.dumps(result, indent=2))
