
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Card from '../../components/shared/Card';
import { Task, TaskStatus, InternProfile, PunchStatus, PunchLog } from '../../types';
import { Link } from 'react-router-dom';
import Button from '../../components/shared/Button';
import { Icons } from '../../constants';
import RealTimeClock from '../../components/shared/RealTimeClock';
import { usersStore } from '../../services/authService';
import AdminStatusWidget from '../../components/intern/AdminStatusWidget';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "yesterday";
    return `${diffInDays} days ago`;
};


const InternOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { getTasksForIntern, getInternById, announcements, punchLogs, punchIn, punchOut } = useData();
  const [internProfile, setInternProfile] = useState<InternProfile | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  
  // Punch state
  const [punchStatus, setPunchStatus] = useState<PunchStatus | undefined>();
  const [isLoadingPunch, setIsLoadingPunch] = useState<boolean>(false);

  useEffect(() => {
    if(user) {
        const logForStatus = punchLogs.find(p => p.internId === user.id && !p.punchOutTime);
        setPunchStatus(logForStatus ? PunchStatus.PUNCHED_IN : PunchStatus.PUNCHED_OUT);
    }
  }, [punchLogs, user]);

  const handlePunch = async () => {
    if (!user) return;
    setIsLoadingPunch(true);
    try {
      if (punchStatus === PunchStatus.PUNCHED_OUT) {
        await punchIn(user.id);
      } else {
        await punchOut(user.id);
      }
    } catch (error) {
      console.error("Punch action failed:", error);
    } finally {
      setIsLoadingPunch(false);
    }
  };

  const getDayOfWeek = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long' });
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const isSameWeek = (d1: Date, d2: Date) => {
      const startOfWeek = new Date(d1);
      startOfWeek.setDate(d1.getDate() - d1.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return d2 >= startOfWeek && d2 <= endOfWeek;
  };
   const isSameMonth = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();

  const timeMetrics = useMemo(() => {
    if (!user) return { today: 0, week: 0, month: 0 };
    const now = new Date();
    const todayLogs = punchLogs.filter(p => p.internId === user.id && isSameDay(new Date(p.date), now));
    const weekLogs = punchLogs.filter(p => p.internId === user.id && isSameWeek(now, new Date(p.date)));
    const monthLogs = punchLogs.filter(p => p.internId === user.id && isSameMonth(now, new Date(p.date)));
    
    const sumMinutes = (logs: PunchLog[]) => logs.reduce((sum, log) => sum + (log.workDurationMinutes || 0), 0);

    return {
      today: sumMinutes(todayLogs),
      week: sumMinutes(weekLogs),
      month: sumMinutes(monthLogs),
    };
  }, [punchLogs, user]);

  const allTasks = useMemo(() => user ? getTasksForIntern(user.id) : [], [user, getTasksForIntern]);

  const projectProgress = useMemo(() => {
    if(allTasks.length === 0) return 0;
    const completed = allTasks.filter(t => t.status === TaskStatus.VALIDATED).length;
    return Math.round((completed / allTasks.length) * 100);
  }, [allTasks]);

  useEffect(() => {
    if (user) {
      const profile = getInternById(user.id) as InternProfile;
      setInternProfile(profile);
      
      const tasks = allTasks;
      const activeTask = tasks.find(t => t.status === TaskStatus.ONGOING) || tasks.find(t => t.status === TaskStatus.PENDING) || tasks.find(t => t.status === TaskStatus.ASSIGNED);
      setCurrentTask(activeTask || null);

      if(activeTask) {
        const activeIndex = tasks.findIndex(t => t.id === activeTask.id);
        setUpcomingTasks(tasks.slice(activeIndex + 1, activeIndex + 3));
      } else {
        setUpcomingTasks(tasks.slice(0, 2));
      }
    }
  }, [user, getInternById, allTasks]);

  if (!user || !internProfile) {
    return <div className="text-center p-8">Loading intern data...</div>;
  }
  
  const relevantAnnouncements = announcements.filter(
    a => a.audience === 'all' || (Array.isArray(a.audience) && a.audience.includes(user.id))
  ).slice(0, 3);
  
  const weeklyTaskGoal = 15;
  const weeklyHourGoal = 40;
  const weeklyTasksCompleted = allTasks.filter(t => t.status === TaskStatus.VALIDATED && isSameWeek(new Date(), new Date(t.completedAt!))).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <span className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center text-xl">{getInitials(internProfile.name)}</span>
                    Ready to make an impact, {internProfile.name.split(' ')[0]}?
                </h2>
                <p className="mt-1 text-indigo-200">Let's have a productive day ahead.</p>
            </div>
            <RealTimeClock isWelcomeBanner={true} />
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center text-sm font-medium text-indigo-200 mb-1">
                <span>Today's Progress</span>
                <span>{projectProgress}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2.5">
                <div className="bg-white h-2.5 rounded-full" style={{ width: `${projectProgress}%` }}></div>
            </div>
        </div>
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Tracking */}
                <Card title="Time Tracking" bodyClassName="flex flex-col">
                   <div className="flex-grow flex items-center justify-between">
                        <Button
                            onClick={handlePunch}
                            variant={punchStatus === PunchStatus.PUNCHED_IN ? 'danger' : 'primary'}
                            size="lg"
                            disabled={isLoadingPunch}
                            className="w-32"
                        >
                            {isLoadingPunch ? '...' : (punchStatus === PunchStatus.PUNCHED_IN ? 'Punch Out' : 'Punch In')}
                        </Button>
                        <div className="text-right">
                           <p className="text-3xl font-bold text-gray-800">{(timeMetrics.today / 60).toFixed(1)}h</p>
                           <p className="text-sm text-gray-500">Today</p>
                        </div>
                   </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-around text-center">
                        <div>
                            <p className="font-semibold text-gray-700">{(timeMetrics.week / 60).toFixed(1)}h</p>
                            <p className="text-xs text-gray-500">This Week</p>
                        </div>
                         <div>
                            <p className="font-semibold text-gray-700">{(timeMetrics.month / 60).toFixed(1)}h</p>
                            <p className="text-xs text-gray-500">This Month</p>
                        </div>
                    </div>
                </Card>

                {/* Announcements */}
                 <Card title="Announcements" actions={<Link to="#" className="text-sm text-primary-600 font-semibold hover:underline">View All</Link>}>
                    <div className="space-y-4">
                        {relevantAnnouncements.map(ann => {
                            const adminUser = usersStore.current.find(u => u.id === ann.postedBy);
                            return (
                                <div key={ann.id} className="flex items-start gap-3">
                                    <img src={adminUser?.avatarUrl} alt={adminUser?.name} className="w-9 h-9 rounded-full mt-1"/>
                                    <div>
                                        <p className="font-semibold text-gray-800">{ann.title}</p>
                                        <p className="text-sm text-gray-600 line-clamp-2">{ann.content}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(ann.createdAt)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Current Task */}
             <Card title="Current Task">
              {currentTask ? (
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">{currentTask.title}</h3>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700">{currentTask.status}</span>
                  </div>
                  <p className="text-gray-600 mt-2 mb-4">{currentTask.description}</p>
                  <div className="mb-4">
                      <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                  </div>
                  <div className="flex justify-between items-center">
                     <Link to="/intern/tasks">
                        <Button size="sm" variant="ghost">View Task Details</Button>
                      </Link>
                      <p className="text-sm text-gray-500">Due: {currentTask.deadline ? new Date(currentTask.deadline).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No active tasks. Great job catching up!</p>
              )}
            </Card>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
            <AdminStatusWidget />
            {/* Upcoming Tasks */}
            <Card title="Upcoming Tasks" actions={<Link to="/intern/tasks" className="text-sm text-primary-600 font-semibold hover:underline">View All</Link>}>
                <div className="space-y-4">
                    {upcomingTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-4">
                             <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Icons.Tasks className="w-6 h-6 text-gray-500" />
                             </div>
                             <div>
                                <p className="font-semibold text-gray-800">{task.title}</p>
                                <p className="text-sm text-gray-500">{task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}` : 'No due date'}</p>
                             </div>
                        </div>
                    ))}
                    {upcomingTasks.length === 0 && <p className="text-gray-500 text-center py-4">No upcoming tasks.</p>}
                </div>
            </Card>

            {/* Quick Links */}
            <Card title="Quick Links">
                 <div className="grid grid-cols-2 gap-4">
                    <Link to="/intern/tasks" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-primary-50 rounded-lg transition-colors">
                        <Icons.Tasks className="w-8 h-8 text-primary-600 mb-2"/>
                        <span className="font-semibold text-gray-700">My Tasks</span>
                    </Link>
                     <Link to="/intern/analytics" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-secondary-50 rounded-lg transition-colors">
                        <Icons.Analytics className="w-8 h-8 text-secondary-600 mb-2"/>
                        <span className="font-semibold text-gray-700">My Progress</span>
                    </Link>
                     <Link to="/intern/leaderboard" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors">
                        <Icons.Leaderboard className="w-8 h-8 text-green-600 mb-2"/>
                        <span className="font-semibold text-gray-700">Leaderboard</span>
                    </Link>
                     <Link to="/intern/resources" className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-yellow-50 rounded-lg transition-colors">
                        <Icons.Resources className="w-8 h-8 text-yellow-600 mb-2"/>
                        <span className="font-semibold text-gray-700">Resources</span>
                    </Link>
                 </div>
            </Card>

             {/* Weekly Summary */}
            <Card title="Weekly Summary">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700">Tasks Completed</span>
                            <span className="text-gray-500">{weeklyTasksCompleted}/{weeklyTaskGoal}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{width: `${(weeklyTasksCompleted/weeklyTaskGoal)*100}%`}}></div></div>
                    </div>
                     <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700">Hours Logged</span>
                            <span className="text-gray-500">{(timeMetrics.week/60).toFixed(1)}/{weeklyHourGoal}h</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: `${((timeMetrics.week/60)/weeklyHourGoal)*100}%`}}></div></div>
                    </div>
                     <div>
                        <div className="flex justify-between text-sm font-medium mb-1">
                            <span className="text-gray-700">Project Progress</span>
                            <span className="text-gray-500">{projectProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{width: `${projectProgress}%`}}></div></div>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default InternOverviewPage;
