
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Task, InternProfile, UserRole, TaskStatus, LeaveRequest, Resource, Announcement, GlobalNotification, Batch, TaskModule, PunchLog, AdminStatus, QueueItem, RecentQuery, QueryStatus, LeaveStatus, User } from '../types';
import { taskService } from '../services/taskService';
import { internService }  from '../services/internService';
import { adminService }  from '../services/adminService';
import { useAuth } from './AuthContext';

interface DataContextType {
  tasks: Task[];
  interns: InternProfile[];
  admins: User[];
  batches: Batch[];
  leaveRequests: LeaveRequest[];
  resources: Resource[];
  announcements: Announcement[];
  notifications: GlobalNotification[];
  punchLogs: PunchLog[];
  adminStatus: AdminStatus;
  recentQueries: RecentQuery[];
  projectTags: string[];
  fetchTasks: () => Promise<void>;
  fetchInterns: () => Promise<void>;
  fetchAdmins: () => Promise<void>;
  fetchBatches: () => Promise<void>;
  fetchResources: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  getTasksForIntern: (internId: string) => Task[];
  getInternById: (internId: string) => InternProfile | undefined;
  getBatchById: (batchId: string) => Batch | undefined;
  getPunchLogsForIntern: (internId: string) => PunchLog[];
  updateTaskStatus: (taskId: string, status: TaskStatus, internId: string, feedback?: string, score?: number) => Promise<boolean>;
  updateLeaveRequestStatus: (requestId: string, status: LeaveStatus, internId: string) => Promise<boolean>;
  submitLeaveRequest: (requestData: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>) => Promise<LeaveRequest | null>;
  getNextTaskForIntern: (internId: string, currentTaskId: string) => Promise<Task | null>;
  addNotification: (notification: Omit<GlobalNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'assignedTo' | 'order' | 'awardedPoints'>, batchId: string) => Promise<Task[] | null>;
  createIntern: (internData: Omit<InternProfile, 'id'|'role'|'joinDate'|'performanceMetrics'|'completedTasks'|'moduleScores'|'softSkills'|'onboarding'|'badges'|'totalPoints'|'passwordHash'|'mustChangePassword'>, password?: string) => Promise<{ intern: InternProfile; password?: string; } | null>;
  createAdmin: (adminData: {name: string, email: string, username: string}, password?: string) => Promise<{admin: User, password?: string} | null>;
  updateAdmin: (adminId: string, adminData: {name: string, email: string}) => Promise<User | null>;
  removeAdmin: (adminId: string) => Promise<boolean>;
  assignTaskToIntern: (taskId: string, internId: string) => Promise<boolean>;
  createAnnouncement: (annData: Omit<Announcement, 'id' | 'createdAt' | 'postedBy'>) => Promise<Announcement | null>;
  addResource: (resourceData: Omit<Resource, 'id' | 'uploadedBy'>) => Promise<Resource | null>;
  createBatch: (name: string) => Promise<Batch | null>;
  updateBatchName: (batchId: string, newName: string) => Promise<boolean>;
  assignInternToBatch: (internId: string, batchId: string) => Promise<boolean>;
  punchIn: (internId: string) => Promise<PunchLog | null>;
  punchOut: (internId: string) => Promise<PunchLog | null>;
  updateModuleScore: (internId: string, taskId: string, score: number) => Promise<boolean>;
  updateSoftSkillsScore: (internId: string, skill: 'attendance' | 'behavior' | 'attitude', score: number) => Promise<boolean>;
  joinQueue: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  toggleAdminAvailability: () => Promise<void>;
  respondToQuery: (queryId: string) => Promise<void>;
  addProjectTag: (tag: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [punchLogs, setPunchLogs] = useState<PunchLog[]>([]);
  const [projectTags, setProjectTags] = useState<string[]>(['Hi-Life', 'AcoVision Internal', 'Client Project X']);
  
  const [recentQueries, setRecentQueries] = useState<RecentQuery[]>([
    { id: 'q1', internId: 'intern_content_1', internName: 'Sarah Miller', internInitial: 'SM', department: 'Marketing', query: 'Need help with social media campaign strategy', status: QueryStatus.PENDING, time: '5 mins ago', queryDate: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: 'q2', internId: 'intern_ppc_2', internName: 'John Davis', internInitial: 'JD', department: 'Design', query: 'Question about design guidelines for new project', status: QueryStatus.PENDING, time: '12 mins ago', queryDate: new Date(Date.now() - 12 * 60 * 1000).toISOString() },
    { id: 'q3', internId: 'intern_new_2', internName: 'Alex Thompson', internInitial: 'AT', department: 'Development', query: 'Need help with debugging React component', status: QueryStatus.RESOLVED, time: '1 hour ago', queryDate: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
    { id: 'q4', internId: 'intern_new_1', internName: 'Taylor Johnson', internInitial: 'TJ', department: 'HR', query: 'Question about internship extension process', status: QueryStatus.PENDING, time: '2 hours ago', queryDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ]);

  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAvailableForQueries: false,
    queue: [
      { internId: 'intern_finance_1', internName: 'Jordan', department: 'Finance', queuedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      { internId: 'intern_dev_1', internName: 'Alex', department: 'Development', queuedAt: new Date(Date.now() - 10 * 1000).toISOString() },
      { internId: 'intern_dev_2', internName: 'Alex', department: 'Development', queuedAt: new Date(Date.now() - 5 * 1000).toISOString() }
    ],
  });

  const addNotification = useCallback((notification: Omit<GlobalNotification, 'id' | 'createdAt'>) => {
    setNotifications(prev => [{ ...notification, id: `notif-${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const fetchTasks = useCallback(async () => {
    const data = await taskService.getTasks();
    setTasks(data);
  }, []);

  const fetchInterns = useCallback(async () => {
    const data = await internService.getAllInterns();
    setInterns(data);
  }, []);

  const fetchAdmins = useCallback(async () => {
    const data = await adminService.getAdmins();
    setAdmins(data);
  }, []);
  
  const fetchBatches = useCallback(async () => {
    const data = await adminService.getBatches();
    setBatches(data);
  }, []);

  const fetchResources = useCallback(async () => {
    const data = await adminService.getResources();
    setResources(data);
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    const data = await adminService.getAnnouncements();
    setAnnouncements(data);
  }, []);

  const fetchAll = useCallback(() => {
    fetchTasks();
    fetchInterns();
    fetchBatches();
    fetchResources();
    fetchAnnouncements();
    internService.getAllPunchLogs().then(setPunchLogs);
    internService.getAllLeaveRequests().then(setLeaveRequests);
    if(user?.role === UserRole.SUPER_ADMIN) {
        fetchAdmins();
    }
  }, [user, fetchTasks, fetchInterns, fetchBatches, fetchResources, fetchAnnouncements, fetchAdmins]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, fetchAll]);

  // Getters
  const getTaskById = (taskId: string) => tasks.find(t => t.id === taskId);
  const getTasksForIntern = (internId: string) => tasks.filter(t => t.assignedTo === internId).sort((a,b)=>a.order - b.order);
  const getInternById = (internId: string) => interns.find(i => i.id === internId);
  const getBatchById = (batchId: string) => batches.find(b => b.id === batchId);
  const getPunchLogsForIntern = (internId: string) => punchLogs.filter(p => p.internId === internId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  const updateTaskStatus = async (taskId: string, status: TaskStatus, internId: string, feedback?: string, score?: number) => {
      const success = await taskService.updateTaskStatus(taskId, status, score);
      if (success) {
          fetchTasks(); // refetch
          if (score !== undefined && status === TaskStatus.VALIDATED) {
              await adminService.updateModuleScore(internId, taskId, score);
              fetchInterns(); // refetch interns to get updated scores
          }
      }
      return success;
  };

  const updateLeaveRequestStatus = async (requestId: string, status: LeaveStatus, internId: string) => {
    const success = await internService.updateLeaveRequestStatus(requestId, status);
    if(success) {
        setLeaveRequests(prev => prev.map(lr => lr.id === requestId ? {...lr, status} : lr));
        addNotification({
          message: `Your leave request has been ${status.toLowerCase()}.`,
          type: status === LeaveStatus.APPROVED ? 'success' : status === LeaveStatus.REJECTED ? 'error' : 'info',
          targetUser: internId
        });
    }
    return success;
  };

  const submitLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>): Promise<LeaveRequest | null> => {
    const newRequest = await internService.submitLeaveRequest(requestData);
    if (newRequest) {
      setLeaveRequests(prev => [newRequest, ...prev]);
      addNotification({message: 'Leave request submitted successfully.', type: 'success', targetUser: requestData.internId});
    }
    return newRequest;
  };

  const getNextTaskForIntern = (internId: string, currentTaskId: string) => taskService.getNextTaskForIntern(internId, currentTaskId);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };
  
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'assignedTo' | 'order'|'awardedPoints'>, batchId: string) => {
      if (!user) return null;
      const createdTasks = await adminService.createTasksForBatch(taskData, batchId, user.id);
      if (createdTasks.length > 0) {
          setTasks(prev => [...prev, ...createdTasks]);
      }
      return createdTasks;
  };
  
  const createIntern = async (internData: Omit<InternProfile, 'id'|'role'|'joinDate'|'performanceMetrics'|'completedTasks'|'moduleScores'|'softSkills'|'onboarding'|'badges'|'totalPoints'|'passwordHash'|'mustChangePassword'>, password?: string): Promise<{ intern: InternProfile, password?: string } | null> => {
      const result = await adminService.createIntern(internData, password);
      if (result) {
          setInterns(prev => [...prev, result.intern]);
      }
      return result;
  };

  const createAdmin = async (adminData: {name: string, email: string, username: string}, password?: string) => {
      const result = await adminService.createAdmin(adminData, password);
      if (result) {
          setAdmins(prev => [...prev, result.admin]);
      }
      return result;
  };

  const updateAdmin = async (adminId: string, adminData: {name: string, email: string}) => {
      const updatedAdmin = await adminService.updateAdmin(adminId, adminData);
      if (updatedAdmin) {
          setAdmins(prev => prev.map(a => a.id === adminId ? updatedAdmin : a));
      }
      return updatedAdmin;
  };

  const removeAdmin = async (adminId: string) => {
      const success = await adminService.removeAdmin(adminId);
      if (success) {
          setAdmins(prev => prev.filter(a => a.id !== adminId));
      }
      return success;
  };

  const assignTaskToIntern = async (taskId: string, internId: string) => {
      const success = await adminService.assignTaskToIntern(taskId, internId);
      if (success) fetchTasks();
      return success;
  };

  const createAnnouncement = async (annData: Omit<Announcement, 'id' | 'createdAt' | 'postedBy'>) => {
      if(!user) return null;
      const newAnnouncement = await adminService.createAnnouncement(annData, user.id);
      if (newAnnouncement) {
          setAnnouncements(prev => [newAnnouncement, ...prev]);
      }
      return newAnnouncement;
  };

  const addResource = async (resourceData: Omit<Resource, 'id' | 'uploadedBy'>) => {
      if(!user) return null;
      const newResource = await adminService.addResource(resourceData, user.id);
      if (newResource) {
          setResources(prev => [newResource, ...prev]);
      }
      return newResource;
  };

  const createBatch = async (name: string) => {
      const newBatch = await adminService.createBatch(name);
      if (newBatch) {
          setBatches(prev => [...prev, newBatch]);
      }
      return newBatch;
  };
  
  const updateBatchName = async (batchId: string, newName: string) => {
      const success = await adminService.updateBatchName(batchId, newName);
      if(success) {
          setBatches(prev => prev.map(b => b.id === batchId ? {...b, name: newName} : b));
      }
      return success;
  };

  const assignInternToBatch = async (internId: string, batchId: string) => {
      const success = await adminService.assignInternToBatch(internId, batchId);
      if (success) fetchInterns();
      return success;
  };

  const punchIn = async (internId: string) => {
      const newLog = await internService.punchIn(internId);
      if (newLog) setPunchLogs(prev => [...prev, newLog]);
      return newLog;
  };
  
  const punchOut = async (internId: string) => {
      const updatedLog = await internService.punchOut(internId);
      if (updatedLog) setPunchLogs(prev => prev.map(p => p.id === updatedLog.id ? updatedLog : p));
      return updatedLog;
  };

  const updateModuleScore = async (internId: string, taskId: string, score: number) => {
      const success = await adminService.updateModuleScore(internId, taskId, score);
      if(success) fetchInterns();
      return success;
  };
  
  const updateSoftSkillsScore = async (internId: string, skill: 'attendance' | 'behavior' | 'attitude', score: number) => {
      const success = await adminService.updateSoftSkillsScore(internId, skill, score);
      if(success) fetchInterns();
      return success;
  };

  const joinQueue = async () => {};
  const leaveQueue = async () => {};
  const toggleAdminAvailability = async () => {
    setAdminStatus(prev => ({...prev, isAvailableForQueries: !prev.isAvailableForQueries}));
  };
  const respondToQuery = async (queryId: string) => {
    setRecentQueries(prev => prev.map(q => q.id === queryId ? {...q, status: QueryStatus.RESOLVED} : q));
    addNotification({message: "Query marked as resolved.", type: 'success'})
  };
  
  const addProjectTag = (tag: string) => {
    setProjectTags(prev => {
        if (prev.includes(tag)) return prev;
        return [...prev, tag];
    });
  };

  return (
    <DataContext.Provider value={{
      tasks, interns, admins, batches, leaveRequests, resources, announcements, notifications, punchLogs, adminStatus, recentQueries, projectTags,
      fetchTasks, fetchInterns, fetchAdmins, fetchBatches, fetchResources, fetchAnnouncements,
      getTaskById, getTasksForIntern, getInternById, getBatchById, getPunchLogsForIntern,
      updateTaskStatus, updateLeaveRequestStatus, submitLeaveRequest, getNextTaskForIntern,
      addNotification, markNotificationAsRead,
      createTask, createIntern, createAdmin, updateAdmin, removeAdmin, assignTaskToIntern,
      createAnnouncement, addResource,
      createBatch, updateBatchName, assignInternToBatch,
      punchIn, punchOut,
      updateModuleScore, updateSoftSkillsScore,
      joinQueue, leaveQueue, toggleAdminAvailability, respondToQuery,
      addProjectTag,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
