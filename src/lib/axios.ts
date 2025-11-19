import axios from 'axios';
import { toast } from '@/hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base URL from environment variable
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Request interceptor for debugging
axiosInstance.interceptors.request.use(request => {
  console.log('Making request to:', (request.baseURL ?? '') + request.url);
  console.log('Request headers:', request.headers);
  return request;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Full response:', response);
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      errorMessage = error.response.data.message || 'Server error occurred';
      switch (error.response.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your data.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 409:
          errorMessage = 'This operation caused a conflict.';
          break;
        case 500:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        default:
          errorMessage = error.response.data.message || 'Server error occurred';
          break;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    }

    toast({
      title: "Error",
      description: errorMessage,
    });
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;
