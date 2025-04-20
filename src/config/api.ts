const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  baseURL: isDevelopment 
    ? 'http://localhost:5000/api'
    : 'https://alumni-7bn6.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'NIELIT Alumni Network',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'Connect with fellow NIELIT alumni',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'nielitalumnicalicut@gmail.com'
}; 