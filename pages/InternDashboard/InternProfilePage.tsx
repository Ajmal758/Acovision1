
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { InternProfile, Task, TaskStatus } from '../../types';
import Card from '../../components/shared/Card';
import { Icons } from '../../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface RankedInternForProfile extends InternProfile {
  rank?: number;
}

const InternProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { getInternById, getTasksForIntern, interns: allInterns } = useData(); // Added allInterns for rank calculation
  const [profile, setProfile] = useState<RankedInternForProfile | null>(null);
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);
  const [ongoingTasksCount, setOngoingTasksCount] = useState<number>(0);

  const currentUserRank = useMemo(() => {
    if (!allInterns || allInterns.length === 0 || !user) return undefined;
    const ranked = allInterns
      .map(intern => {
        const score = (intern.performanceMetrics.accuracy || 0) + 
                      ((intern.performanceMetrics.speed || 0) * 10) + 
                      (intern.performanceMetrics.participation || 0);
        return { ...intern, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((intern, index) => ({ ...intern, rank: index + 1 }));
    return ranked.find(i => i.id === user.id)?.rank;
  }, [allInterns, user]);

  useEffect(() => {
    if (user) {
      const internProfile = getInternById(user.id) as InternProfile;
      if (internProfile) {
        setProfile({ ...internProfile, rank: currentUserRank });
        const tasks = getTasksForIntern(internProfile.id);
        setCompletedTasksCount(tasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VALIDATED).length);
        setOngoingTasksCount(tasks.filter(t => t.status === TaskStatus.ONGOING || t.status === TaskStatus.PENDING || t.status === TaskStatus.ASSIGNED).length);
      }
    }
  }, [user, getInternById, getTasksForIntern, currentUserRank]);

  if (!profile) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  const performanceMetricsData = [
    { name: 'Speed (Tasks/Wk)', value: profile.performanceMetrics.speed, fill: COLORS[0] },
    { name: 'Accuracy (%)', value: profile.performanceMetrics.accuracy, fill: COLORS[1] },
    { name: 'Participation (Score)', value: profile.performanceMetrics.participation, fill: COLORS[2] },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <img 
            src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.name}&background=random&size=128`} 
            alt={profile.name} 
            className="w-32 h-32 rounded-full border-4 border-primary-500 shadow-lg"
          />
          <div className="flex-grow">
            <h2 className="text-3xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-primary-600 font-medium">{profile.specialization} Intern</p>
            <p className="text-gray-600 text-sm mt-1">{profile.email}</p>
            <p className="text-gray-500 text-xs">Joined: {new Date(profile.joinDate).toLocaleDateString()}</p>
          </div>
          {profile.rank && (
            <Link to="/intern/leaderboard" className="text-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition">
                <p className="text-sm text-secondary-700">Your Rank</p>
                <p className="text-4xl font-bold text-secondary-600">#{profile.rank}</p>
            </Link>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Task Summary">
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <Icons.CheckCircle className="w-6 h-6 text-green-500 mr-2"/>
                        <span className="text-green-700 font-medium">Tasks Completed/Validated</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">{completedTasksCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg shadow-sm">
                     <div className="flex items-center">
                        <Icons.Tasks className="w-6 h-6 text-yellow-500 mr-2"/>
                        <span className="text-yellow-700 font-medium">Tasks Ongoing/Pending</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{ongoingTasksCount}</span>
                </div>
            </div>
        </Card>
        <Card title="Key Performance Metrics">
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceMetricsData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}}/>
                    <Tooltip />
                    <Bar dataKey="value" barSize={15} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
      </div>
      
      <Card title="Achievements & Badges (Coming Soon)">
        <div className="flex items-center justify-center h-32 text-gray-400">
            <Icons.Sparkles className="w-12 h-12 mr-2 animate-pulse"/>
            <p>Your achievements will shine here! Keep up the great work.</p>
        </div>
      </Card>
    </div>
  );
};

export default InternProfilePage;
