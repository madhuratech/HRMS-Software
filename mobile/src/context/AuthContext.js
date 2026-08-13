import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

import apiClient from '../api/client';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionAndUsers();
  }, []);

  const loadSessionAndUsers = async () => {
    try {
      const storedSession = await AsyncStorage.getItem('@logged_in_user');
      const storedToken = await AsyncStorage.getItem('@auth_token');
      
      if (storedSession && storedToken) {
        setUser(JSON.parse(storedSession));
      }
    } catch (e) {
      console.error('Failed to load session', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      setUser(user);
      await AsyncStorage.setItem('@logged_in_user', JSON.stringify(user));
      await AsyncStorage.setItem('@auth_token', token);
      
      return user;
    } catch (e) {
      console.error('Failed to login via backend', e.response?.data || e.message);
      throw new Error(e.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem('@logged_in_user');
      await AsyncStorage.removeItem('@auth_token');
    } catch (e) {
      console.error('Failed to clear user session', e);
    }
  };

  const registerUser = async (newUserData) => {
    try {
      const response = await apiClient.post('/auth/register', newUserData);
      return response.data;
    } catch (e) {
      console.error('Failed to register user', e.response?.data || e.message);
      throw new Error(e.response?.data?.message || 'Registration failed');
    }
  };

  const getRegisteredUsers = async () => {
    return []; // Deprecated, we no longer store fake users locally
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser, getRegisteredUsers }}>
      {children}
    </AuthContext.Provider>
  );
};

