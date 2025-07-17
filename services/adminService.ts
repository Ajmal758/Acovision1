
import { Task, TaskStatus, InternProfile, Resource, ResourceType, Announcement, Batch, TaskModule, UserRole, User } from '../types';
import { MOCK_BATCHES, tasksStore, internsStore } from './taskService';
import { authService, usersStore } from './authService';

let resourcesStore: Resource[] = [
    { id: 'res1', title: 'Ahrefs for Beginners', type: ResourceType.GUIDE, link: 'https://ahrefs.com/blog/how-to-use-ahrefs/', uploadedBy: 'admin1' },
    { id: 'res2', title: 'Google Ads Copy Template', type: ResourceType.TEMPLATE, fileName: 'google_ads_template.xlsx', uploadedBy: 'admin1', description: 'Template for drafting ad copy and extensions.' },
];

let announcementsStore: Announcement[] = [
    { id: 'ann1', title: 'Weekly SEO Sync', content: 'Reminder: Our weekly SEO sync is every Monday at 11 AM EST. Please bring your keyword research findings.', postedBy: 'admin1', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), audience: 'all' },
];


let batchesStore: Batch[] = [...MOCK_BATCHES];


export const adminService = {
  // Task Management
  createTasksForBatch: async (taskData: Omit<Task, 'id' | 'createdAt' | 'status' | 'assignedTo' | 'order' | 'nextTaskId' | 'submissionContent' | 'lastUpdated' | 'completedAt' | 'awardedPoints'>, batchId: string, adminId: string): Promise<Task[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const internsInBatch = internsStore.current.filter(i => i.batchId === batchId);
        const createdTasks: Task[] = [];
        
        internsInBatch.forEach(intern => {
          const internTasks = tasksStore.current.filter(t => t.assignedTo === intern.id);
          const newOrder = internTasks.length > 0 ? Math.max(...internTasks.map(t => t.order)) + 1 : 1;
          
          const newTask: Task = {
            ...taskData,
            id: `task-${Date.now()}-${intern.id}`,
            createdAt: new Date().toISOString(),
            status: TaskStatus.ASSIGNED,
            assignedTo: intern.id,
            order: newOrder,
            nextTaskId: null,
          };
          tasksStore.current.push(newTask);
          createdTasks.push(newTask);
        });
        
        resolve(createdTasks);
      }, 300);
    });
  },

  assignTaskToIntern: async (taskId: string, internId: string): Promise<boolean> => {
     return new Promise(resolve => {
      setTimeout(() => {
        const taskIndex = tasksStore.current.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
          tasksStore.current[taskIndex].assignedTo = internId;
          tasksStore.current[taskIndex].status = TaskStatus.ASSIGNED;
          resolve(true);
        } else {
          resolve(false);
        }
      }, 200);
    });
  },

  // Intern Management
  getInterns: async (): Promise<InternProfile[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...internsStore.current]), 100));
  },
  
  createIntern: async (internData: Omit<InternProfile, 'id'|'role'|'joinDate'|'performanceMetrics'|'completedTasks'|'moduleScores'|'softSkills'|'onboarding'|'badges' | 'totalPoints' | 'passwordHash' | 'mustChangePassword'>, password?: string): Promise<{ intern: InternProfile, password?: string } | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const existingUser = usersStore.current.find(i => i.username === internData.username);
            if (existingUser) {
                console.error("Username already exists");
                resolve(null);
                return;
            }

            const plainPassword = password || Math.random().toString(36).slice(-8);
            const hashedPassword = `hashed-${plainPassword}`;

            const newId = `intern_${Date.now()}`;
            const newIntern: InternProfile = {
                ...internData,
                id: newId,
                role: UserRole.INTERN,
                joinDate: new Date().toISOString(),
                performanceMetrics: { speed: 0, accuracy: 70, participation: 50, performanceChange: 0 },
                totalPoints: 0,
                completedTasks: [],
                moduleScores: {},
                softSkills: { attendance: 100, behavior: 8, attitude: 8 },
                onboarding: { basecampAccess: false, formSubmitted: false},
                badges: [],
                passwordHash: hashedPassword,
                mustChangePassword: true,
            };
            
            internsStore.current.push(newIntern);

            const newUserForAuth: User = {
                id: newId,
                username: newIntern.username,
                role: UserRole.INTERN,
                name: newIntern.name,
                email: newIntern.email,
                avatarUrl: `https://i.pravatar.cc/150?u=${newId}`,
                passwordHash: hashedPassword,
                mustChangePassword: true,
            };
            authService.addUser(newUserForAuth);
            
            resolve({ intern: newIntern, password: plainPassword });
        }, 300);
    });
  },

  assignInternToBatch: async (internId: string, batchId: string): Promise<boolean> => {
    return new Promise(resolve => {
      const internIndex = internsStore.current.findIndex(i => i.id === internId);
      if (internIndex > -1) {
        internsStore.current[internIndex].batchId = batchId;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },

  // Admin Management
  getAdmins: async (): Promise<User[]> => {
    return new Promise(resolve => {
        const admins = usersStore.current.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN);
        resolve(admins);
    });
  },
  createAdmin: async (data: {name: string; email: string; username: string;}, password?: string): Promise<{admin: User, password?: string} | null> => {
      return new Promise(resolve => {
          if (usersStore.current.some(u => u.username === data.username)) {
              resolve(null); // Username exists
              return;
          }
          const plainPassword = password || Math.random().toString(36).slice(-8);
          const hashedPassword = `hashed-${plainPassword}`;

          const newAdmin: User = {
              id: `admin_${Date.now()}`,
              name: data.name,
              email: data.email,
              username: data.username,
              role: UserRole.ADMIN,
              avatarUrl: `https://i.pravatar.cc/150?u=${data.username}`,
              passwordHash: hashedPassword,
              mustChangePassword: true,
          };
          usersStore.current.push(newAdmin);
          resolve({ admin: newAdmin, password: plainPassword });
      });
  },
  removeAdmin: async (adminId: string): Promise<boolean> => {
      return new Promise(resolve => {
          const adminIndex = usersStore.current.findIndex(u => u.id === adminId);
          if (adminIndex > -1 && usersStore.current[adminIndex].role !== UserRole.SUPER_ADMIN) {
              usersStore.current.splice(adminIndex, 1);
              resolve(true);
          } else {
              resolve(false); // Not found or is super admin
          }
      });
  },
  updateAdmin: async (adminId: string, data: {name: string, email: string}): Promise<User | null> => {
      return new Promise(resolve => {
          const adminIndex = usersStore.current.findIndex(u => u.id === adminId);
          if (adminIndex > -1) {
              usersStore.current[adminIndex] = { ...usersStore.current[adminIndex], ...data };
              resolve(usersStore.current[adminIndex]);
          } else {
              resolve(null);
          }
      })
  },

  // Batch Management
  getBatches: async (): Promise<Batch[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...batchesStore]), 50));
  },

  createBatch: async (name: string): Promise<Batch | null> => {
    return new Promise(resolve => {
        if(batchesStore.length >= 20) {
            resolve(null);
            return;
        }
        const newBatch: Batch = { id: `batch_${Date.now()}`, name };
        batchesStore.push(newBatch);
        resolve(newBatch);
    });
  },
  
  updateBatchName: async (batchId: string, newName: string): Promise<boolean> => {
      return new Promise(resolve => {
          const batchIndex = batchesStore.findIndex(b => b.id === batchId);
          if (batchIndex > -1) {
              batchesStore[batchIndex].name = newName;
              resolve(true);
          } else {
              resolve(false);
          }
      });
  },

  updateModuleScore: async (internId: string, taskId: string, score: number): Promise<boolean> => {
    return new Promise(resolve => {
      const internIndex = internsStore.current.findIndex(i => i.id === internId);
      if (internIndex > -1) {
        internsStore.current[internIndex].moduleScores[taskId] = score;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },

  updateSoftSkillsScore: async (internId: string, skill: 'attendance' | 'behavior' | 'attitude', score: number): Promise<boolean> => {
    return new Promise(resolve => {
      const internIndex = internsStore.current.findIndex(i => i.id === internId);
      if (internIndex > -1) {
        internsStore.current[internIndex].softSkills[skill] = score;
        resolve(true);
      } else {
        resolve(false);
      }
    });
  },


  // Resources
  getResources: async (): Promise<Resource[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...resourcesStore]), 100));
  },

  addResource: async (resourceData: Omit<Resource, 'id' | 'uploadedBy'>, adminId: string): Promise<Resource> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newResource: Resource = {
          ...resourceData,
          id: `res-${Date.now()}`,
          uploadedBy: adminId,
        };
        resourcesStore.push(newResource);
        resolve(newResource);
      }, 200);
    });
  },

  // Announcements
  getAnnouncements: async (): Promise<Announcement[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...announcementsStore].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())), 100));
  },

  createAnnouncement: async (annData: Omit<Announcement, 'id' | 'createdAt' | 'postedBy'>, adminId: string): Promise<Announcement> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newAnnouncement: Announcement = {
          ...annData,
          id: `ann-${Date.now()}`,
          createdAt: new Date().toISOString(),
          postedBy: adminId,
        };
        announcementsStore.unshift(newAnnouncement);
        resolve(newAnnouncement);
      }, 200);
    });
  },

  pingInterns: async (internIds: string[] | 'all', message: string, adminId: string): Promise<boolean> => {
    return new Promise(resolve => {
        console.log(`Admin ${adminId} pinged ${internIds === 'all' ? 'all interns' : internIds.join(', ')} with message: "${message}"`);
        resolve(true);
    });
  }
};
