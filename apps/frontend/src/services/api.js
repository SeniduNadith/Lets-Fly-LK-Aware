import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
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
  (response) => response,
  (error) => {
    // Backoff on 429 Too Many Requests
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers?.['retry-after'] || '1', 10);
      const delayMs = Math.min((isNaN(retryAfter) ? 1 : retryAfter) * 1000, 5000);
      return new Promise((resolve) => setTimeout(resolve, delayMs)).then(() => {
        return api.request(error.config);
      });
    }

    if (error.response?.status === 401) {
      // Token expired or invalid. Clear token, but do not hard-redirect to avoid SPA loops in demo mode.
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
};

// Policies API calls
export const policiesAPI = {
  getAll: async (filters) => {
    const response = await api.get('/policies', { params: filters });
    return response.data?.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/policies/${id}`);
    return response.data?.data || response.data;
  },

  create: async (policyData) => {
    const response = await api.post('/policies', policyData);
    return response.data?.data || response.data;
  },

  update: async (id, policyData) => {
    const response = await api.put(`/policies/${id}`, policyData);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/policies/${id}`);
    return response.data?.data || response.data;
  },

  acknowledge: async (id) => {
    const response = await api.post(`/policies/${id}/acknowledge`);
    return response.data?.data || response.data;
  },

  getStats: async () => {
    const response = await api.get('/policies/stats');
    return response.data?.data || response.data;
  },
};

// Quizzes API calls
export const quizzesAPI = {
  getAll: async (filters) => {
    const response = await api.get('/quizzes', { params: filters });
    return response.data?.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data?.data || response.data;
  },

  create: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data?.data || response.data;
  },

  update: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data?.data || response.data;
  },

  startQuiz: async (id) => {
    const response = await api.post(`/quizzes/${id}/start`);
    return response.data?.data || response.data;
  },

  submitQuiz: async (id, answers) => {
    const response = await api.post(`/quizzes/${id}/attempt`, { answers });
    return response.data?.data || response.data;
  },

  getResults: async (id) => {
    const response = await api.get(`/quizzes/${id}/results`);
    return response.data?.data || response.data;
  },

  clearIncompleteAttempts: async () => {
    const response = await api.delete('/quizzes/clear-incomplete');
    return response.data?.data || response.data;
  },
};

// Games API calls
export const gamesAPI = {
  getAll: async (filters) => {
    const response = await api.get('/games', { params: filters });
    return response.data?.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/games/${id}`);
    return response.data?.data || response.data;
  },

  create: async (gameData) => {
    const response = await api.post('/games', gameData);
    return response.data?.data || response.data;
  },

  update: async (id, gameData) => {
    const response = await api.put(`/games/${id}`, gameData);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/games/${id}`);
    return response.data?.data || response.data;
  },

  startGame: async (id) => {
    const response = await api.post(`/games/${id}/start`);
    return response.data?.data || response.data;
  },

  submitGame: async (id, gameData) => {
    const response = await api.post(`/games/${id}/attempt`, gameData);
    return response.data?.data || response.data;
  },

  getResults: async (id) => {
    const response = await api.get(`/games/${id}/results`);
    return response.data?.data || response.data;
  },

  getHistory: async () => {
    const response = await api.get('/games/history');
    return response.data?.data || response.data;
  },

  getLeaderboard: async (gameId) => {
    const response = await api.get(`/games/${gameId}/leaderboard`);
    return response.data?.data || response.data;
  },
};

// Training API calls
export const trainingAPI = {
  getAll: async () => {
    const response = await api.get('/training');
    return response.data?.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/training/${id}`);
    return response.data?.data || response.data;
  },

  create: async (trainingData) => {
    // Map frontend form fields to backend schema
    const payload = {
      title: trainingData.title,
      description: trainingData.description,
      category: trainingData.category,
      role_id: undefined, // backend defaults in dev
      content_type: 'interactive',
      content_url: trainingData.content || '',
      duration: trainingData.duration || 0,
      prerequisites: [],
    };
    const response = await api.post('/training', payload);
    return response.data?.data || response.data;
  },

  update: async (id, trainingData) => {
    const response = await api.put(`/training/${id}`, trainingData);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/training/${id}`);
    return response.data?.data || response.data;
  },

  startTraining: async (id) => {
    const response = await api.post(`/training/${id}/start`);
    return response.data?.data || response.data;
  },

  updateProgress: async (id, progressData) => {
    const response = await api.put(`/training/${id}/progress`, progressData);
    return response.data?.data || response.data;
  },

  completeTraining: async (id) => {
    const response = await api.post(`/training/${id}/complete`);
    return response.data?.data || response.data;
  },

  getProgress: async () => {
    const response = await api.get('/training/progress');
    return response.data?.data || response.data;
  },
};

// Reports API calls
export const reportsAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data?.data || response.data;
  },

  getComplianceReport: async (filters) => {
    const response = await api.get('/reports/compliance', { params: filters });
    return response.data?.data || response.data;
  },

  getTrainingProgressReport: async (filters) => {
    const response = await api.get('/reports/training-progress', { params: filters });
    return response.data?.data || response.data;
  },

  getQuizPerformanceReport: async (filters) => {
    const response = await api.get('/reports/quiz-performance', { params: filters });
    return response.data?.data || response.data;
  },

  getPolicyAcknowledgmentReport: async (filters) => {
    const response = await api.get('/reports/policy-acknowledgments', { params: filters });
    return response.data?.data || response.data;
  },

  exportReport: async (reportType, format, filters) => {
    const response = await api.post('/reports/export', {
      reportType,
      format,
      filters
    });
    return response.data?.data || response.data;
  },
};

// Facts API calls
export const factsAPI = {
  getAll: async (filters) => {
    const response = await api.get('/facts', { params: filters });
    return response.data?.data || response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/facts/${id}`);
    return response.data?.data || response.data;
  },

  create: async (factData) => {
    const response = await api.post('/facts', factData);
    return response.data?.data || response.data;
  },

  update: async (id, factData) => {
    const response = await api.put(`/facts/${id}`, factData);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/facts/${id}`);
    return response.data?.data || response.data;
  },

  getRandom: async () => {
    const response = await api.get('/facts/random');
    return response.data?.data || response.data;
  },

  getCategories: async () => {
    const response = await api.get('/facts/categories');
    return response.data?.data || response.data;
  },

  getByCategory: async (category) => {
    const response = await api.get(`/facts/category/${category}`);
    return response.data?.data || response.data;
  },
};

// Profile API calls
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data?.data || response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data?.data || response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/profile/password', passwordData);
    return response.data?.data || response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/profile/preferences');
    return response.data?.data || response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/profile/preferences', preferences);
    return response.data?.data || response.data;
  },

  getActivityHistory: async () => {
    const response = await api.get('/profile/activity');
    return response.data?.data || response.data;
  },

  toggleMFA: async () => {
    const response = await api.put('/profile/mfa');
    return response.data?.data || response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/profile/stats');
    return response.data?.data || response.data;
  },
};

export default api;
