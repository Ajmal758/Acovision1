import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';

const AdminStatusControlWidget: React.FC = () => {
  const { adminStatus, toggleAdminAvailability } = useData();

  const formatTimeAgo = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Admin Status</h3>
          <p className="text-sm text-gray-500">Set your availability for interns</p>
        </div>
        <span className={`px-4 py-1 text-sm font-semibold rounded-full ${!adminStatus.isAvailableForQueries ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {!adminStatus.isAvailableForQueries ? 'Busy' : 'Available'}
        </span>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-3 ${!adminStatus.isAvailableForQueries ? 'bg-red-500' : 'bg-green-500'}`}></span>
          <span className="font-semibold text-gray-700">{!adminStatus.isAvailableForQueries ? 'Busy - not available' : 'Available for queries'}</span>
        </div>
        <button onClick={() => toggleAdminAvailability()} className={`w-14 h-7 rounded-full p-1 flex items-center transition-colors duration-300 ${adminStatus.isAvailableForQueries ? 'bg-primary-600' : 'bg-gray-300'}`} role="switch" aria-checked={adminStatus.isAvailableForQueries}>
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${adminStatus.isAvailableForQueries ? 'translate-x-7' : ''}`}></div>
        </button>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800">Current Queue</h4>
            <Link to="/admin/queries">
                <Button variant="primary" size="sm">View All</Button>
            </Link>
        </div>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {adminStatus.queue.length > 0 ? adminStatus.queue.map((item, index) => (
            <div key={`${item.internId}-${index}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full mr-3"></span>
                <p className="text-gray-800 font-medium">{item.internName} from {item.department}</p>
              </div>
              <p className="text-sm text-gray-500">{formatTimeAgo(item.queuedAt)}</p>
            </div>
          )) : (
              <p className="text-sm text-gray-500 text-center py-4">The queue is empty.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminStatusControlWidget;