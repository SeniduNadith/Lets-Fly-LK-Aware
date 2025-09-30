import React, { useState, useEffect } from 'react';
import { trainingAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import TrainingForm from './TrainingForm.js';
import TrainingCard from './TrainingCard.js';
import TrainingPlayer from './TrainingPlayer.js';

export const TrainingList = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [takingTraining, setTakingTraining] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    status: ''
  });

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const list = await trainingAPI.getAll(filters);
      setTrainings(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError('Failed to load training modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTraining = async (trainingData) => {
    try {
      await trainingAPI.create(trainingData);
      await fetchTrainings();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating training:', err);
      setError('Failed to create training module. Please try again.');
    }
  };

  const handleUpdateTraining = async (id, trainingData) => {
    try {
      const payload = {
        title: trainingData.title,
        description: trainingData.description,
        category: trainingData.category,
        content_type: 'interactive',
        content_url: trainingData.content || '',
        duration: trainingData.duration || 0,
        // role_id and prerequisites can be omitted; backend will keep existing
      };
      await trainingAPI.update(id, payload);
      await fetchTrainings();
      setEditingTraining(null);
      setError(null);
    } catch (err) {
      console.error('Error updating training:', err);
      setError('Failed to update training module. Please try again.');
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training module?')) {
      return;
    }

    try {
      await trainingAPI.delete(id);
      setTrainings(prev => prev.filter(training => training.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting training:', err);
      setError('Failed to delete training module. Please try again.');
    }
  };

  const handleStartTraining = async (training) => {
    try {
      const response = await trainingAPI.startTraining(training.id);
      setTakingTraining({ ...training, sessionId: response.session_id });
      setError(null);
    } catch (err) {
      console.error('Error starting training:', err);
      setError('Failed to start training. Please try again.');
    }
  };

  const handleCompleteTraining = async (trainingData) => {
    try {
      const response = await trainingAPI.completeTraining(takingTraining.id);
      setTakingTraining(null);
      // Refresh trainings to show updated progress
      fetchTrainings();
      setError(null);
      alert('Training completed successfully!');
    } catch (err) {
      console.error('Error completing training:', err);
      setError('Failed to complete training. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchTrainings();
  }, [filters]);

  if (loading) {
    return <LoadingSpinner text="Loading training modules..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchTrainings} />;
  }

  // If taking a training, show the training player
  if (takingTraining) {
    return (
      <TrainingPlayer
        training={takingTraining}
        onComplete={handleCompleteTraining}
        onCancel={() => setTakingTraining(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Security Training Modules</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Create New Training
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Categories</option>
              <option value="General Security">General Security</option>
              <option value="Data Protection">Data Protection</option>
              <option value="Social Engineering">Social Engineering</option>
              <option value="Password Security">Password Security</option>
              <option value="Email Security">Email Security</option>
              <option value="Physical Security">Physical Security</option>
              <option value="Incident Response">Incident Response</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Training Form */}
      {showForm && (
        <TrainingForm
          onSubmit={handleCreateTraining}
          onCancel={() => setShowForm(false)}
          title="Create New Training Module"
        />
      )}

      {/* Edit Training Form */}
      {editingTraining && (
        <TrainingForm
          training={editingTraining}
          onSubmit={(data) => handleUpdateTraining(editingTraining.id, data)}
          onCancel={() => setEditingTraining(null)}
          title="Edit Training Module"
        />
      )}

      {/* Trainings List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.523 18.246 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No training modules found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new security training module.
              </p>
            </div>
          </div>
        ) : (
          trainings.map((training) => (
            <TrainingCard
              key={training.id}
              training={training}
              onEdit={() => setEditingTraining(training)}
              onDelete={() => handleDeleteTraining(training.id)}
              onStart={() => handleStartTraining(training)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TrainingList;
