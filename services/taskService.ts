import { Task, TaskStatus, InternProfile, UserRole, Batch, TaskModule } from '../types';

export const MOCK_BATCHES: Batch[] = [
  { id: 'batch_2023', name: 'Batch 2023' },
  { id: 'batch_q3_24', name: 'Q3 2024 Cohort' },
  { id: 'batch_q4_24', name: 'Q4 2024 Cohort' },
];

export const MOCK_DIGITAL_MARKETING_INTERNS: InternProfile[] = [
  { 
    id: 'intern_seo_1', username: 'sam', role: UserRole.INTERN, name: 'Sam Rivera', email: 'sam@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=sam',
    specialization: 'SEO Specialist', joinDate: '2024-07-01', 
    performanceMetrics: { speed: 5, accuracy: 94, participation: 80, leads: 37, conversions: 12, performanceChange: 15 },
    totalPoints: 90,
    currentTaskId: 'task_seo_1', completedTasks: ['task_gen_1', 'task_seo_1'],
    batchId: 'batch_q3_24',
    moduleScores: { 'task_gen_1': 9, 'task_seo_1': 9, 'task_content_1': 7 },
    softSkills: { attendance: 95, behavior: 9, attitude: 8 },
    onboarding: { basecampAccess: true, formSubmitted: true},
    badges: ['SEO', 'Content']
  },
  { 
    id: 'intern_content_1', username: 'jess', role: UserRole.INTERN, name: 'Jess Garcia', email: 'jess@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=jess',
    specialization: 'Content Strategist', joinDate: '2024-07-01',
    performanceMetrics: { speed: 3, accuracy: 89, participation: 85, leads: 32, conversions: 9, performanceChange: 24 },
    totalPoints: 0,
    currentTaskId: 'task_gen_1', completedTasks: [],
    batchId: 'batch_q3_24',
    moduleScores: { 'task_gen_2': 8, 'task_social_1': 7 },
    softSkills: { attendance: 98, behavior: 10, attitude: 9 },
    onboarding: { basecampAccess: true, formSubmitted: false},
    badges: ['Social', 'SEM']
  },
  { 
    id: 'intern_ppc_1', username: 'mike', role: UserRole.INTERN, name: 'Mike Johnson', email: 'mike@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=mike',
    specialization: 'PPC Analyst', joinDate: '2024-10-01',
    performanceMetrics: { speed: 4, accuracy: 92, participation: 75, leads: 28, conversions: 8, performanceChange: 10 },
    totalPoints: 0,
    currentTaskId: undefined, completedTasks: [],
    batchId: 'batch_q4_24',
    moduleScores: { },
    softSkills: { attendance: 92, behavior: 8, attitude: 8 },
    onboarding: { basecampAccess: false, formSubmitted: false},
    badges: ['Analytics']
  },
  { 
    id: 'intern_new_1', username: 'taylor', role: UserRole.INTERN, name: 'Taylor Morgan', email: 'taylor@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=taylor',
    specialization: 'Social Media Manager', joinDate: '2024-10-01',
    performanceMetrics: { speed: 2, accuracy: 82, participation: 80, leads: 25, conversions: 7, performanceChange: 5 },
    totalPoints: 0,
    currentTaskId: undefined, completedTasks: [],
    batchId: 'batch_q4_24',
    moduleScores: { },
    softSkills: { attendance: 90, behavior: 7, attitude: 7 },
    onboarding: { basecampAccess: true, formSubmitted: true},
    badges: ['Email']
  },
];
export let internsStore: { current: InternProfile[] } = { current: [...MOCK_DIGITAL_MARKETING_INTERNS] };


