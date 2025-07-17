
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Task, TaskStatus, InternProfile } from '../../types';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { TASK_STATUS_COLORS, Icons } from '../../constants';
import Modal from '../../components/shared/Modal';
import { geminiService } from '../../services/geminiService';

const TaskItem: React.FC<{ task: Task, onUpdateStatus: (taskId: string, status: TaskStatus) => void, onGetAssistance: (task: Task) => void, isCurrentActive: boolean }> = ({ task, onUpdateStatus, onGetAssistance, isCurrentActive }) => {
  const handleComplete = () => {
    onUpdateStatus(task.id, TaskStatus.COMPLETED);
  };
  
  const handleStart = () => {
    onUpdateStatus(task.id, TaskStatus.ONGOING);
  }

  return (
    <Card className={`mb-4 border-l-4 ${task.status === TaskStatus.ONGOING ? 'border-primary-500' : 'border-gray-300'} hover:shadow-xl transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-secondary-600">{task.module}</p>
          <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${TASK_STATUS_COLORS[task.status]}`}>
            {task.status}
          </span>
          {task.deadline && <p className="text-sm text-gray-500 mt-1">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>}
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
         {task.aiAssistancePrompt && (
            <Button size="sm" variant="ghost" onClick={() => onGetAssistance(task)} leftIcon={Icons.Sparkles}>
              AI Help
            </Button>
          )}
          {task.status === TaskStatus.ASSIGNED && isCurrentActive && (
             <Button size="sm" variant="primary" onClick={handleStart} leftIcon={Icons.Tasks}>Start Task</Button>
          )}
          {task.status === TaskStatus.ONGOING && isCurrentActive && (
            <Button size="sm" variant="success" onClick={handleComplete} leftIcon={Icons.CheckCircle}>Mark as Completed</Button>
          )}
          {task.status === TaskStatus.COMPLETED && (
            <p className="text-sm text-green-600">Awaiting validation...</p>
          )}
           {task.status === TaskStatus.VALIDATED && (
            <p className="text-sm text-teal-600 flex items-center"><Icons.CheckCircle className="w-4 h-4 mr-1 text-teal-600"/> Validated</p>
          )}
        </div>
      </div>
      <p className="text-gray-700 mt-3">{task.description}</p>
    </Card>
  );
};


const InternTasksPage: React.FC = () => {
  const { user } = useAuth();
  const { tasks, getTasksForIntern, updateTaskStatus, getNextTaskForIntern, getInternById, addNotification } = useData();
  const [internTasks, setInternTasks] = useState<Task[]>([]);
  const [currentActiveTask, setCurrentActiveTask] = useState<Task | null>(null);
  const [showAiHelpModal, setShowAiHelpModal] = useState(false);
  const [aiHelpContent, setAiHelpContent] = useState<string>('');
  const [aiHelpLoading, setAiHelpLoading] = useState<boolean>(false);
  const [selectedTaskForHelp, setSelectedTaskForHelp] = useState<Task | null>(null);


  const loadTasks = useCallback(() => {
    if (user) {
      const allAssignedTasks = getTasksForIntern(user.id).sort((a,b) => a.order - b.order);
      setInternTasks(allAssignedTasks);
      
      const ongoing = allAssignedTasks.find(t => t.status === TaskStatus.ONGOING);
      if (ongoing) {
        setCurrentActiveTask(ongoing);
        return;
      }
      const pending = allAssignedTasks.find(t => t.status === TaskStatus.PENDING);
       if (pending) {
        setCurrentActiveTask(pending);
        return;
      }
      const firstAssigned = allAssignedTasks.find(t => t.status === TaskStatus.ASSIGNED);
      if (firstAssigned) {
        setCurrentActiveTask(firstAssigned);
        return;
      }
      setCurrentActiveTask(null);
    }
  }, [user, getTasksForIntern]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks, tasks]);

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    if (!user) return;
    const success = await updateTaskStatus(taskId, status, user.id);
    if (success && status === TaskStatus.COMPLETED) {
      addNotification({ message: `Task marked as completed. Admin will validate.`, type: 'success', targetUser: user.id });
      const internProfile = getInternById(user.id) as InternProfile;
      if (internProfile) {
        const nextTask = await getNextTaskForIntern(user.id, taskId);
        if (nextTask) {
           await updateTaskStatus(nextTask.id, TaskStatus.PENDING, user.id);
           addNotification({ message: `New task "${nextTask.title}" is now available.`, type: 'info', targetUser: user.id });
           setCurrentActiveTask(nextTask);
        } else {
           addNotification({ message: `All assigned tasks completed! Great job!`, type: 'success', targetUser: user.id });
           setCurrentActiveTask(null);
        }
      }
    }
    loadTasks(); // Refresh list to reflect status changes
  };
  
  const handleGetAssistance = async (task: Task) => {
    setSelectedTaskForHelp(task);
    setShowAiHelpModal(true);
    setAiHelpLoading(true);
    try {
        const helpText = await geminiService.getTaskGuidance(task);
        setAiHelpContent(helpText);
    } catch (error) {
        console.error("Error getting AI assistance:", error);
        setAiHelpContent("<p class='text-red-500'>Sorry, an error occurred while fetching AI help.</p>");
    } finally {
        setAiHelpLoading(false);
    }
  };


  if (!user) return <div>Loading...</div>;

  const completedTasks = internTasks.filter(t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.VALIDATED);
  const upcomingTasks = internTasks.filter(t => (t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.PENDING) && t.id !== currentActiveTask?.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Current Active Task</h2>
        {currentActiveTask ? (
          <TaskItem task={currentActiveTask} onUpdateStatus={handleUpdateStatus} onGetAssistance={handleGetAssistance} isCurrentActive={true} />
        ) : (
          <Card><p className="text-gray-600">No active task. You might be all caught up or waiting for a new assignment!</p></Card>
        )}
      </div>

      {upcomingTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Upcoming Tasks</h2>
          {upcomingTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateStatus} onGetAssistance={handleGetAssistance} isCurrentActive={task.id === currentActiveTask?.id} />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Completed Tasks</h2>
          {completedTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateStatus} onGetAssistance={handleGetAssistance} isCurrentActive={false} />
          ))}
        </div>
      )}
       <Modal isOpen={showAiHelpModal} onClose={() => setShowAiHelpModal(false)} title={`AI Assistance for: ${selectedTaskForHelp?.title || ''}`}>
          {aiHelpLoading ? (
            <div className="flex justify-center items-center h-32">
              <Icons.Sparkles className="w-8 h-8 text-primary-500 animate-pulse" />
              <p className="ml-2">Fetching AI wisdom...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiHelpContent }} />
          )}
        </Modal>
    </div>
  );
};

export default InternTasksPage;
