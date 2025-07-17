
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { internService } from '../../services/internService';
import { ProductivityDataPoint, ModuleCompletionDataPoint, InternProfile } from '../../types';
import Card from '../../components/shared/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../../contexts/DataContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const InternAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const { getInternById } = useData();
  const [productivityData, setProductivityData] = useState<ProductivityDataPoint[]>([]);
  const [moduleCompletion, setModuleCompletion] = useState<ModuleCompletionDataPoint[]>([]);
  const [internProfile, setInternProfile] = useState<InternProfile | null>(null);

  useEffect(() => {
    if (user) {
      const profile = getInternById(user.id) as InternProfile;
      setInternProfile(profile);
      internService.getWeeklyProductivity(user.id).then(setProductivityData);
      internService.getModuleCompletion(user.id).then(setModuleCompletion);
    }
  }, [user, getInternById]);

  if (!user || !internProfile) {
    return <div className="text-center p-8">Loading analytics...</div>;
  }

  const overallProgress = moduleCompletion.length > 0 
    ? moduleCompletion.reduce((acc, curr) => acc + curr.percentage, 0) / moduleCompletion.length
    : 0;

  const performanceMetricsData = [
    { name: 'Speed', value: internProfile.performanceMetrics.speed, fill: COLORS[0] }, // tasks/week
    { name: 'Accuracy', value: internProfile.performanceMetrics.accuracy, fill: COLORS[1] }, // %
    { name: 'Participation', value: internProfile.performanceMetrics.participation, fill: COLORS[2] }, // score
  ];


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Your Performance Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Overall Module Progress">
            <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                <Pie
                    data={[{name: 'Completed', value: overallProgress}, {name: 'Remaining', value: 100 - overallProgress}]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    <Cell key="cell-0" fill={COLORS[4]} />
                    <Cell key="cell-1" fill="#e0e0e0" />
                </Pie>
                <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <p className="text-3xl font-bold text-primary-600 mt-2">{overallProgress.toFixed(1)}%</p>
            <p className="text-gray-500">Completed</p>
            </div>
        </Card>
         <Card title="Performance Snapshot" className="md:col-span-2">
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={performanceMetricsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]}/>
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Weekly Productivity (Last Week)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={productivityData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" label={{ value: 'Tasks Completed', angle: -90, position: 'insideLeft', offset:-10 }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Hours Worked', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="tasksCompleted" stroke={COLORS[0]} strokeWidth={2} activeDot={{ r: 8 }} name="Tasks Done"/>
            <Line yAxisId="right" type="monotone" dataKey="hoursWorked" stroke={COLORS[1]} strokeWidth={2} name="Hours Logged"/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Module Completion Progress">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={moduleCompletion} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="moduleName" />
            <YAxis label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }} domain={[0, 100]}/>
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
            <Bar dataKey="percentage" fill={COLORS[2]} name="Progress" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
};

export default InternAnalyticsPage;
