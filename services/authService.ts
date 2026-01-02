import { User, UserRole } from '../types';
import { MOCK_PROFESSORS, MOCK_STUDENTS, MOCK_DEMO_PROFESSOR, MOCK_DEMO_STUDENT } from '../constants';

// Initialize mock data including demo users, ensuring no duplicates
const ALL_MOCK_PROFESSORS = [...MOCK_PROFESSORS, MOCK_DEMO_PROFESSOR].filter((v, i, a) => a.findIndex(t => (t.id === v.id || t.email === v.email)) === i);
const ALL_MOCK_STUDENTS = [...MOCK_STUDENTS, MOCK_DEMO_STUDENT].filter((v, i, a) => a.findIndex(t => (t.id === v.id || t.email === v.email)) === i);

// This is a mock authentication service. In a real application, this would interact with a backend.
export const authService = {
  login: async (email: string, role: UserRole): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    let user: User | undefined;
    if (role === UserRole.Professor) {
      user = ALL_MOCK_PROFESSORS.find(u => u.email === email);
    } else {
      user = ALL_MOCK_STUDENTS.find(u => u.email === email);
      // Ensure student has a balance, default to 0 if not set (for older mock data)
      if (user && user.role === UserRole.Student && user.balance === undefined) {
          user.balance = 0;
      }
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
    const allUsers = [...ALL_MOCK_PROFESSORS, ...ALL_MOCK_STUDENTS];
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
      ...(role === UserRole.Student && { balance: 0 }), // Initialize balance for new students
    };

    if (role === UserRole.Professor) {
      ALL_MOCK_PROFESSORS.push(newUser); // Add to mock data
    } else {
      ALL_MOCK_STUDENTS.push(newUser); // Add to mock data
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
    const user: User | null = userJson ? (JSON.parse(userJson) as User) : null;
    // Ensure balance is present for students when retrieving from localStorage
    if (user && user.role === UserRole.Student && user.balance === undefined) {
        user.balance = 0;
    }
    return user;
  },

  updateUser: async (updatedUser: User): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call
    if (updatedUser.role === UserRole.Professor) {
        const index = ALL_MOCK_PROFESSORS.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            ALL_MOCK_PROFESSORS[index] = updatedUser;
        }
    } else {
        const index = ALL_MOCK_STUDENTS.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            ALL_MOCK_STUDENTS[index] = updatedUser;
        }
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  }
};