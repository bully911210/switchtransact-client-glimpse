/**
 * Error handling utility functions
 */

/**
 * Log an error to the console with additional context
 */
export const logError = (error: unknown, context?: string): void => {
  const timestamp = new Date().toISOString();
  const contextPrefix = context ? `[${context}] ` : '';
  
  if (error instanceof Error) {
    console.error(`${timestamp} ${contextPrefix}Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  } else {
    console.error(`${timestamp} ${contextPrefix}Unknown error:`, error);
  }
};

/**
 * Get a user-friendly error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  return 'An unknown error occurred';
};

/**
 * Safe JSON parsing with error handling
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError(error, 'JSON Parse');
    return fallback;
  }
};

/**
 * Safely access nested properties in an object
 */
export const safeGet = <T>(obj: any, path: string, fallback: T): T => {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) {
        return fallback;
      }
      result = result[key];
    }
    
    return (result === undefined || result === null) ? fallback : result as T;
  } catch (error) {
    logError(error, 'Safe Get');
    return fallback;
  }
};

export default {
  logError,
  getErrorMessage,
  safeJsonParse,
  safeGet
};
