import React, { useState } from 'react';
import { Gift, Home } from 'lucide-react';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'admin-login' | 'admin-dashboard'>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Handle URL-based navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentView(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login');
      } else {
        setCurrentView('home');
      }
    };

    // Check initial URL
    handlePopState();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAdminAuthenticated]);
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setCurrentView('admin-dashboard');
    window.history.pushState(null, '', '/admin');
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentView('home');
    window.history.pushState(null, '', '/');
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    window.history.pushState(null, '', '/');
  };

  const renderView = () => {
    switch (currentView) {
      case 'admin-login':
        return <AdminLogin onLogin={handleAdminLogin} />;
      case 'admin-dashboard':
        return isAdminAuthenticated ? 
          <AdminDashboard onLogout={handleLogout} /> : 
          <AdminLogin onLogin={handleAdminLogin} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Gift className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">KuponLucky</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleHomeClick}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'home' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Beranda</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;