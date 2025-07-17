
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import Header from '../../components/shared/Header';
import { Icons } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const InternLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== UserRole.INTERN) return null; 

  const internNavItems = [
    { to: '/intern/overview', label: 'Overview', icon: Icons.Dashboard },
    { to: '/intern/tasks', label: 'My Tasks', icon: Icons.Tasks },
    { to: '/intern/analytics', label: 'My Progress', icon: Icons.Analytics },
    { to: '/intern/leaderboard', label: 'Leaderboard', icon: Icons.Leaderboard },
    { to: '/intern/resources', label: 'Resources', icon: Icons.Resources },
    { to: '/intern/leave', label: 'Leave & Breaks', icon: Icons.Leave },
    { to: '/intern/profile', label: 'My Profile', icon: Icons.Profile },
  ];
  
  const currentPath = location.pathname; 
  const currentPage = internNavItems.find(item => item.to === currentPath);
  const pageTitle = currentPage ? currentPage.label : 'Digital Marketing Dashboard';


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navItems={internNavItems} />
      <div className="flex-1 flex flex-col ml-64"> 
        <Header title={pageTitle} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InternLayout;
