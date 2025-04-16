from flask import Flask, request, jsonify, render_template
import requests
import os
import time
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# API status tracker (thread-safe)
api_status = {
    'status': 'UNKNOWN',
    'message': 'API status not checked yet',
    'timestamp': time.time()
}
api_status_lock = threading.Lock()

# API configuration
API_BASE_URL = 'https://app.switchtransact.com/api/1.0'
API_KEY = os.environ.get('SWITCHTRANSACT_API_KEY', 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b')

def update_api_status(status, message):
    """Update the API status tracker in a thread-safe way"""
    with api_status_lock:
        api_status['status'] = status
        api_status['message'] = message
        api_status['timestamp'] = time.time()
    logger.info(f"API Status updated: {status} - {message}")

@app.route('/')
def index():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/api/status')
def get_api_status():
    """Return the current API status"""
    with api_status_lock:
        return jsonify(api_status)

@app.route('/api/check-client', methods=['POST'])
def check_client():
    """Check client details using the SwitchTransact API"""
    try:
        # Get and validate input
        data = request.json
        if not data or 'id_number' not in data:
            return jsonify({'status': 'error', 'message': 'ID number is required'}), 400
        
        id_number = data['id_number']
        if not id_number.isdigit():
            return jsonify({'status': 'error', 'message': 'ID number must contain only digits'}), 400
        
        logger.info(f"Received request to check client with ID: {id_number}")
        
        # Check if API key is available
        if not API_KEY:
            error_msg = "API key is not configured"
            logger.critical(error_msg)
            update_api_status('ERROR', error_msg)
            return jsonify({'status': 'error', 'message': error_msg}), 500
        
        # Prepare request to SwitchTransact API
        url = f"{API_BASE_URL}/workflow/people/details"
        headers = {
            'Authorization': API_KEY,
            'Content-Type': 'application/json'
        }
        payload = {
            'id_number': id_number,
            'record': True,
            'subscriptions': True
        }
        
        logger.info(f"Sending request to {url}")
        logger.info(f"Headers configured: Authorization (present), Content-Type: application/json")
        logger.info(f"Payload structure: {payload}")
        
        # Make the API request
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        logger.info(f"API response status code: {response.status_code}")
        logger.info(f"API response text snippet: {response.text[:200]}...")
        
        # Handle different response status codes
        if response.status_code == 401:
            error_msg = "API authentication failed"
            logger.error(error_msg)
            update_api_status('ERROR', error_msg)
            return jsonify({'status': 'error', 'message': error_msg}), 401
        
        elif response.status_code == 422:
            error_msg = "Invalid request parameters"
            logger.error(error_msg)
            update_api_status('ERROR', error_msg)
            return jsonify({'status': 'error', 'message': error_msg}), 422
        
        elif response.status_code == 429:
            error_msg = "API rate limit exceeded"
            logger.error(error_msg)
            update_api_status('ERROR', error_msg)
            return jsonify({'status': 'error', 'message': error_msg}), 429
        
        elif response.status_code >= 500:
            error_msg = f"API server error: {response.status_code}"
            logger.error(error_msg)
            update_api_status('ERROR', error_msg)
            return jsonify({'status': 'error', 'message': error_msg}), 500
        
        elif response.status_code == 200:
            # Parse the response JSON
            try:
                data = response.json()
                logger.info(f"Successfully parsed JSON response")
                
                # Check if record exists
                if data.get("record") and isinstance(data["record"], dict) and data["record"]:
                    logger.info("Client record found")
                    update_api_status('OK', 'API is responding normally')
                    return jsonify({'status': 'success', 'data': data})
                else:
                    logger.info("No client record found")
                    update_api_status('OK', 'API is responding normally')
                    return jsonify({'status': 'not_found', 'message': 'No client found with this ID number'})
            
            except ValueError as e:
                error_msg = f"Failed to parse API response: {str(e)}"
                logger.error(error_msg)
                update_api_status('ERROR', error_msg)
                return jsonify({'status': 'error', 'message': error_msg}), 500
        
        else:
            error_msg = f"Unexpected API response: {response.status_code}"
            logger.error(error_msg)
            update_api_status('ERROR', error_msg)
            return jsonify({'status': 'error', 'message': error_msg}), response.status_code
    
    except requests.exceptions.Timeout:
        error_msg = "API request timed out"
        logger.error(error_msg)
        update_api_status('ERROR', error_msg)
        return jsonify({'status': 'error', 'message': error_msg}), 504
    
    except requests.exceptions.ConnectionError:
        error_msg = "Failed to connect to API"
        logger.error(error_msg)
        update_api_status('ERROR', error_msg)
        return jsonify({'status': 'error', 'message': error_msg}), 502
    
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.critical(error_msg, exc_info=True)
        update_api_status('ERROR', error_msg)
        return jsonify({'status': 'error', 'message': error_msg}), 500

if __name__ == '__main__':
    # Check API status on startup
    try:
        url = f"{API_BASE_URL}/lookups?type=Bank"
        headers = {'Authorization': API_KEY}
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            update_api_status('OK', 'API is responding normally')
        else:
            update_api_status('ERROR', f'API returned status {response.status_code}')
    
    except Exception as e:
        update_api_status('ERROR', f'Failed to check API status: {str(e)}')
    
    # Start the Flask server
    app.run(debug=True, host='0.0.0.0', port=5000)
