import React from 'react';

export const QuizCard = ({ quiz, onEdit, onDelete, onStart }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'General': return 'bg-blue-100 text-blue-800';
      case 'Social Engineering': return 'bg-purple-100 text-purple-800';
      case 'Data Protection': return 'bg-indigo-100 text-indigo-800';
      case 'Password Security': return 'bg-orange-100 text-orange-800';
      case 'Email Security': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quiz.title || 'Untitled Quiz'}
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
              {(quiz.difficulty || 'beginner').toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(quiz.category)}`}>
              {quiz.category || 'General'}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {quiz.description && (
        <p className="text-gray-600 mb-4">
          {quiz.description}
        </p>
      )}

      {/* Quiz Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{quiz.questions_count || 0}</div>
          <div className="text-xs text-gray-600">Questions</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{quiz.time_limit || 0}</div>
          <div className="text-xs text-gray-600">Minutes</div>
        </div>
      </div>

      {/* Quiz Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Passing Score:</span>
          <span className="font-medium">{quiz.passing_score || 70}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time Limit:</span>
          <span className="font-medium">{quiz.time_limit || 30} minutes</span>
        </div>
        {quiz.last_attempt && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Attempt:</span>
            <span className="font-medium">{new Date(quiz.last_attempt).toLocaleDateString()}</span>
          </div>
        )}
        {quiz.best_score !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Best Score:</span>
            <span className={`font-medium ${quiz.best_score >= (quiz.passing_score || 70) ? 'text-green-600' : 'text-red-600'}`}>
              {quiz.best_score}%
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onStart(quiz)}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Start Quiz
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(quiz)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(quiz.id)}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
