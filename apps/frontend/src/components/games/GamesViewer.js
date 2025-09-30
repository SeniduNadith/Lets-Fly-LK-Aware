import React, { useState, useEffect } from 'react';
import { gamesAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import { Gamepad2, Calendar, Play, Clock, Star, Trophy } from 'lucide-react';

export const GamesViewer = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    status: 'active'
  });

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.getAll(filters);
      
      // Safely extract the games array from the response
      let gamesList = [];
      if (Array.isArray(response)) {
        gamesList = response;
      } else if (response && Array.isArray(response.data)) {
        gamesList = response.data;
      } else if (response && response.games && Array.isArray(response.games)) {
        gamesList = response.games;
      }
      
      // Log the raw response for debugging
      console.log('Raw games response:', response);
      console.log('Extracted games list:', gamesList);
      
      // Ensure we have a valid array before proceeding
      if (!Array.isArray(gamesList)) {
        console.error('Invalid games data format:', gamesList);
        setError('Invalid data format received from server');
        setGames([]);
        return;
      }

      // Sanitize each game to ensure it has all required fields
      const sanitizedGames = gamesList.map(game => {
        // Ensure game is an object
        if (typeof game !== 'object' || game === null) {
          console.warn('Invalid game item:', game);
          return null;
        }
        
        // Return a new object with all required fields
        return {
          id: String(game.id || Math.random().toString(36).substr(2, 9)),
          title: String(game.title || 'Untitled Game'),
          description: String(game.description || ''),
          category: String(game.category || 'General'),
          difficulty: String(game.difficulty || 'beginner'),
          status: String(game.status || 'active'),
          game_type: String(game.game_type || 'quiz'),
          duration: Number(game.duration || 5),
          points: Number(game.points || 10),
          created_at: game.created_at ? new Date(game.created_at).toISOString() : new Date().toISOString(),
          updated_at: game.updated_at ? new Date(game.updated_at).toISOString() : new Date().toISOString()
        };
      }).filter(Boolean); // Remove any null entries
      
      console.log('Sanitized games:', sanitizedGames);
      setGames(sanitizedGames);
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games. Please try again.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [filters]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'expert': return 'bg-red-100 text-red-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'beginner': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'phishing': return 'bg-red-100 text-red-800';
      case 'password': return 'bg-blue-100 text-blue-800';
      case 'social engineering': return 'bg-purple-100 text-purple-800';
      case 'malware': return 'bg-orange-100 text-orange-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-indigo-100 text-indigo-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const handlePlayGame = async (gameId) => {
    try {
      // Start the game
      const response = await gamesAPI.startGame(gameId);
      console.log('Game started:', response);
      
      // For now, we'll just show an alert. In a real app, this would redirect to the game
      alert(`Starting game! Game ID: ${gameId}`);
      
      // You could redirect to a game page here:
      // navigate(`/game/${gameId}`);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchGames} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Mini-Games</h1>
          <p className="text-gray-600">Play interactive security awareness games to test your knowledge</p>
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
                <option value="phishing">Phishing</option>
                <option value="password">Password Security</option>
                <option value="social engineering">Social Engineering</option>
                <option value="malware">Malware</option>
                <option value="general">General Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            // Ensure we have a valid game object
            if (!game || typeof game !== 'object') {
              console.warn('Invalid game data:', game);
              return null;
            }
            
            // Safely get values with defaults
            const safeGame = {
              id: String(game.id || ''),
              title: String(game.title || 'Untitled Game'),
              description: String(game.description || ''),
              category: String(game.category || 'General'),
              difficulty: String(game.difficulty || 'beginner'),
              status: String(game.status || 'active'),
              game_type: String(game.game_type || 'quiz'),
              duration: Number(game.duration || 5),
              points: Number(game.points || 10),
              created_at: game.created_at ? new Date(game.created_at).toISOString() : new Date().toISOString(),
              updated_at: game.updated_at ? new Date(game.updated_at).toISOString() : new Date().toISOString()
            };
            
            return (
              <div key={safeGame.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {safeGame.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(safeGame.difficulty)}`}>
                          {safeGame.difficulty.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(safeGame.status)}`}>
                          {safeGame.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(safeGame.category)}`}>
                          {safeGame.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {safeGame.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {safeGame.description.length > 150 
                        ? `${safeGame.description.substring(0, 150)}...` 
                        : safeGame.description
                      }
                    </p>
                  )}

                  {/* Game Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Gamepad2 className="h-4 w-4 mr-2" />
                      <span>Type: {safeGame.game_type}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duration: {safeGame.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2" />
                      <span>Points: {safeGame.points}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created: {formatDate(safeGame.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePlayGame(safeGame.id)}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Game
                    </button>
                    <button
                      onClick={() => setSelectedGame(safeGame)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        )}

        {/* Game Detail Modal */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{String(selectedGame.title || 'Untitled Game')}</h2>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(selectedGame.difficulty)}`}>
                    {String(selectedGame.difficulty || 'beginner').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedGame.status)}`}>
                    {String(selectedGame.status || 'active').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(selectedGame.category)}`}>
                    {String(selectedGame.category || 'General')}
                  </span>
                </div>

                <div className="prose max-w-none mb-6">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {String(selectedGame.description || '')}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Game Type:</span> {String(selectedGame.game_type || 'quiz')}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {String(selectedGame.duration || 5)} minutes
                    </div>
                    <div>
                      <span className="font-medium">Points:</span> {String(selectedGame.points || 10)}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(selectedGame.created_at)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-blue-600">
                      <Trophy className="h-5 w-5 mr-2" />
                      <span className="font-medium">Ready to Play!</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedGame(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          handlePlayGame(selectedGame.id);
                          setSelectedGame(null);
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Game
                      </button>
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

export default GamesViewer;
