import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { InternProfile, Task, TaskStatus, TaskModule } from '../../types';
import { Icons, TASK_STATUS_COLORS } from '../../constants';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Sub-components for each tab ---

const AnalyticsTab: React.FC<{ intern: InternProfile; tasks: Task[] }> = ({ intern, tasks }) => {
    const overallScore = useMemo(() => {
        const moduleScoreValues = Object.values(intern.moduleScores);
        const avgModuleScore = moduleScoreValues.length > 0 ? (moduleScoreValues.reduce((a, b) => a + b, 0) / moduleScoreValues.length) * 10 : 0;
        const behaviorScore = (intern.softSkills.behavior + intern.softSkills.attitude) / 2; // avg from 1-10
        return Math.round((avgModuleScore * 0.8) + (behaviorScore * 2)); // weighted score
    }, [intern]);

    const modulePerformanceData = useMemo(() => {
        const performance: { [key in TaskModule]?: { total: number, count: number } } = {};
        tasks.forEach(task => {
            const score = intern.moduleScores[task.id];
            if (score !== undefined) {
                if (!performance[task.module]) {
                    performance[task.module] = { total: 0, count: 0 };
                }
                performance[task.module]!.total += score;
                performance[task.module]!.count += 1;
            }
        });

        return Object.entries(performance).map(([moduleName, data]) => ({
            name: moduleName,
            Score: data.total / data.count,
        }));
    }, [tasks, intern.moduleScores]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Overall Score" titleClassName="bg-gray-50" className="text-center">
                    <p className="text-5xl font-bold text-primary-600">{overallScore}<span className="text-3xl text-gray-400">/100</span></p>
                    <p className="text-sm text-green-500 mt-1 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                        {intern.performanceMetrics.performanceChange}% from last week
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Last updated: Today</p>
                </Card>
                <Card title="Attendance" titleClassName="bg-gray-50" className="text-center">
                     <p className="text-5xl font-bold text-green-600">{intern.softSkills.attendance}%</p>
                     <p className="text-sm text-green-600 mt-1 flex items-center justify-center">
                         <Icons.CheckCircle className="w-4 h-4 mr-1"/> Certificate Eligible
                     </p>
                     <p className="text-xs text-gray-400 mt-2">Last updated: Today</p>
                </Card>
                 <Card title="Engagement" titleClassName="bg-gray-50" className="text-center">
                     <p className="text-5xl font-bold text-yellow-600">{intern.performanceMetrics.participation}<span className="text-3xl text-gray-400">/100</span></p>
                     <p className="text-sm text-green-500 mt-1">
                         +2.5% from last week
                     </p>
                     <p className="text-xs text-gray-400 mt-2">Last updated: Today</p>
                </Card>
            </div>
            <Card title="Module Performance" actions={<Button size="sm" variant="ghost" leftIcon={Icons.Star}>SEO Star</Button>}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={modulePerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0,10]} />
                        <Tooltip />
                        <Bar dataKey="Score" fill="#8884d8" name="Average Score" barSize={40} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

const ModuleScoringTab: React.FC<{ intern: InternProfile; tasks: Task[]; onUpdateScore: (taskId: string, score: number) => void }> = ({ intern, tasks, onUpdateScore }) => {
    const [scores, setScores] = useState<Record<string, number>>(intern.moduleScores);
    
    useEffect(() => {
        setScores(intern.moduleScores);
    }, [intern.moduleScores]);
    
    const handleScoreChange = (taskId: string, score: number) => {
        const newScore = Math.max(0, Math.min(10, score));
        setScores(prev => ({...prev, [taskId]: newScore}));
    };

    const handleSaveChanges = () => {
        Object.entries(scores).forEach(([taskId, score]) => {
            if (intern.moduleScores[taskId] !== score) {
                onUpdateScore(taskId, score);
            }
        });
        alert('Changes saved!');
    };

    return (
        <Card title="Module Scoring (1-10 scale)" actions={<Button onClick={handleSaveChanges}>Save Changes</Button>}>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b text-left text-xs text-gray-500 uppercase">
                            <th className="py-3 px-4">Module</th>
                            <th className="py-3 px-4 w-24">Score</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-700">{task.title}</td>
                                <td className="py-3 px-4">
                                    <input 
                                        type="number" 
                                        min="0" max="10" 
                                        value={scores[task.id] || ''}
                                        onChange={(e) => handleScoreChange(task.id, parseInt(e.target.value, 10))}
                                        className="w-16 text-center border rounded-md p-1"
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${TASK_STATUS_COLORS[task.status]}`}>{task.status}</span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">{task.lastUpdated || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const RadialProgress: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={[{value: percentage}, {value: 100-percentage}]} dataKey="value" startAngle={90} endAngle={-270} innerRadius="70%" outerRadius="100%" cornerRadius={5} paddingAngle={2}>
                        <Cell fill="#4f46e5" />
                        <Cell fill="#e5e7eb" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary-700">{percentage}%</span>
        </div>
        <p className="mt-2 font-semibold text-gray-600">{label}</p>
    </div>
);


const ProgressTab: React.FC<{ intern: InternProfile; tasks: Task[] }> = ({ intern, tasks }) => {
    const eligibility = intern.softSkills.attendance > 90 ? 87 : 50; // Mocked logic

    const moduleProgress = useMemo(() => {
        const progress: { [key in TaskModule]?: { completed: number; total: number } } = {};
        Object.values(TaskModule).forEach(m => progress[m] = {completed: 0, total: 0});

        tasks.forEach(task => {
            if (progress[task.module]) {
                progress[task.module]!.total++;
                if (task.status === TaskStatus.VALIDATED) {
                    progress[task.module]!.completed++;
                }
            }
        });
        
        return Object.entries(progress)
            .filter(([, data]) => data.total > 0)
            .map(([moduleName, data]) => ({
                name: moduleName,
                percentage: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
            }));
    }, [tasks]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Certificate Eligibility">
                    <div className="flex items-center gap-6">
                        <RadialProgress percentage={eligibility} label="Current Eligibility" />
                        <div className="space-y-2">
                            <p className="flex items-center text-green-600"><Icons.CheckCircle className="w-5 h-5 mr-2"/> Attendance requirement met</p>
                            <p className="flex items-center text-green-600"><Icons.CheckCircle className="w-5 h-5 mr-2"/> Module completion on track</p>
                        </div>
                    </div>
                </Card>
                <Card title="Onboarding Checklist">
                    <div className="space-y-3">
                        <label className="flex items-center text-lg">
                            <input type="checkbox" checked={intern.onboarding.basecampAccess} readOnly className="h-5 w-5 rounded text-primary-600" />
                            <span className="ml-3 text-gray-700">Basecamp access given</span>
                        </label>
                         <label className="flex items-center text-lg">
                            <input type="checkbox" checked={intern.onboarding.formSubmitted} readOnly className="h-5 w-5 rounded text-primary-600" />
                            <span className="ml-3 text-gray-700">Onboarding form submitted</span>
                        </label>
                    </div>
                </Card>
            </div>
            <Card title="Module Progress">
                <div className="flex justify-around flex-wrap gap-4">
                    {moduleProgress.map(p => <RadialProgress key={p.name} percentage={p.percentage} label={p.name} />)}
                </div>
            </Card>
        </div>
    );
};

const LeaderboardTab: React.FC<{ currentIntern: InternProfile; allInterns: InternProfile[]; tasks: Task[]; }> = ({ currentIntern, allInterns, tasks }) => {
    const rankedInterns = useMemo(() => {
        return allInterns.map(intern => {
            const internTasks = tasks.filter(t => t.assignedTo === intern.id && t.status === TaskStatus.VALIDATED);
            const score = internTasks.reduce((acc, task) => acc + (task.awardedPoints || 0), 0);
            return {
                ...intern,
                score: score,
            };
        }).sort((a, b) => b.score - a.score).map((intern, index) => ({...intern, rank: index + 1}));
    }, [allInterns, tasks]);

    const mostImproved = useMemo(() => {
        return [...allInterns].sort((a, b) => (b.performanceMetrics.performanceChange ?? 0) - (a.performanceMetrics.performanceChange ?? 0))[0];
    }, [allInterns]);

    const Badge: React.FC<{text: string}> = ({text}) => {
        const colors: {[key: string]: string} = {
            SEO: "bg-blue-100 text-blue-700",
            Content: "bg-green-100 text-green-700",
            SEM: "bg-yellow-100 text-yellow-700",
            Social: "bg-orange-100 text-orange-700",
            Email: "bg-red-100 text-red-700",
            Analytics: "bg-purple-100 text-purple-700",
        }
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors[text] || 'bg-gray-100 text-gray-700'}`}>{text}</span>
    }

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b text-left text-xs text-gray-500 uppercase">
                            <th className="py-3 px-4">Rank</th>
                            <th className="py-3 px-4">Intern</th>
                            <th className="py-3 px-4">Score</th>
                            <th className="py-3 px-4">Badges</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedInterns.slice(0, 5).map(intern => (
                            <tr key={intern.id} className={`border-b ${intern.id === currentIntern.id ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                                <td className="py-3 px-4 font-bold text-lg text-gray-700 flex items-center gap-2">
                                    {intern.rank <= 3 && <Icons.Star className={`w-5 h-5 ${intern.rank === 1 ? 'text-yellow-400' : intern.rank === 2 ? 'text-gray-400' : 'text-orange-400'}`} />}
                                    {intern.rank}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <img src={intern.avatarUrl} alt={intern.name} className="w-10 h-10 rounded-full" />
                                        <span className="font-medium text-gray-800">{intern.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 font-bold text-gray-800 text-lg">{intern.score}</td>
                                <td className="py-3 px-4">
                                    <div className="flex gap-2">
                                        {intern.badges.map(b => <Badge key={b} text={b} />)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {mostImproved && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center gap-4">
                    <Icons.Sparkles className="w-8 h-8 text-blue-500" />
                    <div>
                        <p className="font-semibold text-blue-800">Most Improved This Week</p>
                        <p className="text-blue-600">{mostImproved.name} (+{mostImproved.performanceMetrics.performanceChange}%)</p>
                    </div>
                </div>
            )}
        </Card>
    );
};

// --- Main Page Component ---

const AdminInternProfilePage: React.FC = () => {
    const { internId } = useParams<{ internId: string }>();
    const { getInternById, getTasksForIntern, interns, updateModuleScore, getBatchById, tasks } = useData();
    const [activeTab, setActiveTab] = useState('Analytics');

    const intern = useMemo(() => {
        if (!internId) return null;
        return getInternById(internId);
    }, [internId, getInternById]);

    const internTasks = useMemo(() => {
        if (!internId) return [];
        return getTasksForIntern(internId);
    }, [internId, getTasksForIntern]);

    if (!intern) {
        return <div className="text-center p-8">Intern not found.</div>;
    }

    const TABS = ['Analytics', 'Module Scoring', 'Progress', 'Leaderboard'];
    const batch = intern.batchId ? getBatchById(intern.batchId) : null;

    return (
        <div className="space-y-6">
            <header className="p-6 bg-white rounded-lg shadow-md">
                <div className="flex items-center gap-6">
                    <img src={intern.avatarUrl} alt={intern.name} className="w-24 h-24 rounded-full border-4 border-primary-500" />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-800">{intern.name}</h1>
                            {batch && <span className="px-3 py-1 text-sm font-semibold bg-gray-200 text-gray-700 rounded-full">{batch.name}</span>}
                        </div>
                        <p className="text-gray-600">{intern.specialization}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full"><Icons.Clock className="w-4 h-4" /> Week 6 of 12</span>
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full"><Icons.CheckCircle className="w-4 h-4" /> On Track</span>
                        </div>
                    </div>
                </div>
            </header>

            <nav className="bg-white rounded-lg shadow-sm">
                <div className="flex border-b">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`py-3 px-6 font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200 ${activeTab === tab ? 'border-b-2 border-primary-600 text-primary-600' : ''}`}>
                            {tab}
                        </button>
                    ))}
                </div>
            </nav>

            <div>
                {activeTab === 'Analytics' && <AnalyticsTab intern={intern} tasks={internTasks} />}
                {activeTab === 'Module Scoring' && <ModuleScoringTab intern={intern} tasks={internTasks} onUpdateScore={(taskId, score) => updateModuleScore(intern.id, taskId, score)} />}
                {activeTab === 'Progress' && <ProgressTab intern={intern} tasks={internTasks} />}
                {activeTab === 'Leaderboard' && <LeaderboardTab currentIntern={intern} allInterns={interns} tasks={tasks} />}
            </div>
        </div>
    );
};

export default AdminInternProfilePage;