
import os
import json
import time
import logging
import threading
from flask import Flask, request, jsonify, render_template
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('switchtransact-viewer')

app = Flask(__name__)

# API status tracker with thread lock
api_status = {
    'status': 'UNKNOWN',
    'message': 'API status has not been checked yet',
    'timestamp': time.time()
}
status_lock = threading.Lock()

def update_api_status(status, message):
    """Update the API status with thread safety"""
    with status_lock:
        api_status['status'] = status
        api_status['message'] = message
        api_status['timestamp'] = time.time()
        logger.info(f"API Status updated: {status} - {message}")

@app.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')

@app.route('/api/status', methods=['GET'])
def get_api_status():
    """Return the current API status"""
    with status_lock:
        return jsonify(api_status)

@app.route('/api/check-client', methods=['POST'])
def check_client():
    """Check client details from SwitchTransact API"""
    # Get the request data
    data = request.json
    id_number = data.get('id_number')
    
    # Input validation
    if not id_number or not id_number.strip() or not id_number.isdigit():
        logger.warning(f"Invalid ID number format received: {id_number}")
        return jsonify({"status": "error", "message": "Invalid ID number format"}), 400
    
    logger.info(f"Processing request for ID number: {id_number}")
    
    # Get API key from environment
    api_key = os.environ.get('SWITCHTRANSACT_API_KEY')
    if not api_key:
        logger.critical("SWITCHTRANSACT_API_KEY environment variable is not set")
        update_api_status('ERROR', 'Missing API Key Config')
        return jsonify({"status": "error", "message": "Server configuration error"}), 500
    
    # Prepare request to SwitchTransact API
    url = "https://app.switchtransact.com/api/1.0/workflow/people/details"
    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    body = {
        "id_number": id_number,
        "record": True,
        "subscriptions": True,
        "bank_accounts": False,
        "transactions": False
    }
    
    logger.info(f"Preparing API call to: {url}")
    logger.info(f"Request headers prepared (Authorization and Content-Type)")
    logger.info(f"Request body structure: {json.dumps(body)}")
    
    # Make the API call
    try:
        response = requests.post(url, headers=headers, json=body, timeout=20)
        
        # Log the raw response
        logger.info(f"API response status code: {response.status_code}")
        logger.info(f"API response text (first 500 chars): {response.text[:500]}")
        
        # Handle different status codes
        if response.status_code == 401:
            logger.error("Authentication failed with SwitchTransact API")
            update_api_status('ERROR', 'Authentication Failed')
            return jsonify({"status": "error", "message": "SwitchTransact API Authentication Failed."}), 500
            
        elif response.status_code == 422:
            try:
                error_data = response.json()
                api_error_message = error_data.get('message', 'Unknown validation error')
            except:
                api_error_message = 'Unknown validation error'
                
            logger.error(f"API validation error: {api_error_message}")
            update_api_status('ERROR', 'API Validation Error')
            return jsonify({"status": "error", "message": f"SwitchTransact API Validation Error: {api_error_message}"}), 422
            
        elif response.status_code == 429:
            logger.error("Rate limited by SwitchTransact API")
            update_api_status('ERROR', 'Rate Limited')
            return jsonify({"status": "error", "message": "SwitchTransact API Rate Limit Reached."}), 429
            
        elif response.status_code >= 500:
            logger.error(f"SwitchTransact API server error: {response.status_code}")
            update_api_status('ERROR', 'API Server Error')
            return jsonify({"status": "error", "message": "SwitchTransact API Server Error."}), 502
            
        elif response.status_code == 200:
            # Try to parse the JSON response
            try:
                data = response.json()
                logger.info(f"Parsed response top-level keys: {list(data.keys())}")
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Raw response: {response.text}")
                update_api_status('ERROR', 'Invalid Format')
                return jsonify({"status": "error", "message": "Invalid format received from SwitchTransact API."}), 500
            
            # Check if client record was found
            record_data = data.get("record")
            client_found = isinstance(record_data, dict) and bool(record_data)
            logger.info(f"Client record found check result: {client_found}")
            
            if not client_found:
                update_api_status('OK', 'API responded normally')
                return jsonify({
                    "status": "not_found", 
                    "message": f"No client record found for ID: {id_number}."
                }), 200
            
            # Extract relevant data if client found
            extracted_data = extract_client_data(data)
            update_api_status('OK', 'API responded normally')
            return jsonify({
                "status": "success",
                "data": extracted_data
            }), 200
            
        else:
            # Handle unexpected status codes
            logger.error(f"Unexpected API response code: {response.status_code}")
            update_api_status('ERROR', f'Unexpected response code: {response.status_code}')
            return jsonify({"status": "error", "message": "Unexpected response code from SwitchTransact API."}), 502
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception occurred: {e}")
        update_api_status('ERROR', 'Network Error')
        return jsonify({"status": "error", "message": "Error connecting to SwitchTransact API"}), 503

def extract_client_data(api_data):
    """Extract and format client data from the API response"""
    record = api_data.get('record', {})
    subscriptions = api_data.get('subscriptions', [])
    
    # Extract client basic info
    client_data = {
        "full_name": f"{record.get('firstname', '')} {record.get('lastname', '')}".strip(),
        "id_number": record.get('id_number', ''),
        "member_number": record.get('member_number', ''),
        "status": "Active" if record.get('is_active', False) else "Inactive",
        "email": record.get('email', ''),
        "contact_cell": record.get('cell', ''),
        "subscriptions": []
    }
    
    # Extract subscription data
    for sub in subscriptions:
        sub_data = {
            "sub_status": sub.get('status', 'Unknown'),
            "sub_start_date": sub.get('start_date', ''),
            "sub_end_date": sub.get('end_date', 'Ongoing') or 'Ongoing',
            "products": []
        }
        
        # Extract product data
        for product in sub.get('products', []):
            product_data = {
                "product_name": product.get('name', 'Unknown Product'),
                "product_amount_formatted": f"R {float(product.get('amount', 0)):.2f}"
            }
            sub_data['products'].append(product_data)
        
        client_data['subscriptions'].append(sub_data)
    
    return client_data

if __name__ == '__main__':
    app.run(debug=True)
