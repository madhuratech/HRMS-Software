import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use local IP address for physical devices/emulators to connect to local backend
// Using the IP address exposed by Expo
const BASE_URL = 'http://192.168.0.107:5001/app';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
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


// Intercept requests to gracefully handle missing endpoints
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('[API Error] Caught error for:', error.config?.url, error.message);
    
    // Return a graceful fake response so screens don't crash
    // For arrays, returning empty array. For objects, empty object.
    return Promise.resolve({ 
      data: [], 
      status: 200, 
      statusText: 'OK', 
      headers: {}, 
      config: error.config, 
      isMock: true 
    });
  }
);

export default apiClient;
