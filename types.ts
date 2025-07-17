
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  INTERN = 'intern',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
  email?: string; 
  passwordHash?: string;
  mustChangePassword?: boolean;
}

export interface Batch {
  id: string;
  name: string;
}

export interface InternProfile extends User {
  specialization: string;
  joinDate: string;
  performanceMetrics: {
    speed: number;
    accuracy: number;
    participation: number;
    leads?: number;
    conversions?: number;
    performanceChange?: number;
  };
  moduleScores: Record<string, number>; // key: taskId, value: score (1-10)
  totalPoints: number;
  softSkills: {
      attendance: number; // percentage
      behavior: number; // 1-10
      attitude: number; // 1-10
  };
  onboarding: {
      basecampAccess: boolean;
      formSubmitted: boolean;
  };
  badges: string[]; // e.g. ['SEO', 'Content', 'SEM']
  currentTaskId?: string;
  completedTasks: string[];
  batchId?: string;
}

export enum TaskStatus {
  ASSIGNED = 'Assigned',
  PENDING = 'Pending',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  REVISION_REQUESTED = 'Revision Requested',
  VALIDATED = 'Validated',
  NOT_STARTED = 'Not Started'
}

export enum TaskModule {
  SEO = 'SEO',
  CONTENT_WRITING = 'Content Writing',
  SEM = 'SEM',
  SOCIAL = 'Social',
  EMAIL = 'Email',
  ANALYTICS = 'Analytics',
  GENERAL = 'General',
  DESIGN = 'Design',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string; // internId
  deadline?: string;
  createdAt: string;
  completedAt?: string;
  order: number;
  nextTaskId?: string | null;
  aiAssistancePrompt?: string;
  module: TaskModule;
  projectTag?: string;
  submissionContent?: string;
  awardedPoints?: number;
  lastUpdated?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  estimatedDuration: string; 
}

export enum PunchStatus {
  PUNCHED_IN = 'Punched In',
  PUNCHED_OUT = 'Punched Out',
}

export interface PunchLog {
  id: string;
  internId: string;
  punchInTime: string; 
  punchOutTime?: string; 
  date: string; 
  workDurationMinutes?: number;
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export interface LeaveRequest {
  id: string;
  internId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
}

export interface BreakSession {
  id: string;
  internId: string;
  startTime: string; 
  endTime?: string;
  durationMinutes?: number;
}

export enum ResourceType {
  TOOL = 'Tool',
  GUIDE = 'Guide',
  TEMPLATE = 'Template',
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  link?: string;
  type: ResourceType;
  uploadedBy: string; 
  usageLimit?: number;
  expiryDate?: string;
  fileName?: string; 
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string; 
  createdAt: string;
  audience: 'all' | string[];
}

export interface GlobalNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ping';
  createdAt: string;
  read?: boolean;
  targetUser?: string;
}

// For charts
export interface ProductivityDataPoint {
  date: string; // e.g., 'Mon', 'Week 1'
  tasksCompleted: number;
  hoursWorked?: number;
}

export interface ModuleCompletionDataPoint {
  moduleName: string;
  percentage: number;
}

export interface QueueItem {
  internId: string;
  internName: string;
  department: string;
  queuedAt: string; // ISO string
}

export interface AdminStatus {
  isAvailableForQueries: boolean;
  queue: QueueItem[];
}

export enum QueryStatus {
  PENDING = 'Pending',
  RESOLVED = 'Resolved',
}

export interface RecentQuery {
  id: string;
  internId: string;
  internName: string;
  internInitial: string;
  department: string;
  query: string;
  status: QueryStatus;
  time: string; // e.g., "5 mins ago"
  queryDate: string; // for sorting
}