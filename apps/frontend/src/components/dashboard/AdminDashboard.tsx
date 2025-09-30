import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, BookOpen, FileText, BarChart2, Users, Settings, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const quickActions = [
    { icon: Users, label: 'Manage Users', href: '/admin/users', color: 'bg-blue-500' },
    { icon: BookOpen, label: 'Manage Policies', href: '/admin/policies', color: 'bg-green-500' },
    { icon: FileText, label: 'View Reports', href: '/admin/reports', color: 'bg-purple-500' },
    { icon: BarChart2, label: 'Analytics', href: '/admin/analytics', color: 'bg-indigo-500' },
    { icon: Settings, label: 'System Settings', href: '/admin/settings', color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-xl opacity-90">
              Welcome, {user.first_name}! You have full system access and administrative privileges.
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`${action.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer`}
              >
                <div className="flex items-center">
                  <action.icon className="h-8 w-8 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold">{action.label}</h3>
                    <p className="text-sm opacity-80">Click to access</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">1,243</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Policies</p>
                  <p className="text-2xl font-bold">28</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 rounded-full mr-4">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Alerts</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">New user registration: John Doe (johndoe@example.com)</span>
                  <span className="text-sm text-gray-400 ml-auto">10 min ago</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Updated "Data Protection Policy"</span>
                  <span className="text-sm text-gray-400 ml-auto">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-gray-600">Security alert: Multiple failed login attempts detected</span>
                  <span className="text-sm text-gray-400 ml-auto">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
