import axios, { AxiosInstance, AxiosError } from 'axios';
import type { FlightSearchParams, FlightSearchResponse } from '@/interfaces/flight';

// Create Axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (optional, useful for debugging)
apiClient.interceptors.request.use(
  (config) => {
    // Can add auth tokens or other headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Search for flights using the API endpoint
 * @param params - Flight search parameters
 * @returns Promise with flight search results
 */
export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResponse> {
  try {
    const response = await apiClient.post<FlightSearchResponse>(
      '/api/flights/search',
      params
    );
    return response.data;
  } catch (error) {
    // Re-throw the error so it can be handled by the caller
    // The API route should handle fallback to mock data
    throw error;
  }
}

export default apiClient;
