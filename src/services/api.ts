// API service for SwitchTransact API
import { getDefaultProduct, getProductById, ProductConfig, API_CONFIG } from '../config/api-config';
import { logError, getErrorMessage, safeJsonParse, safeGet } from '../utils/errorHandler';

// API base URL - using local proxy to avoid CORS issues
const API_BASE_URL = '/api';

// Mock data flag - set to false to use real API instead of mock data
const USE_MOCK_DATA = false;

// Current product configuration - initialize with DearSA
let currentProduct: ProductConfig = getDefaultProduct();

// Ensure DearSA is set as the default product
try {
  const dearSaProduct = getProductById('dear-sa');
  if (dearSaProduct && dearSaProduct.apiKey) {
    currentProduct = dearSaProduct;
    console.log('Initialized with DearSA product configuration');
  }
} catch (error) {
  logError(error, 'API Initialization');
  console.warn('Failed to initialize with DearSA product, using default product instead');
}

/**
 * Set the current product configuration
 */
export const setCurrentProduct = (productId: string): ProductConfig => {
  currentProduct = getProductById(productId);
  return currentProduct;
};

/**
 * Get the current product configuration
 */
export const getCurrentProduct = (): ProductConfig => {
  return currentProduct;
};

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

interface ApiError {
  status: 'error';
  message: string;
  code?: number;
}

const handleApiError = async (response: Response): Promise<ApiError> => {
  let errorMessage = `API error: ${response.status}`;

  try {
    const errorData = await response.text();
    const errorJson = JSON.parse(errorData);
    errorMessage = errorJson.message || errorMessage;
  } catch (e) {
    // Use default error message if parsing fails
  }

  return {
    status: 'error',
    message: errorMessage,
    code: response.status
  };
};

/**
 * Get the current status of the API
 */
