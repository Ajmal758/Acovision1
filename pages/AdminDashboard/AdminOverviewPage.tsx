import React from 'react';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/shared/Card';
import { TaskStatus, LeaveStatus } from '../../types';
import { Link } from 'react-router-dom';
import Button from '../../components/shared/Button';
import { Icons } from '../../constants';
import LeaderboardWidget from '../../components/admin/LeaderboardWidget';
import AdminStatusControlWidget from '../../components/admin/AdminStatusControlWidget';


const AdminOverviewPage: React.FC = () => {
  const { interns, tasks, leaveRequests, announcements, batches } = useData();

  const totalInterns = interns.length;
  const activeTasks = tasks.filter(t => t.status === TaskStatus.ONGOING || t.status === TaskStatus.PENDING).length;
  const completedToday = tasks.filter(t => t.status === TaskStatus.VALIDATED && t.completedAt && new Date(t.completedAt).toDateString() === new Date().toDateString()).length;
  const pendingLeaveRequests = leaveRequests.filter(lr => lr.status === LeaveStatus.PENDING).length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Interns" className="text-center">
          <p className="text-5xl font-bold text-primary-600">{totalInterns}</p>
          <Link to="/admin/interns" className="mt-2 inline-block">
            <Button size="sm" variant="ghost">Manage Interns</Button>
          </Link>
        </Card>
        <Card title="Active Tasks" className="text-center">
          <p className="text-5xl font-bold text-secondary-600">{activeTasks}</p>
           <Link to="/admin/tasks" className="mt-2 inline-block">
            <Button size="sm" variant="ghost">View Tasks</Button>
          </Link>
        </Card>
        <Card title="Tasks Validated Today" className="text-center">
          <p className="text-5xl font-bold text-green-600">{completedToday}</p>
        </Card>
        <Card title="Pending Leave Requests" className="text-center">
          <p className="text-5xl font-bold text-yellow-600">{pendingLeaveRequests}</p>
          <Link to="/admin/leave" className="mt-2 inline-block">
            <Button size="sm" variant="ghost">Manage Requests</Button>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <LeaderboardWidget interns={interns} batches={batches} tasks={tasks} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <AdminStatusControlWidget />
          <Card title="Recent Announcements" >
             {announcements.slice(0,2).map(ann => (
                 <div key={ann.id} className="py-2 border-b last:border-0">
                     <h4 className="font-semibold text-gray-700">{ann.title}</h4>
                     <p className="text-sm text-gray-500 truncate">{ann.content}</p>
                     <p className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</p>
                 </div>
             ))}
             {announcements.length === 0 && <p className="text-gray-500">No announcements yet.</p>}
             <Link to="/admin/announcements" className="mt-4 block">
                <Button variant="primary" size="sm" leftIcon={Icons.PlusCircle}>New Announcement</Button>
             </Link>
          </Card>
        </div>
      </div>
       
    </div>
  );
};

export default AdminOverviewPage;