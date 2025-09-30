import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, BarChart2, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const ManagerDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const quickActions = [
    { icon: Users, label: 'Team Progress', href: '/manager/team', color: 'bg-blue-500' },
    { icon: BookOpen, label: 'View Policies', href: '/policies', color: 'bg-green-500' },
    { icon: BarChart2, label: 'Generate Reports', href: '/manager/reports', color: 'bg-purple-500' },
    { icon: FileText, label: 'Compliance Status', href: '/manager/compliance', color: 'bg-indigo-500' },
  ];

  // Sample team data
  const teamMembers = [
    { id: 1, name: 'John Doe', role: 'Sales Executive', completed: 8, total: 10, lastActive: '2h ago' },
    { id: 2, name: 'Jane Smith', role: 'Marketing Specialist', completed: 6, total: 10, lastActive: '1h ago' },
    { id: 3, name: 'Mike Johnson', role: 'Customer Support', completed: 9, total: 10, lastActive: '30m ago' },
    { id: 4, name: 'Sarah Williams', role: 'Sales Executive', completed: 5, total: 10, lastActive: '4h ago' },
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
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-4xl font-bold mb-2">Manager Dashboard</h1>
            <p className="text-xl opacity-90">
              Welcome, {user.first_name}! Monitor your team's progress and compliance status.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Team Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Team Progress</h2>
            <span className="text-sm text-blue-600 font-medium">View All</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Member</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Progress</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => {
                  const progress = (member.completed / member.total) * 100;
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">{member.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{member.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{member.completed} of {member.total} completed</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastActive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {progress === 100 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : progress >= 50 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Started
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Team Completion</p>
                <p className="text-2xl font-bold">72%</p>
                <p className="text-xs text-gray-500 mt-1">28/40 modules completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Policies</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-gray-500 mt-1">2 new this month</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-full mr-4">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Action Required</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-gray-500 mt-1">Team members need attention</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Reports</h2>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-800">Generate New</button>
          </div>
          
          <div className="space-y-4">
            {[
              { id: 1, name: 'Q3 2023 Compliance Report', type: 'Compliance', date: 'Oct 15, 2023', status: 'Completed' },
              { id: 2, name: 'September Training Progress', type: 'Training', date: 'Oct 1, 2023', status: 'Completed' },
              { id: 3, name: 'Security Awareness Assessment', type: 'Assessment', date: 'In Progress', status: 'Processing' },
            ].map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.type} • {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    report.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  <button className="ml-4 text-blue-600 hover:text-blue-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
