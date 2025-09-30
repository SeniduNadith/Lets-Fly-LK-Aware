import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: number;
  role: string;
  role_name?: string;
  department: string;
  is_active: boolean;
  mfa_enabled: boolean;
  last_login?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, mfaToken?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/auth/profile');
          setUser(response.data.user);
        } else {
          // Development mode: Set a demo user if no token exists
          const isDevelopment = process.env.NODE_ENV === 'development';
          if (isDevelopment) {
            setUser({
              id: 1,
              username: 'demo',
              email: 'demo@letsflylk.com',
              first_name: 'Demo',
              last_name: 'User',
              role_id: 1,
              role: 'enduser',
              role_name: 'End User',
              department: 'IT',
              is_active: true,
              mfa_enabled: false,
              last_login: new Date().toISOString(),
              created_at: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        
        // Development mode: Set a demo user even if auth fails
        const isDevelopment = process.env.NODE_ENV === 'development';
        if (isDevelopment) {
          setUser({
            id: 1,
            username: 'demo',
            email: 'demo@letsflylk.com',
            first_name: 'Demo',
            last_name: 'User',
            role_id: 1,
            role: 'enduser',
            role_name: 'End User',
            department: 'IT',
            is_active: true,
            mfa_enabled: false,
            last_login: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, mfaToken?: string): Promise<void> => {
    try {
      setIsLoading(true);
      const requestData: any = {
        username,
        password
      };
      
      if (mfaToken) {
        requestData.mfaToken = mfaToken;
      }
      
      const response = await axios.post('/api/auth/login', requestData);

      const { token, user: userData } = response.data;
      
      // Store token and set default header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const response = await axios.put('/api/auth/profile', data);
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      throw new Error(error.response?.data?.error || 'Profile update failed');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      console.error('Password change failed:', error);
      throw new Error(error.response?.data?.error || 'Password change failed');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
