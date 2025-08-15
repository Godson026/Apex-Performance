

import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PageWrapper from './components/layout/PageWrapper';
import DashboardPage from './pages/DashboardPage';
import NewTradePage from './pages/NewTradePage';
import TradesPage from './pages/TradesPage';
import AccountsPage from './pages/AccountsPage';
import PlaybooksPage from './pages/PlaybooksPage';
import LearningHubPage from './pages/LearningHubPage';
import PriceActionLogPage from './pages/PriceActionLogPage';
// import DriverAnalysisPage from './pages/DriverAnalysisPage'; // Removed
import SettingsPage from './pages/SettingsPage';
import InsightsPage from './pages/InsightsPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import Spinner from './components/ui/Spinner';
import LandingPage from './pages/LandingPage'; // Import the new LandingPage
import FeaturesPage from './pages/FeaturesPage'; // Import the new FeaturesPage
import { Analytics } from '@vercel/analytics/react';

const App: React.FC = () => {
  const { theme } = useTheme();
  const { currentUser, isLoadingAuth } = useAuth(); // Added currentUser
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const isSpecialPage = 
    location.pathname === '/' || 
    location.pathname === '/features' || 
    location.pathname === '/login' || 
    location.pathname === '/signup' || 
    location.pathname === '/forgot-password';

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-light-background dark:bg-dark-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text overflow-hidden`}>
      {!isSpecialPage && currentUser && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      <div className={`flex-1 flex flex-col overflow-hidden`}>
        {!isSpecialPage && currentUser && <Header onToggleSidebar={() => setIsSidebarOpen(true)} />}
        <main className={`${isSpecialPage ? 'flex-1 overflow-y-auto w-full' : 'flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8'}`}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            
            {/* Public Features Page */}
            <Route path="/features" element={<FeaturesPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

            {/* Protected App Routes */}
            {/* Wrap protected routes in a PageWrapper if not a special page */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><PageWrapper><DashboardPage /></PageWrapper></ProtectedRoute>}
            />
            <Route
              path="/new-trade"
              element={<ProtectedRoute><PageWrapper><NewTradePage /></PageWrapper></ProtectedRoute>}
            />
            <Route
              path="/trades"
              element={<ProtectedRoute><PageWrapper><TradesPage /></PageWrapper></ProtectedRoute>}
            />
            <Route
              path="/accounts"
              element={<ProtectedRoute><PageWrapper><AccountsPage /></PageWrapper></ProtectedRoute>}
            />
            <Route
              path="/playbooks"
              element={<ProtectedRoute><PageWrapper><PlaybooksPage /></PageWrapper></ProtectedRoute>}
            />
             <Route
              path="/learning-hub"
              element={<ProtectedRoute><PageWrapper><LearningHubPage /></PageWrapper></ProtectedRoute>}
            />
            <Route
              path="/insights"
              element={<ProtectedRoute><PageWrapper><InsightsPage /></PageWrapper></ProtectedRoute>}
            />
            <Route
              path="/calendar"
              element={<ProtectedRoute><PageWrapper><CalendarPage /></PageWrapper></ProtectedRoute>}
            />
            <Route
              path="/price-action-log"
              element={<ProtectedRoute><PageWrapper><PriceActionLogPage /></PageWrapper></ProtectedRoute>}
            />
            {/* Removed DriverAnalysisPage Route */}
            <Route
              path="/settings"
              element={<ProtectedRoute><PageWrapper><SettingsPage /></PageWrapper></ProtectedRoute>}
            />
            
            {/* Fallback: if logged in, go to dashboard, else go to landing */}
            <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/"} replace />} />
          </Routes>
        </main>
      </div>
      <Analytics />
    </div>
  );
};

export default App;