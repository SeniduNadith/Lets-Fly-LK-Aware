import React, { useState, useEffect } from 'react';
import { gamesAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import GameForm from './GameForm.js';
import GameCard from './GameCard.js';
import GamePlayer from './GamePlayer.js';

export const GameList = ({ initialShowForm = false }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(initialShowForm);
  const [editingGame, setEditingGame] = useState(null);
  const [playingGame, setPlayingGame] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    status: ''
  });

  useEffect(() => {
    if (initialShowForm) {
      setShowForm(true);
    }
  }, [initialShowForm]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const list = await gamesAPI.getAll(filters);
      setGames(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async (gameData) => {
    try {
      await gamesAPI.create(gameData);
      await fetchGames();
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game. Please try again.');
    }
  };

  const handleUpdateGame = async (id, gameData) => {
    try {
      await gamesAPI.update(id, gameData);
      await fetchGames();
      setEditingGame(null);
      setError(null);
    } catch (err) {
      console.error('Error updating game:', err);
      setError('Failed to update game. Please try again.');
    }
  };

  const handleDeleteGame = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    try {
      await gamesAPI.delete(id);
      setGames(prev => prev.filter(game => game.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting game:', err);
      setError('Failed to delete game. Please try again.');
    }
  };

  const handleStartGame = async (game) => {
    try {
      const response = await gamesAPI.startGame(game.id);
      const sessionId = response.attempt_id || response.session_id;
      setPlayingGame({ ...game, sessionId });
      setError(null);
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Failed to start game. Please try again.');
    }
  };

  const handleSubmitGame = async (gameData) => {
    try {
      // Backend expects: attempt_id, score, max_score, time_taken, game_result
      const payload = {
        attempt_id: playingGame?.sessionId,
        score: Number(gameData?.score ?? 0),
        max_score: Number(gameData?.max_score ?? 100),
        time_taken: Number(gameData?.time_taken ?? 0),
        game_result: gameData?.game_result ?? {}
      };

      const response = await gamesAPI.submitGame(playingGame.id, payload);
      setPlayingGame(null);
      // Refresh games to show updated results
      fetchGames();
      setError(null);
      const finalScore = response?.score ?? payload.score;
      alert(`Game completed! Your score: ${finalScore} points`);
    } catch (err) {
      console.error('Error submitting game:', err);
      setError('Failed to submit game. Please try again.');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    fetchGames();
  }, [filters]);

  if (loading) {
    return <LoadingSpinner text="Loading games..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchGames} />;
  }

  // If playing a game, show the game player
  if (playingGame) {
    return (
      <GamePlayer
        game={playingGame}
        onSubmit={handleSubmitGame}
        onCancel={() => setPlayingGame(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Security Mini-Games</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Create New Game
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              <option value="Phishing Detection">Phishing Detection</option>
              <option value="Password Security">Password Security</option>
              <option value="Social Engineering">Social Engineering</option>
              <option value="Data Protection">Data Protection</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Game Form */}
      {showForm && (
        <GameForm
          onSubmit={handleCreateGame}
          onCancel={() => setShowForm(false)}
          title="Create New Game"
        />
      )}

      {/* Edit Game Form */}
      {editingGame && (
        <GameForm
          game={editingGame}
          onSubmit={(data) => handleUpdateGame(editingGame.id, data)}
          onCancel={() => setEditingGame(null)}
          title="Edit Game"
        />
      )}

      {/* Games List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(!Array.isArray(games) || games.filter(Boolean).length === 0) ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No games found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new security mini-game.
              </p>
            </div>
          </div>
        ) : (
          games.filter((g) => g && (typeof g === 'object')).map((game, idx) => (
            <GameCard
              key={game.id ?? idx}
              game={game}
              onEdit={() => setEditingGame(game)}
              onDelete={() => game?.id && handleDeleteGame(game.id)}
              onStart={() => game?.id ? handleStartGame(game) : null}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GameList;
