import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import SimpleLogin from './components/auth/SimpleLogin';
import CreateAccount from './components/auth/CreateAccount';

// Import the new dashboard components
import AdminDashboard from './components/dashboard/AdminDashboard';
import ManagerDashboard from './components/dashboard/ManagerDashboard';
import EndUserDashboard from './components/dashboard/EndUserDashboard';
import AuditorDashboard from './components/dashboard/AuditorDashboard';
import Quiz from './components/quiz/Quiz';
import MiniGames from './components/games/MiniGames';
import GamesViewer from './components/games/GamesViewer';
import Policies from './components/policies/Policies';
import SimplePolicyViewer from './components/policies/SimplePolicyViewer';
import Profile from './components/profile/Profile';
import Layout from './components/layout/Layout';
import ClassicDashboardWrapper from './components/dashboard/ClassicDashboardWrapper';
import TrainingViewer from './components/training/TrainingViewer';
import QuizzesViewer from './components/quizzes/QuizzesViewer';

// Public Route Component (no authentication required)
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user } = useAuth();
  
  // Allow access to all routes without authentication
  // Role-based restrictions can still be applied if needed
  if (allowedRoles && user && !allowedRoles.includes(user.role) && !allowedRoles.includes('public')) {
    // Redirect to a default route if role is not allowed
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Role-based Dashboard Component
const RoleDashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role.toLowerCase()) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'enduser':
      return <EndUserDashboard />;
    case 'auditor':
      return <AuditorDashboard />;
    // Fallback for any other roles
    default:
      // Check if the role contains any of our keywords
      if (user.role.toLowerCase().includes('admin')) {
        return <AdminDashboard />;
      } else if (user.role.toLowerCase().includes('manager')) {
        return <ManagerDashboard />;
      } else if (user.role.toLowerCase().includes('audit')) {
        return <AuditorDashboard />;
      }
      // Default to EndUserDashboard for all other roles
      return <EndUserDashboard />;
  }
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<SimpleLogin />} />
                <Route path="/create-account" element={<CreateAccount />} />
                
                {/* Public Dashboards */}
                <Route path="/" element={
                  <Layout>
                    <RoleDashboard />
                  </Layout>
                } />
                
                <Route path="/dashboard" element={
                  <Layout>
                    <RoleDashboard />
                  </Layout>
                } />
                
                {/* Classic dashboard route (previous UI) */}
                <Route path="/classic" element={
                  <Layout>
                    <ClassicDashboardWrapper />
                  </Layout>
                } />
                
                <Route path="/admin" element={
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                } />
                
                <Route path="/manager" element={
                  <Layout>
                    <ManagerDashboard />
                  </Layout>
                } />
                
                <Route path="/auditor" element={
                  <Layout>
                    <AuditorDashboard />
                  </Layout>
                } />
                
                <Route path="/enduser" element={
                  <Layout>
                    <EndUserDashboard />
                  </Layout>
                } />
                
                <Route path="/quiz/:id" element={
                  <Layout>
                    <Quiz />
                  </Layout>
                } />
                
                <Route path="/games" element={
                  <Layout>
                    <MiniGames />
                  </Layout>
                } />
                
                <Route path="/play-games" element={
                  <Layout>
                    <GamesViewer />
                  </Layout>
                } />
                
                <Route path="/quizzes" element={
                  <Layout>
                    <QuizzesViewer />
                  </Layout>
                } />
                
                <Route path="/policies" element={
                  <Layout>
                    <Policies />
                  </Layout>
                } />
                
                <Route path="/policy-viewer" element={
                  <Layout>
                    <SimplePolicyViewer />
                  </Layout>
                } />
                
                <Route path="/training-viewer" element={
                  <Layout>
                    <TrainingViewer />
                  </Layout>
                } />
                
                <Route path="/profile" element={
                  <Layout>
                    <Profile />
                  </Layout>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
