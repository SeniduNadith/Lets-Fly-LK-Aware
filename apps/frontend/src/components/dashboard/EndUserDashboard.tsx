import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, FileText, CheckCircle, Clock, AlertCircle, Award } from 'lucide-react';

const EndUserDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Sample data for training modules
  const trainingModules = [
    { 
      id: 1, 
      title: 'Phishing Awareness', 
      description: 'Learn how to identify and avoid phishing attempts',
      progress: 100,
      status: 'Completed',
      dueDate: '2023-10-15',
      badge: 'Security',
      icon: <ShieldCheck className="h-5 w-5 text-blue-500" />
    },
    { 
      id: 2, 
      title: 'Password Security', 
      description: 'Best practices for creating and managing secure passwords',
      progress: 75,
      status: 'In Progress',
      dueDate: '2023-10-20',
      badge: 'Security',
      icon: <KeyRound className="h-5 w-5 text-green-500" />
    },
    { 
      id: 3, 
      title: 'Data Protection', 
      description: 'Understanding and protecting sensitive information',
      progress: 25,
      status: 'Not Started',
      dueDate: '2023-10-25',
      badge: 'Compliance',
      icon: <ShieldAlert className="h-5 w-5 text-purple-500" />
    },
    { 
      id: 4, 
      title: 'Remote Work Security', 
      description: 'Staying secure while working remotely',
      progress: 0,
      status: 'Not Started',
      dueDate: '2023-10-30',
      badge: 'Security',
      icon: <Laptop2 className="h-5 w-5 text-amber-500" />
    },
  ];

  // Calculate completion stats
  const completedModules = trainingModules.filter(m => m.progress === 100).length;
  const inProgressModules = trainingModules.filter(m => m.progress > 0 && m.progress < 100).length;
  const totalScore = trainingModules.reduce((sum, module) => sum + (module.progress || 0), 0) / trainingModules.length;

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
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-4xl font-bold mb-2">Welcome, {user.first_name}!</h1>
            <p className="text-xl opacity-90">
              Complete your security training and stay compliant with company policies.
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{completedModules} Modules</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{inProgressModules} Modules</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Score</p>
                <p className="text-2xl font-bold">{Math.round(totalScore)}%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Training Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Training Modules</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-800">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainingModules.map((module) => (
              <motion.div 
                key={module.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-lg mr-3">
                        {module.icon}
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {module.badge}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      module.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : module.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {module.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          module.progress === 100 
                            ? 'bg-green-500' 
                            : module.progress >= 50 
                            ? 'bg-blue-500' 
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarDays className="h-4 w-4 mr-1" />
                      Due {module.dueDate}
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                      {module.status === 'Completed' ? 'Review' : 'Continue'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.a
              href="/policies"
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">View Policies</h3>
                  <p className="text-sm text-gray-500 mt-1">Read company security policies</p>
                </div>
              </div>
            </motion.a>
            
            <motion.a
              href="/quizzes"
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Take Quizzes</h3>
                  <p className="text-sm text-gray-500 mt-1">Test your knowledge</p>
                </div>
              </div>
            </motion.a>
            
            <motion.a
              href="/profile"
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg mr-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">My Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your information</p>
                </div>
              </div>
            </motion.a>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { 
                id: 1, 
                type: 'completed', 
                title: 'Phishing Awareness', 
                description: 'You completed the Phishing Awareness training',
                date: '2 hours ago',
                icon: <CheckCircle className="h-5 w-5 text-green-500" />
              },
              { 
                id: 2, 
                type: 'started', 
                title: 'Password Security', 
                description: 'You started the Password Security module',
                date: '1 day ago',
                icon: <Clock className="h-5 w-5 text-blue-500" />
              },
              { 
                id: 3, 
                type: 'due', 
                title: 'Data Protection', 
                description: 'Module due in 5 days',
                date: '2 days ago',
                icon: <AlertCircle className="h-5 w-5 text-amber-500" />
              },
            ].map((activity) => (
              <div key={activity.id} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="p-2 rounded-lg mr-4">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.date}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Add missing icon components
const ShieldCheck = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const KeyRound = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="8" r="6" />
    <path d="M15.5 8a7.5 7.5 0 0 1 7.5 7.5" />
    <path d="M19.8 13.5 22 15.6" />
  </svg>
);

const ShieldAlert = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const Laptop2 = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
    <line x1="2" x2="22" y1="20" y2="20" />
  </svg>
);

const CalendarDays = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
);

const User = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default EndUserDashboard;
