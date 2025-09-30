import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, ShieldCheck, AlertTriangle, BarChart2, Users, Search, Filter, Download } from 'lucide-react';

const AuditorDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Sample compliance data
  const complianceData = [
    { id: 1, policy: 'Data Protection Policy', status: 'Compliant', lastAudit: '2023-10-10', issues: 2 },
    { id: 2, policy: 'Access Control Policy', status: 'Partially Compliant', lastAudit: '2023-10-05', issues: 5 },
    { id: 3, policy: 'Incident Response Plan', status: 'Non-Compliant', lastAudit: '2023-09-28', issues: 8 },
    { id: 4, policy: 'Remote Work Policy', status: 'Compliant', lastAudit: '2023-10-12', issues: 1 },
  ];

  // Sample audit history
  const auditHistory = [
    { id: 1, date: '2023-10-15', type: 'Scheduled', status: 'Completed', findings: 3 },
    { id: 2, date: '2023-09-30', type: 'Surprise', status: 'Completed', findings: 7 },
    { id: 3, date: '2023-09-15', type: 'Scheduled', status: 'Completed', findings: 2 },
    { id: 4, date: '2023-08-31', type: 'Follow-up', status: 'Completed', findings: 5 },
  ];

  // Calculate compliance metrics
  const totalPolicies = complianceData.length;
  const compliantPolicies = complianceData.filter(p => p.status === 'Compliant').length;
  const complianceRate = Math.round((compliantPolicies / totalPolicies) * 100);
  const totalIssues = complianceData.reduce((sum, policy) => sum + policy.issues, 0);

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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-4xl font-bold mb-2">Auditor Dashboard</h1>
            <p className="text-xl opacity-90">
              Welcome, {user.first_name}! Monitor compliance and track audit activities.
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Compliance Rate</p>
                <p className="text-3xl font-bold">{complianceRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Overall compliance</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Policies</p>
                <p className="text-3xl font-bold">{totalPolicies}</p>
                <p className="text-xs text-gray-500 mt-1">In review cycle</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Issues</p>
                <p className="text-3xl font-bold">{totalIssues}</p>
                <p className="text-xs text-gray-500 mt-1">Requiring attention</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Audits This Month</p>
                <p className="text-3xl font-bold">3</p>
                <p className="text-xs text-gray-500 mt-1">2 scheduled, 1 surprise</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Compliance Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Compliance Status</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Audit</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Issues</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complianceData.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{policy.policy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        policy.status === 'Compliant' 
                          ? 'bg-green-100 text-green-800' 
                          : policy.status === 'Partially Compliant'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.lastAudit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        policy.issues === 0 
                          ? 'bg-green-100 text-green-800' 
                          : policy.issues <= 3
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {policy.issues} {policy.issues === 1 ? 'issue' : 'issues'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/audit/policy/${policy.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">View</a>
                      <a href={`/audit/policy/${policy.id}/report`} className="text-gray-600 hover:text-gray-900">Report</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Audits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Audits</h2>
              <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800">View All</button>
            </div>
            
            <div className="space-y-4">
              {auditHistory.map((audit) => (
                <div key={audit.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg mr-4 ${
                    audit.type === 'Scheduled' 
                      ? 'bg-blue-100 text-blue-600' 
                      : audit.type === 'Surprise'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{audit.type} Audit</h3>
                      <span className="text-sm text-gray-500">{audit.date}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>{audit.findings} {audit.findings === 1 ? 'finding' : 'findings'}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        audit.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {audit.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center">
                <span>Schedule New Audit</span>
              </button>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4">
                <a 
                  href="/audit/new" 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Start New Audit</h3>
                    <p className="text-sm text-gray-500">Create and schedule a new compliance audit</p>
                  </div>
                </a>
                
                <a 
                  href="/reports/generate" 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <div className="p-2 bg-green-100 rounded-lg mr-4">
                    <BarChart2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Generate Report</h3>
                    <p className="text-sm text-gray-500">Create custom compliance reports</p>
                  </div>
                </a>
                
                <a 
                  href="/findings" 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <div className="p-2 bg-amber-100 rounded-lg mr-4">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Review Findings</h3>
                    <p className="text-sm text-gray-500">View and manage audit findings</p>
                  </div>
                </a>
                
                <a 
                  href="/teams" 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Audit Teams</h3>
                    <p className="text-sm text-gray-500">Manage audit teams and assignments</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Search Compliance */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="font-medium text-gray-900 mb-3">Search Compliance Data</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search policies, standards, or controls..."
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  HIPAA
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  GDPR
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  SOC 2
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ISO 27001
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;
