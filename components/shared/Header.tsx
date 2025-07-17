import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import RealTimeClock from './RealTimeClock';
import { GlobalNotification } from '../../types';
import { Icons } from '../../constants';
import { useData } from '../../contexts/DataContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead } = useData();
  const [showNotifications, setShowNotifications] = React.useState(false);

  const unreadNotifications = notifications.filter(n => !n.read && (!n.targetUser || n.targetUser === user?.id || (user?.role === 'admin' && n.targetUser === 'admin1')));
  
  return (
    <header className="bg-white shadow-md p-4 sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        <div className="flex items-center space-x-4">
          <RealTimeClock />
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-gray-600 hover:text-primary-600">
              <Icons.Announcements className="w-6 h-6" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                <div className="py-2 px-4 border-b font-semibold text-gray-700">Notifications</div>
                {unreadNotifications.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto">
                    {unreadNotifications.map(n => (
                      <li key={n.id} className={`p-3 border-b hover:bg-gray-50 text-sm ${n.type === 'ping' ? 'bg-yellow-50' : ''}`}>
                        <p className="text-gray-700">{n.message}</p>
                        <div className="flex justify-between items-center mt-1">
                           <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                           <button onClick={() => markNotificationAsRead(n.id)} className="text-xs text-primary-500 hover:underline">Mark as read</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-sm text-gray-500">No new notifications.</p>
                )}
              </div>
            )}
          </div>
          {user && (
            <img 
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border-2 border-primary-500"
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;