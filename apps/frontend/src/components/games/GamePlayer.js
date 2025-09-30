import React, { useEffect, useRef, useState } from 'react';

export const GamePlayer = ({ game, onSubmit, onCancel }) => {
  const [score, setScore] = useState(0);
  const [maxScore] = useState(100);
  const [gameState, setGameState] = useState('playing');
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handleGameComplete = () => {
    setGameState('completed');
    const timeTakenSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    onSubmit({
      score: score,
      max_score: maxScore,
      time_taken: timeTakenSec,
      game_result: { completed: true }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{game.title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Exit Game
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">{game.description}</p>
          <div className="bg-purple-100 p-4 rounded-lg">
            <p className="text-purple-800 font-medium">Game Player - Coming Soon!</p>
            <p className="text-purple-600 text-sm mt-2">Interactive game functionality will be implemented here.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setScore((s) => Math.min(maxScore, s + 10))}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          +10 Points
        </button>
        <button
          onClick={handleGameComplete}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Complete Game
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default GamePlayer;
