import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Shield, 
  BookOpen, 
  Gamepad2, 
  FileText, 
  Eye,
  Play,
  User, 
  LogOut,
  Bell,
  Settings,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug: Log authentication state
  console.log('Layout - User:', user);
  console.log('Layout - IsLoading:', isLoading);
  console.log('Layout - IsAuthenticated:', !!user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items for all users
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Classic', href: '/classic', icon: Home },
    { name: 'Policies', href: '/policies', icon: BookOpen },
    { name: 'View Policies', href: '/policy-viewer', icon: Eye },
    { name: 'Security Reports & Analytics', href: '/auditor', icon: BarChart2 },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Play Games', href: '/play-games', icon: Play },
    { name: 'Training', href: '/training-viewer', icon: BookOpen },
    { name: 'Quizzes', href: '/quizzes', icon: FileText },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Hide Classic for username "user"
  if (user?.username?.trim().toLowerCase() === 'user') {
    const classicIndex = navigation.findIndex((item) => item.name === 'Classic');
    if (classicIndex !== -1) {
      navigation.splice(classicIndex, 1);
    }
  }

  // Add admin-specific navigation
  if (user?.role === 'admin') {
    navigation.splice(1, 0, { name: 'Admin', href: '/admin', icon: Shield });
  }

  // Compute effective navigation for current user
  const usernameNormalized = user?.username?.trim().toLowerCase();
  const isBasicUser = usernameNormalized === 'user';
  const isManagerUser = usernameNormalized === 'manger' || usernameNormalized === 'manager';
  const isAuditorUser = usernameNormalized === 'auditor';
  const effectiveNavigation = isAuditorUser
    ? navigation.filter((item) => ['Security Reports & Analytics'].includes(item.name))
    : isManagerUser
      ? navigation.filter((item) => ['Dashboard', 'Policies', 'View Policies'].includes(item.name))
      : isBasicUser
        ? navigation.filter((item) => item.name !== 'Classic')
        : navigation;

  // Debug: Log the navigation items being rendered
  console.log('Navigation items:', effectiveNavigation);
  console.log('Current user role:', user?.role);
  console.log('User object:', user);
  console.log('Updated Layout component loaded - new navigation should be visible');

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex flex-shrink-0 items-center px-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">LetsFlyLK Aware</span>
              </div>

              <nav className="mt-5 h-full flex-1 space-y-1 px-2">
                {effectiveNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto px-4 py-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">LetsFlyLK Aware</span>
            </div>

            <nav className="mt-5 flex-1 space-y-1 px-2">
              {effectiveNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto px-4 py-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </button>

              {/* Settings */}
              <Link to="/profile" className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-6 w-6" />
              </Link>

              {/* User menu */}
              <div className="flex items-center gap-x-4">
                <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"></div>
                <div className="flex items-center gap-x-4">
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold leading-6 text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs leading-5 text-gray-500 capitalize">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
