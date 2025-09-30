import React, { useState } from 'react';

export const PolicyCard = ({ policy, onEdit, onDelete, onAcknowledge }) => {
  const [showContent, setShowContent] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {policy.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(policy.priority)}`}>
              {policy.priority.toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(policy.status)}`}>
              {policy.status.toUpperCase()}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {policy.category}
            </span>
          </div>
        </div>
        
        {/* Acknowledgment Status */}
        <div className="ml-4">
          {policy.acknowledged ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Acknowledged
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {policy.description && (
        <p className="text-gray-600 mb-4">
          {policy.description}
        </p>
      )}

      {/* Content Preview */}
      <div className="mb-4">
        <button
          onClick={() => setShowContent(!showContent)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          {showContent ? 'Hide Content' : 'View Content'}
          <svg className={`w-4 h-4 ml-1 transition-transform ${showContent ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showContent && (
          <div className="mt-3 p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {policy.content}
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500 mb-4">
        <div className="flex justify-between">
          <span>Created: {new Date(policy.created_at).toLocaleDateString()}</span>
          <span>Updated: {new Date(policy.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          {!policy.acknowledged && (
            <button
              onClick={() => onAcknowledge(policy.id)}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(policy)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(policy.id)}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
