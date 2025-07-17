
import { User, UserRole } from '../types';

// Mock users - in a real app, this would come from a backend
export let usersStore: { current: User[] } = {
  current: [
    { id: 'admin1', username: 'admin', role: UserRole.SUPER_ADMIN, name: 'Alex Chen (Manager)' , avatarUrl: 'https://picsum.photos/seed/admin/100/100', passwordHash: 'hashed-password', mustChangePassword: false },
    { id: 'intern_seo_1', username: 'sam', role: UserRole.INTERN, name: 'Sam Rivera', email: 'sam@example.com', avatarUrl: 'https://picsum.photos/seed/sam/100/100', passwordHash: 'hashed-password', mustChangePassword: false },
    { id: 'intern_content_1', username: 'jess', role: UserRole.INTERN, name: 'Jess Garcia', email: 'jess@example.com', avatarUrl: 'https://picsum.photos/seed/jess/100/100', passwordHash: 'hashed-password', mustChangePassword: false },
    { id: 'intern_ppc_1', username: 'mike', role: UserRole.INTERN, name: 'Mike Johnson', email: 'mike@example.com', avatarUrl: 'https://picsum.photos/seed/mike/100/100', passwordHash: 'hashed-password', mustChangePassword: false },
  ]
};

const SESSION_KEY = 'acovision_user_session';

// Mock "hashing"
const mockHash = (pass: string) => `hashed-${pass}`;

export const authService = {
  login: async (username: string, pass: string): Promise<User | null> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = usersStore.current.find(u => u.username === username);
        
        // Check password. User must exist and have a matching password hash.
        if (user && user.passwordHash === mockHash(pass)) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(user));
          resolve(user);
        } else {
          resolve(null);
        }
      }, 500);
    });
  },

  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem(SESSION_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as User;
      } catch (e) {
        console.error("Failed to parse user session from localStorage", e);
        localStorage.removeItem(SESSION_KEY); // Clear corrupted session
        return null;
      }
    }
    return null;
  },
  
  addUser: (user: User): void => {
    const existing = usersStore.current.find(u => u.username === user.username || u.id === user.id);
    if (!existing) {
        usersStore.current.push(user);
    }
  },

  changePassword: async (userId: string, newPass: string): Promise<User | null> => {
    return new Promise((resolve) => {
        const userIndex = usersStore.current.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const updatedUser = {
                ...usersStore.current[userIndex],
                passwordHash: mockHash(newPass),
                mustChangePassword: false,
            };
            usersStore.current[userIndex] = updatedUser;
            localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
            resolve(updatedUser);
        } else {
            resolve(null);
        }
    });
  }
};
