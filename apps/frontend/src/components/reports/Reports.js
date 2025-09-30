import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';

export const Reports = () => {
  const [reports, setReports] = useState({
    dashboard: null,
    compliance: null,
    training: null,
    quiz: null,
    policy: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReport, setActiveReport] = useState('dashboard');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    department: '',
    user: ''
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch all reports in parallel
      const [
        dashboardResponse,
        complianceResponse,
        trainingResponse,
        quizResponse,
        policyResponse
      ] = await Promise.all([
        reportsAPI.getDashboardStats(),
        reportsAPI.getComplianceReport(filters),
        reportsAPI.getTrainingProgressReport(filters),
        reportsAPI.getQuizPerformanceReport(filters),
        reportsAPI.getPolicyAcknowledgmentReport(filters)
      ]);

      setReports({
        dashboard: dashboardResponse,
        compliance: complianceResponse,
        training: trainingResponse,
        quiz: quizResponse,
        policy: policyResponse
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType, format) => {
    try {
      const response = await reportsAPI.exportReport(reportType, format, filters);
      
      // Create download link
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  if (loading) {
    return <LoadingSpinner text="Loading reports..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchReports} />;
  }

  const renderDashboardReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{reports.dashboard?.total_users || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Sessions</h3>
          <p className="text-3xl font-bold text-green-600">{reports.dashboard?.active_sessions || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Rate</h3>
          <p className="text-3xl font-bold text-orange-600">{reports.dashboard?.compliance_rate || 0}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Score</h3>
          <p className="text-3xl font-bold text-purple-600">{reports.dashboard?.security_score || 0}/100</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {reports.dashboard?.recent_activity?.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="space-y-3">
            {reports.dashboard?.department_performance?.map((dept, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{dept.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${dept.score}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{dept.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplianceReport = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Compliance Overview</h3>
          <button
            onClick={() => handleExportReport('compliance', 'pdf')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export PDF
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{reports.compliance?.overall_compliance || 0}%</p>
            <p className="text-sm text-gray-600">Overall Compliance</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{reports.compliance?.policies_acknowledged || 0}</p>
            <p className="text-sm text-gray-600">Policies Acknowledged</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{reports.compliance?.pending_actions || 0}</p>
            <p className="text-sm text-gray-600">Pending Actions</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.compliance?.departments?.map((dept, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{dept.compliance_rate}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.last_updated}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dept.compliance_rate >= 90 ? 'bg-green-100 text-green-800' :
                      dept.compliance_rate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dept.compliance_rate >= 90 ? 'Compliant' :
                       dept.compliance_rate >= 70 ? 'Warning' : 'Non-Compliant'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTrainingReport = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Training Progress Report</h3>
          <button
            onClick={() => handleExportReport('training', 'excel')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Export Excel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{reports.training?.total_modules || 0}</p>
            <p className="text-sm text-gray-600">Total Modules</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{reports.training?.completed_modules || 0}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{reports.training?.in_progress || 0}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{reports.training?.not_started || 0}</p>
            <p className="text-sm text-gray-600">Not Started</p>
          </div>
        </div>

        <div className="space-y-4">
          {reports.training?.user_progress?.map((user, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{user.name}</h4>
                <span className="text-sm text-gray-600">{user.department}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${user.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{user.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuizReport = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quiz Performance Report</h3>
          <button
            onClick={() => handleExportReport('quiz', 'csv')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{reports.quiz?.total_quizzes || 0}</p>
            <p className="text-sm text-gray-600">Total Quizzes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{reports.quiz?.average_score || 0}%</p>
            <p className="text-sm text-gray-600">Average Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{reports.quiz?.total_attempts || 0}</p>
            <p className="text-sm text-gray-600">Total Attempts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{reports.quiz?.failed_attempts || 0}</p>
            <p className="text-sm text-gray-600">Failed Attempts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.quiz?.quiz_performance?.map((quiz, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quiz.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.average_score}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.attempts}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{quiz.pass_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPolicyReport = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Policy Acknowledgment Report</h3>
          <button
            onClick={() => handleExportReport('policy', 'pdf')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{reports.policy?.total_policies || 0}</p>
            <p className="text-sm text-gray-600">Total Policies</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{reports.policy?.acknowledged || 0}</p>
            <p className="text-sm text-gray-600">Acknowledged</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{reports.policy?.pending || 0}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{reports.policy?.overdue || 0}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>

        <div className="space-y-4">
          {reports.policy?.policy_status?.map((policy, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{policy.name}</h4>
                  <p className="text-sm text-gray-600">{policy.category}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  policy.status === 'acknowledged' ? 'bg-green-100 text-green-800' :
                  policy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {policy.status}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Due Date: {policy.due_date}</span>
                <span>Acknowledged: {policy.acknowledged_count}/{policy.total_users}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Security Reports & Analytics</h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="Security">Security</option>
              <option value="Accounting">Accounting</option>
              <option value="Marketing">Marketing</option>
              <option value="Customer Care">Customer Care</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <input
              type="text"
              value={filters.user}
              onChange={(e) => handleFilterChange('user', e.target.value)}
              placeholder="Search by username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', color: 'blue' },
            { id: 'compliance', name: 'Compliance', color: 'green' },
            { id: 'training', name: 'Training', color: 'orange' },
            { id: 'quiz', name: 'Quiz Performance', color: 'purple' },
            { id: 'policy', name: 'Policy Status', color: 'indigo' }
          ].map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeReport === report.id
                  ? `bg-${report.color}-100 text-${report.color}-700`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {report.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeReport === 'dashboard' && renderDashboardReport()}
        {activeReport === 'compliance' && renderComplianceReport()}
        {activeReport === 'training' && renderTrainingReport()}
        {activeReport === 'quiz' && renderQuizReport()}
        {activeReport === 'policy' && renderPolicyReport()}
      </div>
    </div>
  );
};

export default Reports;
