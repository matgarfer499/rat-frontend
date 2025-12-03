/**
 * Helper for fetch requests with common headers
 * Includes ngrok-skip-browser-warning to bypass ngrok's warning page
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Common headers for all API requests
 */
export function getApiHeaders(contentType?: string, authToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'ngrok-skip-browser-warning': 'true',
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

/**
 * Fetch wrapper with common headers
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    ...getApiHeaders(),
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}
