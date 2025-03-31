// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        // Configure axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token is valid by fetching user profile
        const response = await axios.get(`${BASE_URL}/api/users/profile`);
        
        if (response.data.success) {
          setCurrentUser(response.data.data);
        } else {
          // Token invalid - remove it
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        // Token invalid - remove it
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        username,
        password
      });
      
      if (response.data.success) {
        const { token, ...userData } = response.data.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update user state
        setCurrentUser(userData);
        
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${BASE_URL}/api/users/register`, userData);
      
      if (response.data.success) {
        const { token, ...newUserData } = response.data.data;
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update user state
        setCurrentUser(newUserData);
        
        return true;
      } else {
        setError(response.data.message || 'Registration failed');
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Update user state
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${BASE_URL}/api/users/profile`, profileData);
      
      if (response.data.success) {
        // Update current user with new profile data
        setCurrentUser(prevUser => ({
          ...prevUser,
          ...response.data.data
        }));
        
        return true;
      } else {
        setError(response.data.message || 'Profile update failed');
        return false;
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'An error occurred during profile update');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!currentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};