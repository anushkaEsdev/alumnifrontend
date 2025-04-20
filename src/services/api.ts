import axios, { AxiosError, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api';
import { toast } from 'react-hot-toast';

// Create API instance
export const api = axios.create(API_CONFIG);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle specific error cases
    const errorMessage = error.response.data?.message || 'An error occurred';
    switch (error.response.status) {
      case 400:
        toast.error(errorMessage);
        break;
      case 403:
        toast.error('You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Resource not found');
        break;
      case 500:
        toast.error('Server error. Please try again later');
        break;
      default:
        toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.put('/auth/password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Posts API
export const postsAPI = {
  getAll: async (type?: string) => {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (data: {
    title: string;
    content: string;
    type: 'blog' | 'interview' | 'meeting';
    meetingDate?: string;
    meetingTime?: string;
  }) => {
    try {
      const response = await api.post('/posts', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await api.put(`/posts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  like: async (id: string) => {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  unlike: async (id: string) => {
    try {
      const response = await api.delete(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addComment: async (id: string, content: string) => {
    try {
      const response = await api.post(`/posts/${id}/comments`, { content });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (postId: string, commentId: string) => {
    try {
      const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateComment: async (postId: string, commentId: string, content: string) => {
    try {
      const response = await api.put(`/posts/${postId}/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Questions API
export const questionsAPI = {
  getAll: () => postsAPI.getAll('interview'),
  getById: (id: string) => postsAPI.getById(id),
  create: (data: any) => postsAPI.create({ ...data, type: 'interview' }),
  update: (id: string, data: any) => postsAPI.update(id, { ...data, type: 'interview' }),
  delete: (id: string) => postsAPI.delete(id),
  addComment: (id: string, content: string) => postsAPI.addComment(id, content)
};

// Events API
export const eventsAPI = {
  getAll: () => postsAPI.getAll('meeting'),
  getById: (id: string) => postsAPI.getById(id),
  create: (data: any) => postsAPI.create({ ...data, type: 'meeting' }),
  update: (id: string, data: any) => postsAPI.update(id, { ...data, type: 'meeting' }),
  delete: (id: string) => postsAPI.delete(id),
  addComment: (id: string, content: string) => postsAPI.addComment(id, content)
}; 