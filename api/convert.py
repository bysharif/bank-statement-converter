"""
Vercel serverless function for bank statement conversion
"""
from http.server import BaseHTTPRequestHandler
import json
import os
import sys
import tempfile
import re

# Add api directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from converter import BankStatementConverter


class handler(BaseHTTPRequestHandler):
    """
    Vercel serverless function handler for bank statement conversion
    """
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST requests for PDF conversion"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            content_type = self.headers.get('Content-Type', '')
            
            # Read request body
            body = self.rfile.read(content_length)
            
            # Parse multipart form data
            if 'multipart/form-data' not in content_type:
                self._send_error(400, 'Invalid content type. Expected multipart/form-data.')
                return
            
            # Extract file from multipart data
            boundary = content_type.split('boundary=')[1]
            parts = self._parse_multipart(body, boundary)
            
            file_data = None
            filename = None
            
            for part in parts:
                if 'filename=' in part.get('headers', {}).get('Content-Disposition', ''):
                    file_data = part['body']
                    # Extract filename from Content-Disposition header
                    disp = part.get('headers', {}).get('Content-Disposition', '')
                    if 'filename=' in disp:
                        filename = disp.split('filename=')[1].strip('"')
                    break
            
            if not file_data or not filename:
                self._send_error(400, 'No file provided. Please upload a PDF file.')
                return
            
            if not filename.lower().endswith('.pdf'):
                self._send_error(400, 'Invalid file type. Only PDF files are supported.')
                return
            
            # Check file size (10MB max)
            if len(file_data) > 10 * 1024 * 1024:
                self._send_error(400, 'File too large. Maximum size is 10MB.')
                return
            
            # Save file temporarily
            temp_dir = tempfile.mkdtemp()
            # Sanitize filename
            safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
            temp_path = os.path.join(temp_dir, safe_filename)
            
            try:
                with open(temp_path, 'wb') as f:
                    f.write(file_data)
                
                # Convert statement
                converter = BankStatementConverter()
                result = converter.convert(temp_path)
                
                # Clean up temp file
                os.remove(temp_path)
                os.rmdir(temp_dir)
                
                # Return result
                self._send_json(result, 200 if result.get('success') else 400)
                
            except Exception as e:
                # Clean up on error
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                if os.path.exists(temp_dir):
                    try:
                        os.rmdir(temp_dir)
                    except:
                        pass
                
                import traceback
                error_trace = traceback.format_exc()
                print(f"ERROR in convert: {str(e)}")
                print(f"Traceback: {error_trace}")
                
                self._send_error(500, f'Processing error: {str(e)}')
                
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"ERROR in handler: {str(e)}")
            print(f"Traceback: {error_trace}")
            self._send_error(500, f'Server error: {str(e)}')
    
    def do_GET(self):
        """Handle GET requests for health check"""
        if self.path == '/api/convert/health' or self.path.endswith('/health'):
            response = {
                'status': 'healthy',
                'version': '2.0',
                'service': 'Bank Statement Converter (Python)'
            }
            self._send_json(response, 200)
        else:
            self._send_error(404, 'Not found')
    
    def _parse_multipart(self, body, boundary):
        """Parse multipart/form-data"""
        parts = []
        boundary_bytes = ('--' + boundary).encode()
        sections = body.split(boundary_bytes)
        
        for section in sections[1:-1]:  # Skip first and last empty sections
            if not section.strip():
                continue
            
            # Split headers and body
            header_end = section.find(b'\r\n\r\n')
            if header_end == -1:
                continue
            
            headers_raw = section[:header_end].decode('utf-8', errors='ignore')
            body_data = section[header_end + 4:].rstrip(b'\r\n--')
            
            # Parse headers
            headers = {}
            for line in headers_raw.split('\r\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    headers[key.strip()] = value.strip()
            
            parts.append({
                'headers': headers,
                'body': body_data
            })
        
        return parts
    
    def _send_json(self, data, status_code=200):
        """Send JSON response"""
        response = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(response)))
        self.end_headers()
        self.wfile.write(response)
    
    def _send_error(self, status_code, message):
        """Send error response"""
        error_data = {
            'success': False,
            'error': message,
            'transactions': [],
            'count': 0
        }
        self._send_json(error_data, status_code)

