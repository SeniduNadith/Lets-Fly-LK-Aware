import React, { useState, useEffect } from 'react';
import { useDashboard } from './hooks/useDashboard.js';
import { StatsCard } from './components/dashboard/StatsCard.js';
import { ActionCard } from './components/dashboard/ActionCard.js';
import { LoadingSpinner } from './components/common/LoadingSpinner.js';
import { ErrorMessage } from './components/common/ErrorMessage.js';
import PolicyList from './components/policies/PolicyList.js';
import QuizList from './components/quizzes/QuizList.js';
import GameList from './components/games/GameList.js';
import TrainingList from './components/training/TrainingList.js';
import Reports from './components/reports/Reports.js';
import Register from './components/auth/Register.js';
import Login from './components/auth/Login.js';

function App() {
  const [activeTab, setActiveTab] = useState('games');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // start authenticated to show Games first
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    username: 'demo',
    firstName: 'Demo',
    lastName: 'User',
    department: 'IT',
    role: 'user'
  });
  const [showAuth, setShowAuth] = useState(null); // hide auth on first load
  const [openCreateGame, setOpenCreateGame] = useState(true);
  const { stats, dailyTip, loading, error, refreshData } = useDashboard();

  // If a real token exists, keep user authenticated; otherwise stay in demo mode
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      if (!currentUser) {
        setCurrentUser({
          id: 1,
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          department: 'IT',
          role: 'admin'
        });
      }
      setActiveTab('games');
      setOpenCreateGame(true);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setShowAuth(null);
    setActiveTab('games');
    setOpenCreateGame(true);
  };

  const handleRegisterSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setShowAuth(null);
    setActiveTab('games');
    setOpenCreateGame(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveTab('games');
    setOpenCreateGame(true);
    setShowAuth('login');
  };

  const renderDashboard = () => {
    if (loading) {
      return <LoadingSpinner text="Loading dashboard..." />;
    }

    if (error) {
      return <ErrorMessage message={error} onRetry={refreshData} />;
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {currentUser?.firstName || 'User'}!
          </h1>
          <p className="text-blue-100">
            Stay vigilant and keep your security knowledge up to date.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Security Policies" value={stats?.policies_count || 0} change="+12%" changeType="positive" icon="📋" />
          <StatsCard title="Completed Quizzes" value={stats?.quizzes_completed || 0} change="+8%" changeType="positive" icon="✅" />
          <StatsCard title="Training Progress" value={`${stats?.training_progress || 0}%`} change="+15%" changeType="positive" icon="📚" />
          <StatsCard title="Security Score" value={`${stats?.security_score || 0}/100`} change="+5%" changeType="positive" icon="🛡️" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard title="Read Policies" description="Review and acknowledge security policies" icon="📋" onClick={() => setActiveTab('policies')} color="blue" />
          <ActionCard title="Take Quizzes" description="Test your security knowledge" icon="✅" onClick={() => setActiveTab('quizzes')} color="green" />
          <ActionCard title="Play Games" description="Learn through interactive mini-games" icon="🎮" onClick={() => setActiveTab('games')} color="purple" />
          <ActionCard title="Training Modules" description="Complete security training courses" icon="📚" onClick={() => setActiveTab('training')} color="orange" />
          <ActionCard title="View Reports" description="Check your progress and analytics" icon="📊" onClick={() => setActiveTab('reports')} color="indigo" />
          <ActionCard title="Daily Security Tip" description="Get your daily security reminder" icon="💡" onClick={() => alert(dailyTip)} color="yellow" />
        </div>

        {dailyTip && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Daily Security Tip</h3>
                <p className="text-yellow-100">{dailyTip}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'policies':
        return <PolicyList />;
      case 'quizzes':
        return <QuizList />;
      case 'games':
        return <GameList initialShowForm={openCreateGame} />;
      case 'training':
        return <TrainingList />;
      case 'reports':
        return <Reports />;
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  if (!isAuthenticated && showAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showAuth === 'login' && (
          <Login onSwitchToRegister={() => setShowAuth('register')} onLoginSuccess={handleLoginSuccess} />
        )}
        {showAuth === 'register' && (
          <Register onSwitchToLogin={() => setShowAuth('login')} onRegisterSuccess={handleRegisterSuccess} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">LetsFlyLK Aware</h1>
              </div>
            </div>
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
                { id: 'policies', name: 'Policies', icon: '📋' },
                { id: 'quizzes', name: 'Quizzes', icon: '✅' },
                { id: 'games', name: 'Games', icon: '🎮' },
                { id: 'training', name: 'Training', icon: '📚' },
                { id: 'reports', name: 'Reports', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== 'games') {
                      setOpenCreateGame(false);
                    }
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {currentUser?.firstName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-xs text-gray-500">{currentUser?.department}</p>
                </div>
              </div>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">Logout</button>
              ) : (
                <button onClick={() => setShowAuth('login')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">Login</button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
