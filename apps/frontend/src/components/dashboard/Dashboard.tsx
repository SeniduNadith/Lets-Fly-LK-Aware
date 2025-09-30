import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  BookOpen, 
  Gamepad2, 
  FileText, 
  Trophy, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleDescription = () => {
    switch (user.role) {
      case 'admin':
        return 'System Administrator with full access to manage users, policies, and system settings.';
      case 'security_staff':
        return 'Security team member responsible for monitoring, incident response, and threat detection.';
      case 'accounting':
        return 'Accounting staff focused on financial data protection and fraud prevention.';
      case 'marketing_customer_care':
        return 'Marketing and customer service staff handling customer data and communications.';
      case 'developer':
        return 'Software developer implementing secure coding practices and vulnerability management.';
      case 'design_content':
        return 'Design and content creation team protecting intellectual property and creative assets.';
      default:
        return 'Welcome to your security awareness dashboard.';
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'admin':
        return 'from-red-500 to-pink-500';
      case 'security_staff':
        return 'from-blue-500 to-cyan-500';
      case 'accounting':
        return 'from-green-500 to-emerald-500';
      case 'marketing_customer_care':
        return 'from-purple-500 to-indigo-500';
      case 'developer':
        return 'from-orange-500 to-yellow-500';
      case 'design_content':
        return 'from-pink-500 to-rose-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getQuickActions = () => {
    const baseActions = [
      { icon: BookOpen, label: 'View Policies', href: '/policies', color: 'bg-blue-500' },
      { icon: Gamepad2, label: 'Play Games', href: '/games', color: 'bg-green-500' },
      { icon: FileText, label: 'Take Quizzes', href: '/quizzes', color: 'bg-purple-500' },
    ];

    // Add role-specific actions
    if (user.role === 'admin') {
      baseActions.push(
        { icon: Shield, label: 'User Management', href: '/admin/users', color: 'bg-red-500' },
        { icon: TrendingUp, label: 'Analytics', href: '/admin/analytics', color: 'bg-indigo-500' }
      );
    }

    return baseActions;
  };

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
          <div className={`bg-gradient-to-r ${getRoleColor()} rounded-2xl p-8 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user.first_name}!
                </h1>
                <p className="text-xl opacity-90">
                  {getRoleDescription()}
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm opacity-80">
                  <span className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    {user.role.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2" />
                    {user.department}
                  </span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="text-right">
                  <div className="text-6xl font-bold opacity-20">🔒</div>
                </div>
              </div>
            </div>
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
            {getQuickActions().map((action, index) => (
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

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Policies Read</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quizzes Completed</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Games Played</p>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                </div>
                <Gamepad2 className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Completed "Phishing Awareness" quiz</span>
                  <span className="text-sm text-gray-400 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Acknowledged "Data Protection Policy"</span>
                  <span className="text-sm text-gray-400 ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Played "Password Strength Challenge"</span>
                  <span className="text-sm text-gray-400 ml-auto">2 days ago</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">Started "Secure Coding Basics" module</span>
                  <span className="text-sm text-gray-400 ml-auto">3 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Tips</h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  Today's Security Tip
                </h3>
                <p className="text-amber-700">
                  Always verify the sender's email address before clicking on links or downloading attachments. 
                  Phishing emails often use similar-looking addresses to trick you.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
