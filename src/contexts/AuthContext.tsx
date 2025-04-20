import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';
import { api } from '@/services/api';

// Mock user data for our frontend implementation
interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  photoURL?: string;
}

interface ProfileUpdateData {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error);
    const message = error.response?.data?.message || error.message;
    
    if (error.response?.status === 401) {
      toast.error('Invalid email or password');
    } else if (error.response?.status === 409) {
      toast.error('Email already exists');
    } else if (error.response?.status === 400) {
      toast.error(message || 'Invalid input data');
    } else {
      toast.error('An error occurred. Please try again later.');
    }
    throw error;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Welcome back!');
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(username, email, password);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Account created successfully! Welcome to NIELIT Alumni Network.');
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      throw new Error('User not authenticated');
    }

    try {
      const response = await api.put('/users/profile', data);
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.put('/users/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    updateProfile,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
