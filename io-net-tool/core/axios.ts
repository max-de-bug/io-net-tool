import axios from "axios";

// Use environment variable for API URL, fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 30000; // 30 second timeout for long operations

// Add request interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors but don't expose sensitive information
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error("Network Error: No response from server");
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