export const getApiStatus = async (): Promise<ApiStatusResponse> => {
  const timestamp = Math.floor(Date.now() / 1000);

  // If using mock data, return a simulated successful response
  if (USE_MOCK_DATA) {
    console.log('Using mock data for API status check');
    return {
      status: 'OK',
      message: 'API is responding normally (simulated)',
      timestamp
    };
  }

  // Check if the current product has an API key
  if (!currentProduct.apiKey) {
    const message = `No API key configured for ${currentProduct.name}. Please select DearSA.`;
    console.warn(message);
    return {
      status: 'ERROR',
      message,
      timestamp
    };
  }

  try {
    // Make a lightweight call to check API status
    console.log(`Checking API status for ${currentProduct.name} with URL: ${API_BASE_URL}/lookups?type=Bank`);

    // Add retry logic for network failures
    let retries = 2;
    let response;

    while (retries >= 0) {
      try {
        response = await fetch(`${API_BASE_URL}/lookups?type=Bank`, {
          method: 'GET',
          headers: createHeaders(currentProduct.apiKey),
          // Add a timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        break; // If successful, exit the retry loop
      } catch (fetchError) {
        if (retries === 0) throw fetchError; // If out of retries, rethrow
        console.warn(`API status check failed, retrying... (${retries} attempts left)`);
        retries--;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
      }
    }

    // If we get here without a response, something went wrong
    if (!response) {
      throw new Error('Failed to check API status after multiple attempts');
    }

    console.log(`API status response: ${response.status} ${response.statusText}`);

    if (response.ok) {
      // Try to parse the response to see if it's valid JSON
      try {
        const data = await response.clone().json();
        console.log('API status response data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        logError(parseError, 'API Status JSON Parse');
      }

      return {
        status: 'OK',
        message: 'API is responding normally',
        timestamp
      };
    } else {
      const message = `API returned status ${response.status} (${response.statusText})`;
      console.warn(message);

      // Try to get more details from the response body
      try {
        const errorData = await response.text();
        console.warn('API error details:', errorData);
      } catch (parseError) {
        logError(parseError, 'API Status Error Parse');
      }

      return {
        status: 'ERROR',
        message,
        timestamp
      };
    }
  } catch (error) {
    logError(error, 'API Status Check');
    return {
      status: 'ERROR',
      message: getErrorMessage(error),
      timestamp
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
    created_at: "2023-01-15T12:00:00Z",
    date_created: "2023-01-15",
    status: "active",
    is_active: true,
    total_successful_transactions: 18,
    total_failed_transactions: 2
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
    console.log('Using mock data for client details');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // For demo purposes, only return data for this specific ID
    if (request.id_number === "7608210157080") {
      return {
        status: 'success',
        data: MOCK_CLIENT_DATA
      };
    } else {
      // Return empty data for any other ID
      return {
        status: 'success',
        data: { record: null, subscriptions: [] }
      };
    }
  }

  // Check if the current product has an API key
  if (!currentProduct.apiKey) {
    const error = new Error(`No API key configured for ${currentProduct.name}. Please select DearSA.`);
    logError(error, 'Client Details Request');
    return {
      status: 'error',
      message: error.message
    };
  }

  try {
    // Call the API through our local proxy
    console.log(`Fetching client details for ${currentProduct.name}`);
    console.log('Request payload:', JSON.stringify(request, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Add retry logic for network failures
      let retries = 2;
      let response;

      while (retries >= 0) {
        try {
          response = await fetch(`${API_BASE_URL}/workflow/people/details`, {
            method: 'POST',
            headers: createHeaders(currentProduct.apiKey),
            body: JSON.stringify(request),
            signal: controller.signal
          });
          break; // If successful, exit the retry loop
        } catch (fetchError) {
          if (retries === 0) throw fetchError; // If out of retries, rethrow
          console.warn(`Fetch attempt failed, retrying... (${retries} attempts left)`);
          retries--;
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
        }
      }

      // If we get here without a response, something went wrong
      if (!response) {
        throw new Error('Failed to fetch after multiple attempts');
      }

      clearTimeout(timeoutId);

      console.log(`Client details response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // Try to get more details from the response body
        let errorMessage = `API error: ${response.status} (${response.statusText})`;
        try {
          const errorData = await response.text();
          console.warn('API error details:', errorData);

          // Try to parse as JSON if possible
          try {
            const errorJson = JSON.parse(errorData);
            if (errorJson.message) {
              errorMessage = errorJson.message;
            }
          } catch (jsonError) {
            // Not JSON, use the text as is
          }
        } catch (textError) {
          logError(textError, 'Client Details Error Text');
        }

        return {
          status: 'error',
          message: errorMessage
        };
      }

      // Safely parse the JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
        data = safeJsonParse(responseText, {});
      } catch (parseError) {
        logError(parseError, 'Client Details JSON Parse');
        return {
          status: 'error',
          message: 'Failed to parse API response'
        };
      }

      // Check if the response is wrapped in a data property
      if (data && typeof data === 'object') {
        // If data has a status property indicating an error
        if ('status' in data && data.status === 'error') {
          const message = safeGet(data, 'message', 'Unknown API error');
          console.error('API returned an error:', message);
          return {
            status: 'error',
            message
          };
        }

        // If data has a data property, it might be wrapped
        if ('data' in data && data.data) {
          console.log('API response is wrapped in a data property, unwrapping...');
          return {
            status: 'success',
            data: data.data
          };
        }

        // Otherwise use the data as is
        return {
          status: 'success',
          data
        };
      }

      // Fallback for unexpected response format
      console.warn('Unexpected API response format:', typeof data);
      return {
        status: 'success',
        data
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Re-throw to be caught by the outer try-catch
    }
  } catch (error) {
    logError(error, 'Client Details Request');

    // Check for abort error (timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        status: 'error',
        message: 'Request timed out. Please try again.'
      };
    }

    return {
      status: 'error',
      message: getErrorMessage(error)
    };
  }
};

// Standardize headers creation
const createHeaders = (apiKey: string) => ({
  'Authorization': apiKey, // Send API key directly without Bearer prefix
  'Content-Type': 'application/json'
});

const fetchWithRetry = async (url: string, options: RequestInit, retries = 2): Promise<Response> => {
  try {
    return await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
    });
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
    return fetchWithRetry(url, options, retries - 1);
  }
};

/**
 * Default export of all API functions
 */
export default {
  getApiStatus,
  getClientDetails,
  setCurrentProduct,
  getCurrentProduct
};
