
import React from 'react';
import Card from '../../components/shared/Card';
import { useData } from '../../contexts/DataContext';
import { TaskStatus } from '../../types';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../../components/shared/Button';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#82ca9d', '#fa8072'];

const AdminAnalyticsPage: React.FC = () => {
  const { interns, tasks } = useData();

  const taskStatusDistribution = Object.values(TaskStatus).map(status => ({
    name: status,
    value: tasks.filter(t => t.status === status).length,
  }));

  const internSpecializationDistribution = interns.reduce((acc, intern) => {
    const existing = acc.find(item => item.name === intern.specialization);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: intern.specialization, value: 1 });
    }
    return acc;
  }, [] as {name: string, value: number}[]);
  
  const tasksPerIntern = interns.map(intern => ({
      name: intern.name.split(" ")[0], // First name
      assigned: tasks.filter(t => t.assignedTo === intern.id).length,
      completed: tasks.filter(t => t.assignedTo === intern.id && (t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VALIDATED)).length,
  })).slice(0,10); // Top 10 interns by assigned tasks

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Performance Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Task Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={taskStatusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                         {taskStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
        <Card title="Interns by Specialization">
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={internSpecializationDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number"/>
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Number of Interns" fill={COLORS[3]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Tasks Overview per Intern (Top 10)">
         <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tasksPerIntern} margin={{top: 20, right: 30, left: 20, bottom: 5,}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned" stackId="a" fill={COLORS[0]} name="Tasks Assigned"/>
                <Bar dataKey="completed" stackId="a" fill={COLORS[1]} name="Tasks Completed"/>
            </BarChart>
        </ResponsiveContainer>
      </Card>
      
      <Card title="Download Reports">
        <p className="text-gray-600 mb-4">Generate and download various reports for detailed analysis.</p>
        <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled>Ranking Report (PDF)</Button>
            <Button variant="secondary" disabled>Attendance Report (CSV)</Button>
            <Button variant="secondary" disabled>Task Flow Analysis (Excel)</Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Note: Report generation is a placeholder feature.</p>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