export const MOCK_TASKS: Task[] = [
  { id: 'task_gen_1', title: 'Onboarding: Setup Workspace', description: '...', status: TaskStatus.VALIDATED, assignedTo: 'intern_seo_1', createdAt: '2024-07-01', order: 1, module: TaskModule.GENERAL, lastUpdated: '2 days ago', awardedPoints: 90 },
  { id: 'task_seo_1', title: 'SEO Fundamentals', description: '...', status: TaskStatus.COMPLETED, assignedTo: 'intern_seo_1', createdAt: '2024-07-03', order: 2, module: TaskModule.SEO, lastUpdated: '2 days ago' },
  { id: 'task_sem_1', title: 'SEM & Google Ads', description: '...', status: TaskStatus.ONGOING, assignedTo: 'intern_seo_1', createdAt: '2024-07-10', order: 3, module: TaskModule.SEM, lastUpdated: '5 days ago' },
  { id: 'task_social_1', title: 'Social Media Marketing', description: '...', status: TaskStatus.ONGOING, assignedTo: 'intern_content_1', createdAt: '2024-07-12', order: 2, module: TaskModule.SOCIAL, lastUpdated: '1 week ago' },
  { id: 'task_content_1', title: 'Content Marketing', description: '...', status: TaskStatus.ONGOING, assignedTo: 'intern_seo_1', createdAt: '2024-07-15', order: 4, module: TaskModule.CONTENT_WRITING, lastUpdated: '3 days ago' },
  { id: 'task_email_1', title: 'Email Marketing', description: '...', status: TaskStatus.NOT_STARTED, assignedTo: 'intern_seo_1', createdAt: '2024-07-20', order: 5, module: TaskModule.EMAIL, lastUpdated: 'Not started' },
  { id: 'task_analytics_1', title: 'Analytics Basics', description: '...', status: TaskStatus.NOT_STARTED, assignedTo: 'intern_seo_1', createdAt: '2024-07-22', order: 6, module: TaskModule.ANALYTICS, lastUpdated: 'Not started' },
  { id: 'task_gen_2', title: 'Onboarding: Tools Setup', description: '...', status: TaskStatus.COMPLETED, assignedTo: 'intern_content_1', createdAt: '2024-07-02', order: 1, module: TaskModule.GENERAL },
];


export let tasksStore: { current: Task[] } = { current: [...MOCK_TASKS] }; // Use a mutable store for mock operations

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    // Simulate API call
    return new Promise(resolve => setTimeout(() => resolve([...tasksStore.current]), 200));
  },

  getTaskById: async (taskId: string): Promise<Task | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(tasksStore.current.find(t => t.id === taskId)), 100));
  },

  getTasksForIntern: async (internId: string): Promise<Task[]> => {
    return new Promise(resolve => setTimeout(() => resolve(tasksStore.current.filter(t => t.assignedTo === internId).sort((a,b)=>a.order - b.order)), 100));
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus, score?: number): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const taskIndex = tasksStore.current.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
          tasksStore.current[taskIndex] = { 
            ...tasksStore.current[taskIndex], 
            status, 
            completedAt: status === TaskStatus.COMPLETED ? new Date().toISOString() : tasksStore.current[taskIndex].completedAt,
            awardedPoints: score !== undefined ? score : tasksStore.current[taskIndex].awardedPoints
          };
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  },

  getNextTaskForIntern: async (internId: string, currentTaskId: string): Promise<Task | null> => {
     return new Promise(resolve => {
      setTimeout(() => {
        const internTasks = tasksStore.current.filter(t => t.assignedTo === internId).sort((a, b) => a.order - b.order);
        const currentTask = internTasks.find(t => t.id === currentTaskId);

        if (!currentTask) {
          resolve(null);
          return;
        }
        
        let nextTask: Task | undefined = undefined;

        if (currentTask.nextTaskId) {
            nextTask = internTasks.find(t => t.id === currentTask.nextTaskId && (t.status === TaskStatus.ASSIGNED || t.status === TaskStatus.PENDING) );
        }
        
        if (!nextTask) { // Fallback to order if nextTaskId is not set or task not found
            const currentIndex = internTasks.findIndex(t => t.id === currentTaskId);
            if (currentIndex !== -1 && currentIndex < internTasks.length - 1) {
                const potentialNext = internTasks[currentIndex + 1];
                if (potentialNext && (potentialNext.status === TaskStatus.ASSIGNED || potentialNext.status === TaskStatus.PENDING)) {
                    nextTask = potentialNext;
                }
            }
        }
        
        if (nextTask) {
            resolve(nextTask);
        } else {
            resolve(null);
        }

      }, 200);
    });
  },

  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'assignedTo' | 'order' | 'awardedPoints'>, assignedTo: string, adminId: string): Promise<Task> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const internTasks = tasksStore.current.filter(t => t.assignedTo === assignedTo);
        const newOrder = internTasks.length > 0 ? Math.max(...internTasks.map(t => t.order)) + 1 : 1;

        const newTask: Task = {
          ...taskData,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: TaskStatus.ASSIGNED,
          assignedTo: assignedTo,
          order: newOrder, 
        };
        tasksStore.current.push(newTask);
        resolve(newTask);
      }, 300);
    });
  },
};