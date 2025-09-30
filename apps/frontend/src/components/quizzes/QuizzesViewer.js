import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizzesAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';

const QuizPlayer = ({ quiz, onSubmit, onCancel }) => {
  const [answers, setAnswers] = useState({});

  const handleChange = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    const answerList = Object.entries(answers).map(([question_id, selected_option]) => ({
      question_id: Number(question_id),
      selected_option
    }));
    onSubmit(answerList);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">Exit</button>
        </div>
        {quiz.questions?.map((q) => (
          <div key={q.id} className="mb-6">
            <p className="font-medium text-gray-900 mb-2">{q.question_text}</p>
            <div className="space-y-2">
              {['A','B','C','D'].map((key) => (
                q[`option_${key.toLowerCase()}`] ? (
                  <label key={key} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={key}
                      checked={answers[q.id] === key}
                      onChange={() => handleChange(q.id, key)}
                    />
                    <span>{q[`option_${key.toLowerCase()}`]}</span>
                  </label>
                ) : null
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit Quiz</button>
        </div>
      </div>
    </div>
  );
};

const QuizzesViewer = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: '', difficulty: '', status: 'published' });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchQuizzes();
  }, [filters]);

  const handleStartQuiz = async (quiz) => {
    try {
      await quizzesAPI.clearIncompleteAttempts?.();
      await quizzesAPI.startQuiz(quiz.id);
      // Redirect to the full quiz page route
      navigate(`/quiz/${quiz.id}`);
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError('Failed to start quiz. Please try again.');
    }
  };

  const handleSubmitQuiz = async (answers) => {
    try {
      const res = await quizzesAPI.submitQuiz(activeQuiz.id, answers);
      setActiveQuiz(null);
      fetchQuizzes();
      alert(`Quiz submitted! Score: ${res?.score ?? ''}`);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchQuizzes} />;
  if (activeQuiz) return <QuizPlayer quiz={activeQuiz} onSubmit={handleSubmitQuiz} onCancel={() => setActiveQuiz(null)} />;

  const getDifficultyColor = (difficulty) => {
    switch ((difficulty || 'beginner').toLowerCase()) {
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner':
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Quizzes</h1>
          <p className="text-gray-600">Test your knowledge with interactive quizzes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Categories</option>
                <option value="General">General</option>
                <option value="Phishing">Phishing</option>
                <option value="Password">Password Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((q) => (
            <div key={q.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{q.title || 'Untitled Quiz'}</h3>
                {q.description ? (
                  <p className="text-gray-600 text-sm mb-4">{q.description}</p>
                ) : null}
                <div className="flex gap-2 mb-4 text-xs">
                  <span className={`px-2 py-1 rounded ${getDifficultyColor(q.difficulty)}`}>{(q.difficulty || 'beginner').toUpperCase()}</span>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">{q.category || 'General'}</span>
                </div>
                <div className="flex">
                  <button onClick={() => handleStartQuiz(q)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Start Quiz</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizzesViewer;


