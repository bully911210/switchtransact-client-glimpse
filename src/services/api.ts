// API service for SwitchTransact API

// API base URL
const API_BASE_URL = 'https://app.switchtransact.com/api/1.0';

// API key
const API_KEY = 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b';

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
  try {
    // In a real app, we would make a lightweight call to check API status
    // For now, we'll simulate this with a simple fetch to the API
    const response = await fetch(`${API_BASE_URL}/lookups?type=Bank`, {
      method: 'GET',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
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

/**
 * Get client details by ID number
 */
export const getClientDetails = async (request: ClientDetailsRequest) => {
  try {
    const response = await fetch(`${API_BASE_URL}/workflow/people/details`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
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
