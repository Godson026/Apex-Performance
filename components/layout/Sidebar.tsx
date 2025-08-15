
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../../constants';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const baseClasses = "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02]";
  // Updated active classes:
  // - Background changed from bg-primary-DEFAULT to bg-primary-dark for better contrast with text-white.
  // - Shadow color updated to match primary-dark (violet-600: rgb(124, 58, 237)).
  const activeClasses = "bg-primary-dark text-white shadow-[0_0_15px_3px_rgba(124,58,237,0.4)] dark:shadow-[0_0_15px_3px_rgba(124,58,237,0.5)] scale-[1.02]";
  const inactiveClasses = "hover:bg-primary-light/20 dark:hover:bg-primary-dark/30 text-light-text-secondary dark:text-dark-text-secondary";

  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const iconClass = "w-5 h-5";

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      <aside
        className={`fixed lg:relative lg:translate-x-0 h-full w-64 shrink-0 bg-light-sidebar dark:bg-dark-sidebar p-4 border-r border-light-border dark:border-dark-border flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between py-4">
          <ICONS.APP_LOGO_ICON className="h-28 w-auto" />
           <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-light-text-secondary dark:text-dark-text-secondary"
            aria-label="Close sidebar"
          >
            <ICONS.CLOSE className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-grow space-y-2">
          <NavItem to="/dashboard" icon={<ICONS.DASHBOARD className={iconClass} />} label="Dashboard" />
          <NavItem to="/new-trade" icon={<ICONS.NEW_TRADE className={iconClass} />} label="Log New Trade" />
          <NavItem to="/trades" icon={<ICONS.TRADES_LIST className={iconClass} />} label="All Trades" />
          <NavItem to="/accounts" icon={<ICONS.ACCOUNTS className={iconClass} />} label="Accounts" />
          <NavItem to="/playbooks" icon={<ICONS.PLAYBOOKS className={iconClass} />} label="Playbooks" />
          <NavItem to="/calendar" icon={<ICONS.CALENDAR className={iconClass} />} label="Calendar View" />
          <NavItem to="/learning-hub" icon={<ICONS.LEARNING_HUB className={iconClass} />} label="Learning Hub" />
          <NavItem to="/insights" icon={<ICONS.INSIGHTS className={iconClass} />} label="Insights" />
          <NavItem to="/price-action-log" icon={<ICONS.NOTE_ICON className={iconClass} />} label="Price Action Log" />
        </nav>
        <div className="mt-auto">
          <NavItem to="/settings" icon={<ICONS.SETTINGS className={iconClass} />} label="Settings" />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
