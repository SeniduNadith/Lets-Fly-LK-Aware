import React, { useState, useEffect } from 'react';
import { policiesAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import PolicyForm from './PolicyForm.js';
import PolicyCard from './PolicyCard.js';

export const PolicyList = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: ''
  });

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const list = await policiesAPI.getAll(filters);
      setPolicies(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (policyData) => {
    try {
      await policiesAPI.create(policyData);
      await fetchPolicies();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating policy:', err);
      setError('Failed to create policy. Please try again.');
    }
  };

  const handleUpdatePolicy = async (id, policyData) => {
    try {
      await policiesAPI.update(id, policyData);
      await fetchPolicies();
      setEditingPolicy(null);
      setError(null);
    } catch (err) {
      console.error('Error updating policy:', err);
      setError('Failed to update policy. Please try again.');
    }
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      await policiesAPI.delete(id);
      setPolicies(prev => prev.filter(policy => policy.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting policy:', err);
      setError('Failed to delete policy. Please try again.');
    }
  };

  const handleAcknowledgePolicy = async (id) => {
    try {
      await policiesAPI.acknowledge(id);
      setPolicies(prev => prev.map(policy => 
        policy.id === id ? { ...policy, acknowledged: true } : policy
      ));
      setError(null);
    } catch (err) {
      console.error('Error acknowledging policy:', err);
      setError('Failed to acknowledge policy. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchPolicies();
  }, [filters]);

  if (loading) {
    return <LoadingSpinner text="Loading policies..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPolicies} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Security Policies</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Policy
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="Security">Security</option>
              <option value="Data Protection">Data Protection</option>
              <option value="Social Media">Social Media</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
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

      {/* Policy Form */}
      {showForm && (
        <PolicyForm
          onSubmit={handleCreatePolicy}
          onCancel={() => setShowForm(false)}
          title="Create New Policy"
        />
      )}

      {/* Edit Policy Form */}
      {editingPolicy && (
        <PolicyForm
          policy={editingPolicy}
          onSubmit={(data) => handleUpdatePolicy(editingPolicy.id, data)}
          onCancel={() => setEditingPolicy(null)}
          title="Edit Policy"
        />
      )}

      {/* Policies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(!Array.isArray(policies) || policies.filter(Boolean).length === 0) ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No policies found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new security policy.
              </p>
            </div>
          </div>
        ) : (
          policies.filter(Boolean).map((policy, idx) => (
            <PolicyCard
              key={policy.id ?? idx}
              policy={policy}
              onEdit={() => setEditingPolicy(policy)}
              onDelete={() => policy?.id && handleDeletePolicy(policy.id)}
              onAcknowledge={() => policy?.id && handleAcknowledgePolicy(policy.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PolicyList;
