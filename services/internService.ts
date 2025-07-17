
import { InternProfile, PunchLog, PunchStatus, LeaveRequest, LeaveStatus, ProductivityDataPoint, ModuleCompletionDataPoint, TaskModule } from '../types';
import { internsStore } from './taskService'; // Re-use intern data

let punchLogsStore: PunchLog[] = [
    { id: 'pl1', internId: 'intern_seo_1', punchInTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), punchOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), date: new Date().toISOString().split('T')[0], workDurationMinutes: 180 },
    { id: 'pl2', internId: 'intern_seo_1', punchInTime: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(), punchOutTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], workDurationMinutes: 240 },
    { id: 'pl3', internId: 'intern_content_1', punchInTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), punchOutTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), date: new Date().toISOString().split('T')[0], workDurationMinutes: 270 },
];
let leaveRequestsStore: LeaveRequest[] = [
    { id: 'lr1', internId: 'intern_seo_1', startDate: '2024-08-10', endDate: '2024-08-12', reason: 'Vacation', status: LeaveStatus.APPROVED, requestedAt: '2024-08-01' },
    { id: 'lr2', internId: 'intern_content_1', startDate: '2024-08-15', endDate: '2024-08-15', reason: 'Personal appointment', status: LeaveStatus.PENDING, requestedAt: '2024-08-05' }
];

export const internService = {
  getInternProfile: async (internId: string): Promise<InternProfile | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(internsStore.current.find(i => i.id === internId)), 100));
  },

  getAllInterns: async (): Promise<InternProfile[]> => { // For Admin
    return new Promise(resolve => setTimeout(() => resolve([...internsStore.current]), 100));
  },

  punchIn: async (internId: string): Promise<PunchLog | null> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const existingLog = punchLogsStore.find(p => p.internId === internId && !p.punchOutTime);
        if (existingLog) {
          resolve(null); // Already punched in
          return;
        }
        const newLog: PunchLog = {
          id: `pl-${Date.now()}`,
          internId,
          punchInTime: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0],
        };
        punchLogsStore.push(newLog);
        resolve(newLog);
      }, 200);
    });
  },

  punchOut: async (internId: string): Promise<PunchLog | null> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const logIndex = punchLogsStore.findIndex(p => p.internId === internId && !p.punchOutTime);
        if (logIndex > -1) {
          punchLogsStore[logIndex].punchOutTime = new Date().toISOString();
          const punchIn = new Date(punchLogsStore[logIndex].punchInTime);
          const punchOut = new Date(punchLogsStore[logIndex].punchOutTime!);
          punchLogsStore[logIndex].workDurationMinutes = Math.round((punchOut.getTime() - punchIn.getTime()) / (1000 * 60));
          resolve(punchLogsStore[logIndex]);
        } else {
          resolve(null); // Not punched in or already punched out
        }
      }, 200);
    });
  },

  getCurrentPunchStatus: async (internId: string): Promise<{ status: PunchStatus, log?: PunchLog }> => {
     return new Promise(resolve => {
      setTimeout(() => {
        const currentLog = punchLogsStore.find(p => p.internId === internId && !p.punchOutTime);
        if (currentLog) {
          resolve({ status: PunchStatus.PUNCHED_IN, log: currentLog });
        } else {
          const lastLog = punchLogsStore.filter(p => p.internId === internId && p.punchOutTime).sort((a,b) => new Date(b.punchOutTime!).getTime() - new Date(a.punchOutTime!).getTime())[0];
          resolve({ status: PunchStatus.PUNCHED_OUT, log: lastLog });
        }
      }, 100);
    });
  },
  
  getDailyWorkHours: async (internId: string, date: string): Promise<number> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const logsForDate = punchLogsStore.filter(p => p.internId === internId && p.date === date && p.workDurationMinutes);
            const totalMinutes = logsForDate.reduce((sum, log) => sum + (log.workDurationMinutes || 0), 0);
            resolve(totalMinutes / 60);
        }, 100);
    });
  },
  
  getAllPunchLogs: async (): Promise<PunchLog[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([...punchLogsStore]);
        }, 150);
    });
  },

  getAllPunchLogsForIntern: async (internId: string): Promise<PunchLog[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const logs = punchLogsStore
                .filter(p => p.internId === internId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.punchInTime).getTime() - new Date(a.punchInTime).getTime());
            resolve(logs);
        }, 150);
    });
  },

  getLeaveRequests: async (internId: string): Promise<LeaveRequest[]> => {
    return new Promise(resolve => setTimeout(() => resolve(leaveRequestsStore.filter(lr => lr.internId === internId)), 100));
  },

  getAllLeaveRequests: async (): Promise<LeaveRequest[]> => {
      return new Promise(resolve => setTimeout(() => resolve([...leaveRequestsStore]), 100));
  },
  
  updateLeaveRequestStatus: async (requestId: string, status: LeaveStatus): Promise<boolean> => {
      return new Promise(resolve => {
          setTimeout(() => {
              const requestIndex = leaveRequestsStore.findIndex(lr => lr.id === requestId);
              if(requestIndex > -1) {
                  leaveRequestsStore[requestIndex].status = status;
                  resolve(true);
              } else {
                  resolve(false);
              }
          }, 200);
      });
  },

  submitLeaveRequest: async (requestData: Omit<LeaveRequest, 'id' | 'status' | 'requestedAt'>): Promise<LeaveRequest> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newRequest: LeaveRequest = {
          ...requestData,
          id: `lr-${Date.now()}`,
          status: LeaveStatus.PENDING,
          requestedAt: new Date().toISOString(),
        };
        leaveRequestsStore.push(newRequest);
        resolve(newRequest);
      }, 200);
    });
  },
  
  getWeeklyProductivity: async (internId: string): Promise<ProductivityDataPoint[]> => {
    // Mock data for a chart
    return new Promise(resolve => setTimeout(() => resolve([
      { date: 'Mon', tasksCompleted: 1, hoursWorked: 4 },
      { date: 'Tue', tasksCompleted: 0, hoursWorked: 6 },
      { date: 'Wed', tasksCompleted: 2, hoursWorked: 5 },
      { date: 'Thu', tasksCompleted: 1, hoursWorked: 5.5 },
      { date: 'Fri', tasksCompleted: 1, hoursWorked: 4.5 },
    ]), 200));
  },

  getModuleCompletion: async (internId: string): Promise<ModuleCompletionDataPoint[]> => {
    // Mock data reflecting new module structure
    return new Promise(resolve => setTimeout(() => {
        if (internId === 'intern_seo_1') {
             resolve([
                { moduleName: TaskModule.GENERAL, percentage: 100 },
                { moduleName: TaskModule.SEO, percentage: 50 },
                { moduleName: TaskModule.CONTENT_WRITING, percentage: 0 },
                { moduleName: TaskModule.SEM, percentage: 0 },
            ])
        } else {
             resolve([
                { moduleName: TaskModule.GENERAL, percentage: 50 },
                { moduleName: TaskModule.SEO, percentage: 0 },
                { moduleName: TaskModule.CONTENT_WRITING, percentage: 0 },
                { moduleName: TaskModule.SEM, percentage: 0 },
            ])
        }
    }, 200));
  },
};