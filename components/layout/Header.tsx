

import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import ToggleSwitch from '../ui/ToggleSwitch';
import { APP_NAME, ICONS } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); 
  };

  const displayName = currentUser?.user_metadata?.username || currentUser?.email || "User";

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border shadow-sm shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar} 
          className="lg:hidden mr-4 text-light-text dark:text-dark-text"
          aria-label="Open sidebar"
        >
          <ICONS.MENU className="w-6 h-6"/>
        </button>
        <Link to={currentUser ? "/dashboard" : "/"}> {/* Landing page if not logged in */}
          <h1 className="text-lg sm:text-xl font-semibold text-primary-DEFAULT">{APP_NAME}</h1>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {currentUser ? (
          <>
            <Link to="/new-trade">
              <Button size="sm" variant="primary" className="hidden sm:flex items-center">
                <ICONS.NEW_TRADE className="w-4 h-4 mr-1.5" />
                New Trade
              </Button>
            </Link>
            <ToggleSwitch
              id="themeToggleHeader"
              isOn={theme === 'dark'}
              handleToggle={toggleTheme}
              onIcon={<ICONS.MOON className="w-4 h-4 text-primary-DEFAULT" />}
              offIcon={<ICONS.SUN className="w-4 h-4 text-slate-500" />}
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary hidden md:inline" title={currentUser.email}>
                Welcome, {displayName}!
              </span>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </>
        ) : (
          <>
             <ToggleSwitch
              id="themeToggleHeaderPublic"
              isOn={theme === 'dark'}
              handleToggle={toggleTheme}
              onIcon={<ICONS.MOON className="w-4 h-4 text-primary-DEFAULT" />}
              offIcon={<ICONS.SUN className="w-4 h-4 text-slate-500" />}
            />
            {/* Login/Signup buttons are now on LandingPageHeader for unauthenticated users */}
            {/* We can keep them here as a fallback if LandingPageHeader is not always rendered */}
            {/* <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Sign Up</Button>
            </Link> */}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;