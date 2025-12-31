import { User, UserRole } from '../types';
import { MOCK_PROFESSORS, MOCK_STUDENTS } from '../constants';

// This is a mock authentication service. In a real application, this would interact with a backend.
export const authService = {
  login: async (email: string, role: UserRole): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    let user: User | undefined;
    if (role === UserRole.Professor) {
      user = MOCK_PROFESSORS.find(u => u.email === email);
    } else {
      user = MOCK_STUDENTS.find(u => u.email === email);
    }

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: async (email: string, name: string, role: UserRole, university?: string, college?: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    // Check if user already exists
    const allUsers = [...MOCK_PROFESSORS, ...MOCK_STUDENTS];
    if (allUsers.some(u => u.email === email)) {
      console.error('User with this email already exists.');
      return null;
    }

    const newUser: User = {
      id: `new-${Date.now()}`,
      email,
      name,
      profilePic: 'https://picsum.photos/100/100?random=' + Date.now(),
      role,
      university,
      college,
      ...(role === UserRole.Professor && { stars: 0 }),
    };

    if (role === UserRole.Professor) {
      MOCK_PROFESSORS.push(newUser); // Add to mock data
    } else {
      MOCK_STUDENTS.push(newUser); // Add to mock data
    }

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? (JSON.parse(userJson) as User) : null;
  },

  updateUser: async (updatedUser: User): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call
    if (updatedUser.role === UserRole.Professor) {
        const index = MOCK_PROFESSORS.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            MOCK_PROFESSORS[index] = updatedUser;
        }
    } else {
        const index = MOCK_STUDENTS.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            MOCK_STUDENTS[index] = updatedUser;
        }
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  }
};