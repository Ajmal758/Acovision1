
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import Header from '../../components/shared/Header';
import { Icons } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) return null;

  const adminNavItems = [
    { to: '/admin/overview', label: 'Dashboard', icon: Icons.Dashboard },
    { to: '/admin/tasks', label: 'Task Management', icon: Icons.Tasks },
    { to: '/admin/interns', label: 'Interns & Batches', icon: Icons.Users },
    { to: '/admin/queries', label: 'Queries', icon: Icons.Messages },
    { to: '/admin/leave', label: 'Leave Requests', icon: Icons.Leave },
    { to: '/admin/announcements', label: 'Announcements', icon: Icons.Announcements },
    { to: '/admin/resources', label: 'Resources', icon: Icons.Resources },
    { to: '/admin/analytics', label: 'Performance', icon: Icons.Analytics },
  ];

  if (user.role === UserRole.SUPER_ADMIN) {
    adminNavItems.push({ to: '/admin/manage-admins', label: 'Manage Admins', icon: Icons.Team });
    adminNavItems.push({ to: '/admin/roles', label: 'Role Definitions', icon: Icons.Trophy });
  }

  const currentPath = location.pathname;
  let pageTitle;

  if (currentPath.includes('/admin/interns/')) {
    pageTitle = 'Intern Profile';
  } else {
    const currentPage = adminNavItems.find(item => currentPath.startsWith(item.to));
    pageTitle = currentPage ? currentPage.label : 'Admin Dashboard';
  }


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navItems={adminNavItems} />
      <div className="flex-1 flex flex-col ml-64">
        <Header title={pageTitle} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
