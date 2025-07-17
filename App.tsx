
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InternLayout from './pages/InternDashboard/InternLayout';
import AdminLayout from './pages/AdminDashboard/AdminLayout';
import InternOverviewPage from './pages/InternDashboard/InternOverviewPage';
import InternTasksPage from './pages/InternDashboard/InternTasksPage';
import InternAnalyticsPage from './pages/InternDashboard/InternAnalyticsPage';
import InternLeavePage from './pages/InternDashboard/InternLeavePage';
import InternProfilePage from './pages/InternDashboard/InternProfilePage';
import InternResourcesPage from './pages/InternDashboard/InternResourcesPage';
import InternLeaderboardPage from './pages/InternDashboard/InternLeaderboardPage';
import AdminOverviewPage from './pages/AdminDashboard/AdminOverviewPage';
import AdminTaskManagementPage from './pages/AdminDashboard/AdminTaskManagementPage';
import AdminInternManagementPage from './pages/AdminDashboard/AdminInternManagementPage';
import AdminResourcesPage from './pages/AdminDashboard/AdminResourcesPage';
import AdminAnalyticsPage from './pages/AdminDashboard/AdminAnalyticsPage';
import AdminAnnouncementsPage from './pages/AdminDashboard/AdminAnnouncementsPage';
import AdminInternProfilePage from './pages/AdminDashboard/AdminInternProfilePage'; // New
import { useAuth } from './contexts/AuthContext';
import AdminQueriesPage from './pages/AdminDashboard/AdminQueriesPage';
import AdminLeaveManagementPage from './pages/AdminDashboard/AdminLeaveManagementPage';
import AdminManagementPage from './pages/AdminDashboard/AdminManagementPage';
import RoleDefinitionsPage from './pages/AdminDashboard/RoleDefinitionsPage';
import ChangePasswordModal from './components/auth/ChangePasswordModal';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0B1A33] text-[#4FB1E2]">
        <div className="relative w-28 h-28">
          {/* Arcs */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="5" strokeDasharray="212 283" strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
          </div>
           <div className="absolute inset-0 animate-spin-reverse" style={{ animationDuration: '3s' }}>
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="37" stroke="currentColor" strokeWidth="5" strokeDasharray="174 232" strokeLinecap="round" transform="rotate(90 50 50)" />
            </svg>
          </div>
          
          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-20 h-20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="3"/>
              <path d="M20 31L27 38L42 23" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h1 className="mt-8 text-xl font-bold tracking-[0.4em] text-[#4FB1E2] uppercase">AcoVision</h1>
      </div>
    );
  }

  return (
    <>
      {user && user.mustChangePassword && <ChangePasswordModal />}
      <Routes>
        <Route path="/login" element={user && !user.mustChangePassword ? <Navigate to={user.role === 'admin' || user.role === 'super_admin' ? '/admin/overview' : '/intern/overview'} /> : <LoginPage />} />
        
        <Route path="/intern" element={user && user.role === 'intern' && !user.mustChangePassword ? <InternLayout /> : <Navigate to="/login" />} >
          <Route path="overview" element={<InternOverviewPage />} />
          <Route path="tasks" element={<InternTasksPage />} />
          <Route path="analytics" element={<InternAnalyticsPage />} />
          <Route path="leave" element={<InternLeavePage />} />
          <Route path="profile" element={<InternProfilePage />} />
          <Route path="resources" element={<InternResourcesPage />} /> 
          <Route path="leaderboard" element={<InternLeaderboardPage />} />
          <Route index element={<Navigate to="overview" />} />
        </Route>

        <Route path="/admin" element={user && (user.role === 'admin' || user.role === 'super_admin') && !user.mustChangePassword ? <AdminLayout /> : <Navigate to="/login" />} >
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="tasks" element={<AdminTaskManagementPage />} />
          <Route path="interns" element={<AdminInternManagementPage />} />
          <Route path="interns/:internId" element={<AdminInternProfilePage />} />
          <Route path="queries" element={<AdminQueriesPage />} />
          <Route path="leave" element={<AdminLeaveManagementPage />} />
          <Route path="resources" element={<AdminResourcesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
          <Route path="manage-admins" element={<AdminManagementPage />} />
          <Route path="roles" element={<RoleDefinitionsPage />} />
          <Route index element={<Navigate to="overview" />} />
        </Route>
        
        <Route path="*" element={<Navigate to={user && !user.mustChangePassword ? (user.role === 'admin' || user.role === 'super_admin' ? '/admin/overview' : '/intern/overview') : '/login'} />} />
      </Routes>
    </>
  );
};

export default App;