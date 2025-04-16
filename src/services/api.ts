// API service for SwitchTransact API

// API base URL - using local proxy to avoid CORS issues
const API_BASE_URL = '/api';

// API key
const API_KEY = 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b';

// Mock data flag - set to false to use real API
const USE_MOCK_DATA = false;

// Interface for client details request
interface ClientDetailsRequest {
  id_number: string;
  record?: boolean;
  subscriptions?: boolean;
  bank_accounts?: boolean;
  transactions?: boolean;
}

// API status response
interface ApiStatusResponse {
  status: 'OK' | 'ERROR' | 'UNKNOWN';
  message: string;
  timestamp?: number;
}

/**
 * Get the current status of the API
 */
export const getApiStatus = async (): Promise<ApiStatusResponse> => {
  // If using mock data, return a simulated successful response
  if (USE_MOCK_DATA) {
    return {
      status: 'OK',
      message: 'API is responding normally (simulated)',
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  try {
    // Make a lightweight call to check API status
    console.log('Checking API status with URL:', `${API_BASE_URL}/lookups?type=Bank`);
    console.log('Using API key:', API_KEY);

    const response = await fetch(`${API_BASE_URL}/lookups?type=Bank`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('API status response:', response.status, response.statusText);

    if (response.ok) {
      // Try to parse the response to see if it's valid JSON
      try {
        const data = await response.clone().json();
        console.log('API status response data:', data);
      } catch (parseError) {
        console.error('Failed to parse API status response:', parseError);
      }

      return {
        status: 'OK',
        message: 'API is responding normally',
        timestamp: Math.floor(Date.now() / 1000)
      };
    } else {
      return {
        status: 'ERROR',
        message: `API returned status ${response.status}`,
        timestamp: Math.floor(Date.now() / 1000)
      };
    }
  } catch (error) {
    console.error('API status check failed:', error);
    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Math.floor(Date.now() / 1000)
    };
  }
};

// Mock client data for demonstration purposes
const MOCK_CLIENT_DATA = {
  record: {
    id: 12345,
    id_number: "7608210157080",
    name: "John",
    surname: "Doe",
    contact_cell: "0821234567",
    email: "john.doe@example.com",
    date_created: "2023-01-15",
    status: "active"
  },
  subscriptions: [
    {
      id: 98765,
      date_start: "2023-02-01",
      status: "active",
      products: [
        {
          id: 111,
          name: "Basic Plan",
          amount: 19900,
          description: "Basic subscription plan"
        },
        {
          id: 112,
          name: "Premium Add-on",
          amount: 9900,
          description: "Premium features add-on"
        }
      ]
    }
  ]
};

/**
 * Get client details by ID number
 */
export const getClientDetails = async (request: ClientDetailsRequest) => {
  // If using mock data, return simulated data after a short delay
  if (USE_MOCK_DATA) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For demo purposes, only return data for this specific ID
    if (request.id_number === "7608210157080") {
      return MOCK_CLIENT_DATA;
    } else {
      // Return empty data for any other ID
      return { record: null, subscriptions: [] };
    }
  }

  try {
    // Call the API through our local proxy
    console.log('Fetching client details with URL:', `${API_BASE_URL}/workflow/people/details`);
    console.log('Request payload:', JSON.stringify(request, null, 2));

    const response = await fetch(`${API_BASE_URL}/workflow/people/details`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    console.log('Client details response:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Client details response data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Failed to fetch client details:', error);
    throw error;
  }
};

/**
 * Default export of all API functions
 */
export default {
  getApiStatus,
  getClientDetails
};
