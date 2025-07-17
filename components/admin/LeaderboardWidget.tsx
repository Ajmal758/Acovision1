import React, { useMemo, useState } from 'react';
import { InternProfile, Batch, Task, TaskStatus } from '../../types';

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

interface LeaderboardWidgetProps {
    interns: InternProfile[];
    batches: Batch[];
    tasks: Task[];
    limit?: number;
}

const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({ interns, batches, tasks, limit = 7 }) => {
    const [leaderboardFilter, setLeaderboardFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const rankedAndFilteredInterns = useMemo((): RankedIntern[] => {
        if (!interns || interns.length === 0) return [];

        return interns
        .map(intern => {
            const internTasks = tasks.filter(t => t.assignedTo === intern.id && t.status === TaskStatus.VALIDATED);
            const score = internTasks.reduce((acc, task) => acc + (task.awardedPoints || 0), 0);
            return {
                ...intern,
                performanceScore: score,
            };
        })
        .filter(intern => leaderboardFilter === 'all' || intern.batchId === leaderboardFilter)
        .filter(intern => intern.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .map((intern, index) => ({
            ...intern,
            rank: index + 1,
        }));
    }, [interns, leaderboardFilter, searchTerm, tasks]);

    const maxScore = useMemo(() => {
        if (rankedAndFilteredInterns.length === 0) return 1;
        const topScore = rankedAndFilteredInterns[0].performanceScore;
        // Use top intern's score as the max, ensure it's at least 10 to provide a reasonable scale for low scores.
        return Math.max(10, topScore);
    }, [rankedAndFilteredInterns]);

    return (
         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-indigo-600 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Intern Leaderboard</h1>
                    <p className="text-indigo-200">Performance Points Ranking</p>
                </div>
                <select
                    value={leaderboardFilter}
                    onChange={e => setLeaderboardFilter(e.target.value)}
                    className="bg-indigo-500/50 border border-indigo-400 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                    <option value="all">All Batches</option>
                    {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
                </select>
            </div>
          </div>

          <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-auto flex-grow">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input 
                    type="text"
                    placeholder="Search interns..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
          </div>

          <div className="px-4 md:px-6 pb-6 space-y-2">
            {rankedAndFilteredInterns.slice(0, limit).map((intern, index) => (
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
            ))}
            {rankedAndFilteredInterns.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>No interns found matching your criteria.</p>
                </div>
            )}
          </div>
        </div>
    );
};

export default LeaderboardWidget;