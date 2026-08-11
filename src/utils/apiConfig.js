// Central API Base URL Configuration for Smart Idol System
export const getApiBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  // If Vite dev server on port 5173
  if (window.location.port === '5173') {
    return `http://${window.location.hostname}:3001`;
  }
  // Production server (Render or Direct Express)
  return window.location.origin;
};
