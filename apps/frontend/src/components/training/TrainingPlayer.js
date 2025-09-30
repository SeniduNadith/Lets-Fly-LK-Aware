import React, { useState } from 'react';

export const TrainingPlayer = ({ training, onComplete, onCancel }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleComplete = () => {
    onComplete({ completed: true, progress: 100 });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{training.title}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Exit Training
          </button>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 mb-4">{training.description}</p>
          <div className="bg-orange-100 p-4 rounded-lg">
            <p className="text-orange-800 font-medium">Training Player - Coming Soon!</p>
            <p className="text-orange-600 text-sm mt-2">Interactive training functionality will be implemented here.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleComplete}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Complete Training
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

export default TrainingPlayer;
