import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Platform, ToastAndroid, Alert } from 'react-native';
import io from 'socket.io-client';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

import apiClient from '../api/client';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessionAndUsers();
  }, []);

  // Set up Socket.IO listener when user is logged in
  useEffect(() => {
    let socket;
    if (user && user.id) {
      // Connect to the socket server
      socket = io('http://192.168.0.107:5001');
      
      socket.on('connect', () => {
        console.log('Socket connected, joining room user_' + user.id);
        socket.emit('join', user.id);
      });

      socket.on('task_assigned', (data) => {
        console.log('Received real-time event:', data);
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            data.message || 'New task assigned!',
            ToastAndroid.LONG,
            ToastAndroid.TOP
          );
        } else {
          Alert.alert('Notification', data.message || 'New task assigned!');
        }
      });
      
      socket.on('data_updated', (data) => {
        console.log('Received data update event:', data);
        if (Platform.OS === 'android') {
          ToastAndroid.showWithGravity(
            data.message || 'Data updated successfully!',
            ToastAndroid.SHORT,
            ToastAndroid.TOP
          );
        } else {
          Alert.alert('Update', data.message || 'Data updated successfully!');
        }
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

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
      // If API returns mocked empty array due to interceptor, treat as failure
      if (Array.isArray(response.data) && response.isMock) {
        throw new Error('Network Error: Using local fallback');
      }
      const { user, token } = response.data;
      
      setUser(user);
      await AsyncStorage.setItem('@logged_in_user', JSON.stringify(user));
      await AsyncStorage.setItem('@auth_token', token);
      
      return user;
    } catch (e) {
      console.log('API login failed, attempting local login fallback...', e.message);
      // Fallback to local users
      const storedUsers = await AsyncStorage.getItem('@local_users');
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];
      const foundUser = usersList.find(u => u.email === credentials.email && u.password === credentials.password);
      
      if (foundUser) {
        setUser(foundUser);
        await AsyncStorage.setItem('@logged_in_user', JSON.stringify(foundUser));
        await AsyncStorage.setItem('@auth_token', 'mock_local_token');
        return foundUser;
      }
      
      // If not found, and it's admin@example.com (default), let them in anyway
      if (credentials.email === 'admin@example.com') {
        const adminUser = { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Super Admin' };
        setUser(adminUser);
        await AsyncStorage.setItem('@logged_in_user', JSON.stringify(adminUser));
        await AsyncStorage.setItem('@auth_token', 'mock_admin_token');
        return adminUser;
      }

      throw new Error('Invalid email or password');
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
      if (Array.isArray(response.data) && response.isMock) {
        throw new Error('Network Error: Using local fallback');
      }
      return response.data;
    } catch (e) {
      console.log('API register failed, using local storage fallback...', e.message);
      const storedUsers = await AsyncStorage.getItem('@local_users');
      const usersList = storedUsers ? JSON.parse(storedUsers) : [];
      
      const newUser = {
        id: Date.now(),
        ...newUserData,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      usersList.push(newUser);
      await AsyncStorage.setItem('@local_users', JSON.stringify(usersList));
      return { success: true, user: newUser };
    }
  };

  const getRegisteredUsers = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('@local_users');
      return storedUsers ? JSON.parse(storedUsers) : [];
    } catch (e) {
      return [];
    }
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

