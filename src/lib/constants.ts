
// Try to use environment variable if available, otherwise fallback to the provided URL
export const BACKEND = import.meta.env.VITE_BACKEND_URL || "https://ef6c-62-245-155-194.ngrok-free.app";

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD: `${BACKEND}/upload`,
  STATUS: `${BACKEND}/status`,
};
