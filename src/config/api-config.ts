// API Configuration for different products

export interface ProductConfig {
  id: string;
  name: string;
  apiKey: string;
  description?: string;
}

// Product configurations with their respective API keys
export const PRODUCTS: ProductConfig[] = [
  {
    id: 'dear-sa',
    name: 'DearSA',
    apiKey: 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b', // This is the DearSA API key
    description: 'DearSA product configuration'
  },
  {
    id: 'tlu-sa',
    name: 'TLU SA',
    apiKey: '', // TLU SA API key not available yet
    description: 'TLU SA product configuration (API key not configured)'
  },
  {
    id: 'free-sa',
    name: 'FreeSA',
    apiKey: '', // FreeSA API key not available yet
    description: 'FreeSA product configuration (API key not configured)'
  }
];

// Get default product (always returns DearSA)
export const getDefaultProduct = (): ProductConfig => {
  // Find the DearSA product
  const dearSaProduct = PRODUCTS.find(p => p.id === 'dear-sa');
  // Return DearSA or the first product if DearSA is not found
  return dearSaProduct || PRODUCTS[0];
};

// Get product by ID
export const getProductById = (id: string): ProductConfig => {
  const product = PRODUCTS.find(p => p.id === id);
  return product || getDefaultProduct();
};

export const API_CONFIG = {
  BASE_URL: 'https://app.switchtransact.com/api/1.0',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000, // 1 second
};

