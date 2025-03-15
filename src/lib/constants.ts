// Try to use environment variable if available, otherwise fallback to the provided URL
export const BACKEND = "http://localhost:8000";

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: `${BACKEND}/upload`,
  STATUS: `${BACKEND}/status`,
};
