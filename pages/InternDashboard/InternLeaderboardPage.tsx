import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { InternProfile, Task, TaskStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface RankedIntern extends InternProfile {
  rank: number;
  performanceScore: number;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
];

const progressColors = [
    '#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'
];

const getRankCircleClass = (rank: number) => {
    switch(rank) {
        case 1: return 'bg-yellow-400 border-yellow-500 text-yellow-800';
        case 2: return 'bg-gray-300 border-gray-400 text-gray-700';
        case 3: return 'bg-orange-400 border-orange-500 text-orange-800';
        default: return 'bg-gray-200 border-gray-300 text-gray-600';
    }
}

const InternLeaderboardPage: React.FC = () => {
  const { interns, getBatchById, getInternById, tasks } = useData();
  const { user } = useAuth();
  
  const internProfile = useMemo(() => {
    if (!user) return null;
    return getInternById(user.id);
  }, [user, getInternById]);
  
  const batchName = useMemo(() => {
      if (!internProfile?.batchId) return "Your Batch";
      return getBatchById(internProfile.batchId)?.name || "Your Batch";
  }, [internProfile, getBatchById]);


  const rankedInterns = useMemo((): RankedIntern[] => {
    if (!interns || interns.length === 0 || !internProfile?.batchId) return [];

    return interns
      .filter(intern => intern.batchId === internProfile.batchId)
      .map(intern => {
        const internTasks = tasks.filter(t => t.assignedTo === intern.id && t.status === TaskStatus.VALIDATED);
        const score = internTasks.reduce((acc, task) => acc + (task.awardedPoints || 0), 0);
        return {
          ...intern,
          performanceScore: score,
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .map((intern, index) => ({
        ...intern,
        rank: index + 1,
      }));
  }, [interns, internProfile, tasks]);

  const maxScore = useMemo(() => {
    if (rankedInterns.length === 0) return 1;
    const topScore = rankedInterns[0].performanceScore;
    // Use top intern's score as the max, ensure it's at least 10 to provide a reasonable scale for low scores.
    return Math.max(10, topScore);
  }, [rankedInterns]);

  if (!internProfile) {
    return (
       <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto p-6 text-center text-gray-500">
            Loading your leaderboard...
       </div>
    );
  }

  if (!internProfile.batchId) {
     return (
       <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto p-6 text-center text-gray-500">
            <h1 className="text-xl font-bold text-gray-800 mb-2">Leaderboard Not Available</h1>
            <p>You are not currently assigned to a batch, so there is no leaderboard to display.</p>
       </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 bg-indigo-600 text-white">
        <h1 className="text-2xl font-bold">{batchName} Leaderboard</h1>
        <p className="text-indigo-200">Performance Points Ranking</p>
      </div>

      <div className="px-4 md:px-6 py-6 space-y-2">
        {rankedInterns.length > 0 ? rankedInterns.map((intern, index) => (
            <div key={intern.id} className="grid grid-cols-12 items-center gap-4 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Rank & Avatar */}
                <div className="col-span-2 flex items-center gap-3 sm:gap-4">
                    <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 font-bold text-sm rounded-full border-2 ${getRankCircleClass(intern.rank)}`}>
                        {intern.rank}
                    </span>
                    <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${avatarColors[index % avatarColors.length]}`}>
                        {getInitials(intern.name)}
                    </div>
                </div>

                {/* Name, Score Label, Progress Bar */}
                <div className="col-span-7">
                    <p className="font-semibold text-gray-800 truncate">{intern.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Performance Points</p>
                     <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div 
                            className="h-1.5 rounded-full" 
                            style={{ 
                                width: `${(intern.performanceScore / maxScore) * 100}%`,
                                backgroundColor: progressColors[index % progressColors.length],
                                transition: 'width 0.5s ease-in-out'
                            }}
                        ></div>
                    </div>
                </div>

                {/* Change & Score */}
                <div className="col-span-3 text-right">
                    <span className={`font-semibold text-sm ${intern.performanceMetrics.performanceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {intern.performanceMetrics.performanceChange >= 0 ? '+' : ''}{intern.performanceMetrics.performanceChange}%
                    </span>
                    <p className="font-bold text-lg text-gray-800 mt-1">{intern.performanceScore} pts</p>
                </div>
            </div>
        )) : (
            <div className="text-center py-12 text-gray-500">
                <p>There are no ranked interns in your batch yet.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default InternLeaderboardPage;