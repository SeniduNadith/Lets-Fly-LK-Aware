import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

// Auth interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
    department: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
}

// Policy interfaces
export interface Policy {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

// Quiz interfaces
export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  time_limit: number;
  passing_score: number;
  questions_count: number;
}

// Game interfaces
export interface Game {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: number;
}

// Training interfaces
export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: number;
  prerequisites: string[];
  status: string;
}

// Dashboard stats interface
export interface DashboardStats {
  total_policies: number;
  total_quizzes: number;
  total_games: number;
  total_training_modules: number;
  user_progress: {
    policies_acknowledged: number;
    quizzes_completed: number;
    games_played: number;
    training_completed: number;
  };
}

// Auth API calls
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Policies API calls
export const policiesAPI = {
  getAll: async (filters?: any): Promise<ApiResponse<Policy[]>> => {
    const response = await api.get('/policies', { params: filters });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/policies/stats');
    return response.data;
  },
};

// Quizzes API calls
export const quizzesAPI = {
  getAll: async (filters?: any): Promise<ApiResponse<Quiz[]>> => {
    const response = await api.get('/quizzes', { params: filters });
    return response.data;
  },

  getResults: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/quizzes/results');
    return response.data;
  },
};

// Games API calls
export const gamesAPI = {
  getAll: async (filters?: any): Promise<ApiResponse<Game[]>> => {
    const response = await api.get('/games', { params: filters });
    return response.data;
  },

  getHistory: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/games/history');
    return response.data;
  },
};

// Training API calls
export const trainingAPI = {
  getAll: async (): Promise<ApiResponse<TrainingModule[]>> => {
    const response = await api.get('/training');
    return response.data;
  },

  getProgress: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/training/progress');
    return response.data;
  },
};

// Reports API calls
export const reportsAPI = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },
};

// Facts API calls
export const factsAPI = {
  getRandom: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/facts/random');
    return response.data;
  },
};

export default api;
