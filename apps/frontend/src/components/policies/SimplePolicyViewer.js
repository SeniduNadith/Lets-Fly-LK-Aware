import React, { useState, useEffect } from 'react';
import { policiesAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import { FileText, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const SimplePolicyViewer = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: 'published'
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await policiesAPI.getAll(filters);
      
      // Safely extract the policies array from the response
      let policiesList = [];
      if (Array.isArray(response)) {
        policiesList = response;
      } else if (response && Array.isArray(response.data)) {
        policiesList = response.data;
      } else if (response && response.policies && Array.isArray(response.policies)) {
        policiesList = response.policies;
      }
      
      // Log the raw response for debugging
      console.log('Raw policies response:', response);
      console.log('Extracted policies list:', policiesList);
      
      // Ensure we have a valid array before proceeding
      if (!Array.isArray(policiesList)) {
        console.error('Invalid policies data format:', policiesList);
        setError('Invalid data format received from server');
        setPolicies([]);
        return;
      }

      // Sanitize each policy to ensure it has all required fields
      const sanitizedPolicies = policiesList.map(policy => {
        // Ensure policy is an object
        if (typeof policy !== 'object' || policy === null) {
          console.warn('Invalid policy item:', policy);
          return null;
        }
        
        // Return a new object with all required fields
        return {
          id: String(policy.id || Math.random().toString(36).substr(2, 9)),
          title: String(policy.title || 'Untitled Policy'),
          content: String(policy.content || ''),
          category: String(policy.category || 'General'),
          priority: String(policy.priority || 'medium'),
          status: String(policy.status || 'draft'),
          version: String(policy.version || '1.0'),
          effective_date: policy.effective_date ? new Date(policy.effective_date).toISOString() : new Date().toISOString(),
          expiry_date: policy.expiry_date ? new Date(policy.expiry_date).toISOString() : null,
          acknowledged: Boolean(policy.acknowledged)
        };
      }).filter(Boolean); // Remove any null entries
      
      console.log('Sanitized policies:', sanitizedPolicies);
      setPolicies(sanitizedPolicies);
      setError(null);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies. Please try again.');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [filters]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Handle both string and object dates
      const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const handleAcknowledge = async (policyId) => {
    try {
      await policiesAPI.acknowledge(policyId);
      await fetchPolicies(); // Refresh the list
    } catch (err) {
      console.error('Error acknowledging policy:', err);
      setError('Failed to acknowledge policy. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPolicies} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Policies</h1>
          <p className="text-gray-600">Review and acknowledge company security policies</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="Data Protection">Data Protection</option>
                <option value="Incident Response">Incident Response</option>
                <option value="Access Control">Access Control</option>
                <option value="Network Security">Network Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => {
            // Ensure we have a valid policy object
            if (!policy || typeof policy !== 'object') {
              console.warn('Invalid policy data:', policy);
              return null;
            }
            
            // Safely get values with defaults
            const safePolicy = {
              id: String(policy.id || ''),
              title: String(policy.title || 'Untitled Policy'),
              content: String(policy.content || ''),
              category: String(policy.category || 'General'),
              priority: String(policy.priority || 'medium'),
              status: String(policy.status || 'draft'),
              version: String(policy.version || '1.0'),
              effective_date: policy.effective_date ? new Date(policy.effective_date).toISOString() : new Date().toISOString(),
              expiry_date: policy.expiry_date ? new Date(policy.expiry_date).toISOString() : null,
              acknowledged: Boolean(policy.acknowledged)
            };
            
            return (
              <div key={safePolicy.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {safePolicy.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(safePolicy.priority)}`}>
                          {safePolicy.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(safePolicy.status)}`}>
                          {safePolicy.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {safePolicy.category}
                        </span>
                      </div>
                    </div>
                  </div>

                {/* Description */}
                {safePolicy.content && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {safePolicy.content.length > 150 
                      ? `${safePolicy.content.substring(0, 150)}...` 
                      : safePolicy.content
                    }
                  </p>
                )}

                {/* Policy Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Effective: {formatDate(safePolicy.effective_date)}</span>
                  </div>
                  {safePolicy.expiry_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Expires: {formatDate(safePolicy.expiry_date)}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Version: {safePolicy.version}</span>
                  </div>
                </div>

                {/* Acknowledgment Status */}
                <div className="mb-4">
                  {safePolicy.acknowledged ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span>Acknowledged</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Pending Acknowledgment</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedPolicy(safePolicy)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  {!safePolicy.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(safePolicy.id)}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>

        {policies.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        )}

        {/* Policy Detail Modal */}
        {selectedPolicy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{String(selectedPolicy.title || 'Untitled Policy')}</h2>
                  <button
                    onClick={() => setSelectedPolicy(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedPolicy.priority)}`}>
                    {String(selectedPolicy.priority || 'medium').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedPolicy.status)}`}>
                    {String(selectedPolicy.status || 'draft').toUpperCase()}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {String(selectedPolicy.category || 'General')}
                  </span>
                </div>

                <div className="prose max-w-none mb-6">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {String(selectedPolicy.content || '')}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Version:</span> {String(selectedPolicy.version || '1.0')}
                    </div>
                    <div>
                      <span className="font-medium">Effective Date:</span> {formatDate(selectedPolicy.effective_date)}
                    </div>
                    {selectedPolicy.expiry_date && (
                      <div>
                        <span className="font-medium">Expiry Date:</span> {formatDate(selectedPolicy.expiry_date)}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Last Updated:</span> {formatDate(selectedPolicy.updated_at)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      {selectedPolicy.acknowledged ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">Policy Acknowledged</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className="font-medium">Pending Acknowledgment</span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedPolicy(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      {!selectedPolicy.acknowledged && (
                        <button
                          onClick={() => {
                            handleAcknowledge(selectedPolicy.id);
                            setSelectedPolicy(null);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          Acknowledge Policy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePolicyViewer;