"""
Flask development server for Python parser (local development only)
Run this separately: python3 api/flask_server.py
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import tempfile
import re
import traceback

# Add api directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from converter import BankStatementConverter

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/convert', methods=['POST'])
def convert_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file part'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No selected file'}), 400

        if file and file.filename.lower().endswith('.pdf'):
            # Save file temporarily
            temp_dir = tempfile.mkdtemp()
            safe_filename = re.sub(r'[^a-zA-Z0-9._-]', '_', file.filename)
            temp_path = os.path.join(temp_dir, safe_filename)
            file.save(temp_path)

            try:
                converter = BankStatementConverter()
                result = converter.convert(temp_path)
                return jsonify(result), 200
            except Exception as e:
                traceback.print_exc()
                return jsonify({'success': False, 'error': f'Processing error: {str(e)}'}), 500
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                if os.path.exists(temp_dir):
                    try:
                        os.rmdir(temp_dir)
                    except:
                        pass
        else:
            return jsonify({'success': False, 'error': 'Invalid file type. Only PDF files are supported.'}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'version': '1.0.0',
        'service': 'Bank Statement Converter (Python - Local Dev)'
    }), 200

if __name__ == '__main__':
    # Check if port 5001 is available, otherwise use 5002
    import socket
    port = 5001
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    if sock.connect_ex(('localhost', port)) == 0:
        port = 5002
    sock.close()
    
    print(f"🐍 Python Flask server starting on port {port}...")
    print(f"📡 Available at: http://localhost:{port}/api/convert")
    app.run(debug=True, port=port)

