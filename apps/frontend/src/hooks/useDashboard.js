import { useState, useEffect } from 'react';
import { reportsAPI, factsAPI } from '../services/api.js';
import { mockDashboardStats, mockDailyTip } from '../services/mockData.js';

export const useDashboard = () => {
  const [data, setData] = useState({
    stats: null,
    dailyTip: null,
    loading: true,
    error: null
  });

  const fetchDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // For now, use mock data while backend is being set up
      // TODO: Replace with real API calls when database is ready
      setTimeout(() => {
        setData({
          stats: mockDashboardStats,
          dailyTip: mockDailyTip,
          loading: false,
          error: null
        });
      }, 1000); // Simulate API delay
      
      // Uncomment these lines when backend is ready:
      // const statsResponse = await reportsAPI.getDashboardStats();
      // const tipResponse = await factsAPI.getRandom();
      // setData({
      //   stats: statsResponse.data,
      //   dailyTip: tipResponse.data?.fact || 'Always use strong, unique passwords for each account.',
      //   loading: false,
      //   error: null
      // });
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
