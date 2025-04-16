// API service for SwitchTransact API

// NOTE: Due to CORS restrictions, we're using a mock implementation
// In a production environment, you would need to:
// 1. Set up a backend proxy server
// 2. Request CORS headers to be added to the API
// 3. Use a CORS proxy service

// Original API URL (commented out due to CORS issues)
// const API_BASE_URL = 'https://app.switchtransact.com/api/1.0';
// const API_KEY = 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b';

// Mock data flag - set to true to use mock data instead of real API
const USE_MOCK_DATA = true;

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
    // In a real app with a proper backend proxy, you would call your proxy endpoint
    // For now, this code is unreachable due to USE_MOCK_DATA = true
    const response = await fetch('/api/status');
    const data = await response.json();

    return {
      status: data.status,
      message: data.message,
      timestamp: data.timestamp || Math.floor(Date.now() / 1000)
    };
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
    // In a real app with a proper backend proxy, you would call your proxy endpoint
    // For now, this code is unreachable due to USE_MOCK_DATA = true
    const response = await fetch('/api/client-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
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
