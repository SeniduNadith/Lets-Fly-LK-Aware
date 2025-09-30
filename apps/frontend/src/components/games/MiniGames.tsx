import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Shield, Lock, Key, EyeOff, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  comingSoon?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  description, 
  icon, 
  color, 
  onClick, 
  comingSoon = false 
}) => {
  return (
    <div 
      onClick={!comingSoon ? onClick : undefined}
      className={`relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer ${
        comingSoon ? 'opacity-75' : 'hover:border-blue-500'
      }`}
    >
      {comingSoon && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Coming Soon
        </div>
      )}
      <div className="p-6">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );
};

const MiniGames: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const games = [
    {
      id: 'phishing',
      title: 'Phishing Hunter',
      description: 'Identify phishing attempts and learn how to spot them in real-world scenarios.',
      icon: <Search className="h-6 w-6 text-white" />,
      color: 'bg-blue-500',
    },
    {
      id: 'password',
      title: 'Password Defender',
      description: 'Test your password creation skills and learn how to make them hacker-proof.',
      icon: <Lock className="h-6 w-6 text-white" />,
      color: 'bg-green-500',
    },
    {
      id: '2fa',
      title: '2FA Challenge',
      description: 'Master the art of two-factor authentication and keep your accounts secure.',
      icon: <Key className="h-6 w-6 text-white" />,
      color: 'bg-purple-500',
      comingSoon: true,
    },
    {
      id: 'privacy',
      title: 'Privacy Protector',
      description: 'Learn how to protect your personal information online.',
      icon: <EyeOff className="h-6 w-6 text-white" />,
      color: 'bg-red-500',
      comingSoon: true,
    },
  ];

  const filteredGames = games.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGameSelect = (gameId: string) => {
    // In a real app, you would navigate to the specific game
    navigate(`/games/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Games</h1>
              <p className="text-gray-600">Learn about cybersecurity through interactive games and challenges</p>
            </div>
            <div className="mt-4 md:mt-0 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredGames.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No games found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  color={game.color}
                  onClick={() => handleGameSelect(game.id)}
                  comingSoon={game.comingSoon}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
              <Gamepad2 className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Why play security games?</h3>
              <p className="mt-1 text-gray-600">
                Interactive games make learning about cybersecurity fun and engaging. By simulating real-world scenarios, 
                you'll develop practical skills to protect yourself and your organization from digital threats.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="ml-2 text-sm text-gray-600">Hands-on learning experience</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="ml-2 text-sm text-gray-600">Safe environment to practice</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="ml-2 text-sm text-gray-600">Immediate feedback and tips</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniGames;
