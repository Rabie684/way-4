import { User, UserRole } from '../types';
import { MOCK_PROFESSORS, MOCK_STUDENTS, MOCK_DEMO_PROFESSOR, MOCK_DEMO_STUDENT } from '../constants';

// Initialize mock data including demo users, ensuring no duplicates and proper type handling
// Using a function to ensure ALL_MOCK_USERS is dynamically populated and always up-to-date if modified elsewhere
let ALL_USERS: User[] = [];

const initializeAllUsers = () => {
  const initialUsers: User[] = [
    ...MOCK_PROFESSORS,
    ...MOCK_STUDENTS,
    MOCK_DEMO_PROFESSOR,
    MOCK_DEMO_STUDENT,
  ];
  // Filter out duplicates based on id or email
  ALL_USERS = initialUsers.filter((v, i, a) => a.findIndex(t => (t.id === v.id || t.email === v.email)) === i);
};

initializeAllUsers(); // Call once on script load

// This is a mock authentication service. In a real application, this would interact with a backend.
export const authService = {
  login: async (email: string, role: UserRole): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    let user: User | undefined;
    if (role === UserRole.Professor) {
      user = ALL_USERS.find(u => u.email === email && u.role === UserRole.Professor);
    } else {
      user = ALL_USERS.find(u => u.email === email && u.role === UserRole.Student);
    }

    if (user) {
      // Ensure student has a balance, default to 0 if not set (for older mock data)
      if (user.role === UserRole.Student && user.balance === undefined) {
          user.balance = 0;
      }
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: async (email: string, name: string, role: UserRole, university?: string, college?: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    // Check if user already exists
    if (ALL_USERS.some(u => u.email === email)) {
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
      deviceToken: undefined, // Initialize deviceToken as undefined
    };

    ALL_USERS.push(newUser); // Add to mock data

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
    const index = ALL_USERS.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        ALL_USERS[index] = updatedUser;
    } else {
        console.warn("Attempted to update a user not found in ALL_USERS mock data.");
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // New utility to get all users, for notification sending simulation
  getAllUsers: (): User[] => {
    return [...ALL_USERS];
  },
};
