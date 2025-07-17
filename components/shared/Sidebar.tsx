import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME, Icons } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-primary-700 to-primary-900 text-white flex flex-col shadow-lg fixed">
      <div className="p-4 border-b border-primary-600">
        <div className="flex items-center space-x-3">
          <Icons.CheckCircle className="w-10 h-10 text-secondary-300" />
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        </div>
      </div>

      <nav className="flex-grow p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-primary-600/50 ${
                isActive ? 'bg-primary-600 shadow-md text-white font-semibold' : 'hover:text-secondary-200'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-600">
        {user && (
          <div className="flex items-center space-x-3 mb-4 p-3 bg-primary-800 rounded-lg">
            <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} className="w-10 h-10 rounded-full border-2 border-secondary-300"/>
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-primary-300 capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left hover:bg-red-500 hover:text-white transition-colors duration-200"
        >
          <Icons.Logout className="w-6 h-6" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;