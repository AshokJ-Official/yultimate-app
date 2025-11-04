'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.data || response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    const selectedPlatform = localStorage.getItem('selectedPlatform');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('platform');
    setUser(null);
    
    // Redirect based on platform
    if (selectedPlatform === 'coaching') {
      window.location.href = '/coaching/login';
    } else {
      window.location.href = '/login';
    }
  };

  // Role-based access control
  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    const rolePermissions = {
      tournament_director: ['read', 'write', 'delete', 'admin'],
      team_manager: ['read', 'write_team'],
      player: ['read_limited'],
      volunteer: ['read', 'write_field'],
      scoring_team: ['read', 'write', 'validate'],
      sponsor: ['read_public'],
      spectator: ['read_public', 'engage']
    };
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission) || userPermissions.includes('admin');
  };

  const getAccessLevel = () => {
    if (!user) return 0;
    
    const accessLevels = {
      spectator: 1,
      sponsor: 2,
      player: 3,
      volunteer: 4,
      team_manager: 5,
      scoring_team: 6,
      tournament_director: 7
    };
    
    return accessLevels[user.role] || 0;
  };

  const canAccess = (requiredLevel) => {
    return getAccessLevel() >= requiredLevel;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    hasPermission,
    getAccessLevel,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}