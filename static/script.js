
document.addEventListener('DOMContentLoaded', function() {
    // Initial API status check
    updateApiStatus();
    
    // Set up event listener for the check button
    const checkButton = document.getElementById('check-button');
    const idNumberInput = document.getElementById('id-number-input');
    
    checkButton.addEventListener('click', function() {
        checkClientDetails();
    });
    
    // Allow Enter key to submit the form
    idNumberInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkClientDetails();
        }
    });
    
    // Set up interval to periodically check API status
    setInterval(updateApiStatus, 60000); // Check every minute
});

/**
 * Update the API status indicator
 */
function updateApiStatus() {
    fetch('/api/status')
        .then(response => response.json())
        .then(data => {
            const statusIndicator = document.getElementById('api-status-indicator');
            
            // Update the text
            statusIndicator.textContent = data.status;
            
            // Update the class
            statusIndicator.className = '';
            
            if (data.status === 'OK') {
                statusIndicator.classList.add('status-ok');
            } else if (data.status === 'ERROR') {
                statusIndicator.classList.add('status-error');
            } else {
                statusIndicator.classList.add('status-unknown');
            }
            
            // Add tooltip with message
            statusIndicator.title = `${data.message} (Last updated: ${formatTimestamp(data.timestamp)})`;
        })
        .catch(error => {
            console.error('Error fetching API status:', error);
            const statusIndicator = document.getElementById('api-status-indicator');
            statusIndicator.textContent = 'ERROR';
            statusIndicator.className = 'status-error';
            statusIndicator.title = 'Error fetching API status';
        });
}

/**
 * Format a UNIX timestamp into a readable date and time
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

/**
 * Check client details using the API
 */
function checkClientDetails() {
    const idNumber = document.getElementById('id-number-input').value.trim();
    const resultsArea = document.getElementById('results-area');
    
    // Basic validation
    if (!idNumber) {
        displayMessage('Please enter an ID number', 'error');
        return;
    }
    
    if (!idNumber.match(/^\d+$/)) {
        displayMessage('ID number should contain only digits', 'error');
        return;
    }
    
    // Display loading message
    resultsArea.innerHTML = '<div class="loading">Loading client details...</div>';
    
    // Call the API
    fetch('/api/check-client', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_number: idNumber })
    })
    .then(response => {
        if (!response.ok && response.status !== 200) {
            // Handle HTTP errors
            let errorMessage = 'Server error occurred';
            
            if (response.status === 400) {
                errorMessage = 'Invalid ID number format';
            } else if (response.status === 429) {
                errorMessage = 'Too many requests. Please try again later.';
            } else if (response.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }
            
            throw new Error(errorMessage);
        }
        
        return response.json();
    })
    .then(data => {
        // Handle different response types
        if (data.status === 'success') {
            displayResults(data.data);
        } else if (data.status === 'not_found') {
            displayMessage(data.message, 'not-found');
        } else if (data.status === 'error') {
            displayMessage(data.message, 'error');
        } else {
            displayMessage('Unexpected response from server', 'error');
        }
    })
    .catch(error => {
        displayMessage(error.message, 'error');
        console.error('Error:', error);
    })
    .finally(() => {
        // Update API status after the request
        updateApiStatus();
    });
}

/**
 * Display client results in the results area
 */
function displayResults(clientData) {
    const resultsArea = document.getElementById('results-area');
    
    let html = `
        <div class="client-data">
            <div class="client-info">
                <h3>Client Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Full Name</span>
                        <span class="info-value">${escapeHtml(clientData.full_name)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">ID Number</span>
                        <span class="info-value">${escapeHtml(clientData.id_number)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Member Number</span>
                        <span class="info-value">${escapeHtml(clientData.member_number)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value">${escapeHtml(clientData.status)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email</span>
                        <span class="info-value">${escapeHtml(clientData.email)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cell Number</span>
                        <span class="info-value">${escapeHtml(clientData.contact_cell)}</span>
                    </div>
                </div>
            </div>
    `;
    
    // Add subscriptions section if there are any
    if (clientData.subscriptions && clientData.subscriptions.length > 0) {
        html += `
            <div class="subscriptions-section">
                <h3>Subscriptions</h3>
        `;
        
        clientData.subscriptions.forEach(subscription => {
            // Determine status class
            let statusClass = 'status-pending';
            if (subscription.sub_status.toLowerCase() === 'active') {
                statusClass = 'status-active';
            } else if (subscription.sub_status.toLowerCase() === 'inactive') {
                statusClass = 'status-inactive';
            }
            
            html += `
                <div class="subscription">
                    <div class="subscription-header">
                        <span class="subscription-status ${statusClass}">${escapeHtml(subscription.sub_status)}</span>
                    </div>
                    <div class="subscription-dates">
                        <div>
                            <strong>Start Date:</strong> ${escapeHtml(subscription.sub_start_date)}
                        </div>
                        <div>
                            <strong>End Date:</strong> ${escapeHtml(subscription.sub_end_date)}
                        </div>
                    </div>
            `;
            
            // Add products if there are any
            if (subscription.products && subscription.products.length > 0) {
                html += `
                    <div class="products-list">
                        <h4>Products</h4>
                `;
                
                subscription.products.forEach(product => {
                    html += `
                        <div class="product">
                            <span class="product-name">${escapeHtml(product.product_name)}</span>
                            <span class="product-amount">${escapeHtml(product.product_amount_formatted)}</span>
                        </div>
                    `;
                });
                
                html += `</div>`;
            }
            
            html += `</div>`;
        });
        
        html += `</div>`;
    }
    
    html += `</div>`;
    
    resultsArea.innerHTML = html;
}

/**
 * Display a message in the results area
 */
function displayMessage(message, type) {
    const resultsArea = document.getElementById('results-area');
    
    let className = '';
    if (type === 'error') {
        className = 'error-message';
    } else if (type === 'not-found') {
        className = 'not-found-message';
    }
    
    resultsArea.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
        return '';
    }
    
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
