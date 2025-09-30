import React, { useState, useEffect } from 'react';
import { quizzesAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import QuizForm from './QuizForm.js';
import QuizCard from './QuizCard.js';
import QuizTaker from './QuizTaker.js';

export const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [takingQuiz, setTakingQuiz] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    status: ''
  });

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const list = await quizzesAPI.getAll(filters);
      setQuizzes(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      await quizzesAPI.create(quizData);
      await fetchQuizzes();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Failed to create quiz. Please try again.');
    }
  };

  const handleUpdateQuiz = async (id, quizData) => {
    try {
      await quizzesAPI.update(id, quizData);
      await fetchQuizzes();
      setEditingQuiz(null);
      setError(null);
    } catch (err) {
      console.error('Error updating quiz:', err);
      setError('Failed to update quiz. Please try again.');
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await quizzesAPI.delete(id);
      setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    }
  };

  const handleStartQuiz = async (quiz) => {
    try {
      // First start the quiz attempt
      const response = await quizzesAPI.startQuiz(quiz.id);
      const attemptId = response.attempt_id;
      
      // Then fetch the complete quiz data with questions
      const fullQuizData = await quizzesAPI.getById(quiz.id);
      
      // Set the taking quiz with complete data
      setTakingQuiz({ ...fullQuizData, attemptId });
      setError(null);
    } catch (err) {
      console.error('Error starting quiz:', err);
      
      // Check if it's an incomplete attempt error
      if (err.response?.status === 400 && err.response?.data?.error?.includes('incomplete attempt')) {
        // In development, try to clear incomplete attempts and retry
        try {
          await quizzesAPI.clearIncompleteAttempts();
          // Retry starting the quiz
          const response = await quizzesAPI.startQuiz(quiz.id);
          const attemptId = response.attempt_id;
          const fullQuizData = await quizzesAPI.getById(quiz.id);
          setTakingQuiz({ ...fullQuizData, attemptId });
          setError(null);
        } catch (retryErr) {
          console.error('Error retrying quiz start:', retryErr);
          setError('Failed to start quiz. Please try again.');
        }
      } else {
        setError('Failed to start quiz. Please try again.');
      }
    }
  };

  const handleSubmitQuiz = async (answers) => {
    try {
      const response = await quizzesAPI.submitQuiz(takingQuiz.id, answers);
      setTakingQuiz(null);
      // Refresh quizzes to show updated results
      fetchQuizzes();
      setError(null);
      alert(`Quiz completed! Your score: ${response.score}%`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchQuizzes();
  }, [filters]);

  if (loading) {
    return <LoadingSpinner text="Loading quizzes..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchQuizzes} />;
  }

  // If taking a quiz, show the quiz taker
  if (takingQuiz) {
    return (
      <QuizTaker
        quiz={takingQuiz}
        onSubmit={handleSubmitQuiz}
        onCancel={() => setTakingQuiz(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Security Quizzes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Create New Quiz
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              <option value="General">General Security</option>
              <option value="Social Engineering">Social Engineering</option>
              <option value="Data Protection">Data Protection</option>
              <option value="Password Security">Password Security</option>
              <option value="Email Security">Email Security</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quiz Form */}
      {showForm && (
        <QuizForm
          onSubmit={handleCreateQuiz}
          onCancel={() => setShowForm(false)}
          title="Create New Quiz"
        />
      )}

      {/* Edit Quiz Form */}
      {editingQuiz && (
        <QuizForm
          quiz={editingQuiz}
          onSubmit={(data) => handleUpdateQuiz(editingQuiz.id, data)}
          onCancel={() => setEditingQuiz(null)}
          title="Edit Quiz"
        />
      )}

      {/* Quizzes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(!Array.isArray(quizzes) || quizzes.filter(Boolean).length === 0) ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new security quiz.
              </p>
            </div>
          </div>
        ) : (
          quizzes.filter(Boolean).map((quiz, idx) => (
            <QuizCard
              key={quiz.id ?? idx}
              quiz={quiz}
              onEdit={() => setEditingQuiz(quiz)}
              onDelete={() => quiz?.id && handleDeleteQuiz(quiz.id)}
              onStart={() => handleStartQuiz(quiz)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QuizList;
