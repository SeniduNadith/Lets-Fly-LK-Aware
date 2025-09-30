import { useState, useEffect } from 'react';
import { 
  reportsAPI, 
  factsAPI, 
  DashboardStats,
  ApiResponse 
} from '../services/api';

export interface DashboardData {
  stats: DashboardStats | null;
  dailyTip: string | null;
  loading: boolean;
  error: string | null;
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    dailyTip: null,
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch dashboard statistics
      const statsResponse = await reportsAPI.getDashboardStats();
      
      // Fetch daily security tip
      const tipResponse = await factsAPI.getRandom();
      
      setData({
        stats: statsResponse.data,
        dailyTip: tipResponse.data?.fact || 'Always use strong, unique passwords for each account.',
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data. Please try again.'
      }));
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    ...data,
    refreshData
  };
};
