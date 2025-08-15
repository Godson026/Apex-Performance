

import React from 'react';
import Card from '../components/ui/Card';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import { useTheme } from '../hooks/useTheme';
import { ICONS } from '../constants';

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text mb-6">Settings</h2>
      
      <Card title="Appearance">
        <div className="flex justify-between items-center">
          <p className="text-light-text dark:text-dark-text">Theme</p>
          <ToggleSwitch
            id="themeToggleSettings" // Unique ID
            isOn={theme === 'dark'}
            handleToggle={toggleTheme}
            onIcon={<ICONS.MOON className="w-4 h-4 text-primary-DEFAULT" />}
            offIcon={<ICONS.SUN className="w-4 h-4 text-slate-500" />} 
            label={theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          />
        </div>
      </Card>

      <Card title="Account Management (Placeholder)" className="mt-6">
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Manage your trading accounts, API keys for financial data, and other application settings here.
          (This section is a placeholder for future development).
        </p>
      </Card>
      
      <Card title="Data Management (Placeholder)" className="mt-6">
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Import/Export your trading data, manage backups, etc.
          (This section is a placeholder for future development).
        </p>
      </Card>
    </div>
  );
};

export default SettingsPage;