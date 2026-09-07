import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Live production backend URL on Render
export const BASE_URL = 'https://madhura-hrm.onrender.com/app';
export const SOCKET_URL = 'https://madhura-hrm.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s timeout to accommodate cloud hosting cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('[API Error] Caught error for:', error.config?.url, error.message);
    
    // Return a graceful response so screens don't crash
    return Promise.reject(error);
  }
);

export default apiClient;
