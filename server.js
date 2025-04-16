const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// API proxy endpoint
app.post('/api/client-details', async (req, res) => {
  try {
    console.log('Received request for client details:', req.body);

    // Extract the API key from the request
    const apiKey = req.headers.authorization;

    if (!apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'API key is required'
      });
    }

    // Forward the request to the SwitchTransact API
    const response = await axios({
      method: 'POST',
      url: 'https://app.switchtransact.com/api/1.0/workflow/people/details',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      data: req.body,
      timeout: 15000 // 15 second timeout
    });

    console.log('API response status:', response.status);

    // Return the API response
    return res.json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error.message);

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API error response:', error.response.status, error.response.data);
      return res.status(error.response.status).json({
        status: 'error',
        message: `API error: ${error.response.status}`,
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from API');
      return res.status(504).json({
        status: 'error',
        message: 'No response received from API'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
});

// API status check endpoint
app.get('/api/status', async (req, res) => {
  try {
    console.log('Checking API status');

    // Extract the API key from the request
    const apiKey = req.headers.authorization;

    if (!apiKey) {
      return res.status(400).json({
        status: 'error',
        message: 'API key is required'
      });
    }

    // Make a lightweight call to check API status
    const response = await axios({
      method: 'GET',
      url: 'https://app.switchtransact.com/api/1.0/lookups?type=Bank',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000 // 5 second timeout
    });

    return res.json({
      status: 'OK',
      message: 'API is responding normally'
    });
  } catch (error) {
    console.error('API status check failed:', error.message);

    return res.status(500).json({
      status: 'error',
      message: 'API status check failed'
    });
  }
});

// Serve the HTML file for the root route
app.get('/', (req, res) => {
  console.log('Serving simple-client.html');
  res.sendFile(path.join(__dirname, 'simple-client.html'));
});

// Fallback route
app.get('*', (req, res) => {
  console.log('Fallback route accessed:', req.path);
  res.sendFile(path.join(__dirname, 'simple-client.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
