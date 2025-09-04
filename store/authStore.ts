import { create } from 'zustand';
import { db, generateId, getCurrentTimestamp, User, initializeDatabase } from '../lib/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
     email: string, 
     password: string, 
     fullName: string,
     phone?: string,
     address?: string
   ) => Promise<{ success: boolean; error?: string; data?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

// Simple password hashing (for demo purposes - use proper hashing in production)
const hashPassword = (password: string): string => {
  // This is a very basic hash - in production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

// Dummy users for testing
const DUMMY_USERS: User[] = [
  {
    id: 'user1',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+6281234567890',
    address: 'Jl. Test No. 123, Jakarta',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user2',
    email: 'donor@example.com',
    full_name: 'Donor User',
    phone: '+6289876543210',
    address: 'Jl. Donor No. 456, Bandung',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Dummy passwords (hashed)
const DUMMY_PASSWORDS: { [email: string]: string } = {
  'test@example.com': hashPassword('password123'),
  'donor@example.com': hashPassword('donor123')
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });
      
      // Initialize database tables first
      await initializeDatabase();
      
      // Check if user is logged in from AsyncStorage
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user });
      }
      
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ loading: true });
      
      // Check dummy users first
      const dummyUser = DUMMY_USERS.find(u => u.email === email);
      const hashedPassword = hashPassword(password);
      
      if (dummyUser && DUMMY_PASSWORDS[email] === hashedPassword) {
        set({ user: dummyUser });
        await AsyncStorage.setItem('currentUser', JSON.stringify(dummyUser));
        return { error: null };
      }
      
      // Check SQLite database
      return new Promise((resolve) => {
        db.withTransactionSync(() => {
          try {
            const result = db.getFirstSync(
              'SELECT * FROM users WHERE email = ?',
              [email]
            ) as User | null;
            
            if (result) {
              // In a real app, you'd verify the password hash here
              set({ user: result });
              AsyncStorage.setItem('currentUser', JSON.stringify(result));
              resolve({ error: null });
            } else {
              resolve({ error: { message: 'Invalid email or password' } });
            }
          } catch (error) {
            console.error('Database error:', error);
            resolve({ error: { message: 'Database error' } });
          }
        });
      });
      
    } catch (error) {
      console.error('Sign in with email error:', error);
      return { error };
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (
     email: string, 
     password: string, 
     fullName: string,
     phone?: string,
     address?: string
   ) => {
    set({ loading: true });
    try {
      // Check if user already exists
      const existingUser = DUMMY_USERS.find(u => u.email === email);
      if (existingUser) {
        return { success: false, error: 'Email already registered' };
      }
      
      // Create new user
      const newUser: User = {
        id: generateId(),
        email,
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      // Insert into SQLite database
      return new Promise((resolve) => {
        db.withTransactionSync(() => {
          try {
            db.runSync(
              `INSERT INTO users (id, email, full_name, phone, address, created_at, updated_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [newUser.id, newUser.email, newUser.full_name, newUser.phone, newUser.address, newUser.created_at, newUser.updated_at]
            );
            
            set({ user: newUser });
            AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
            resolve({ success: true, data: newUser });
          } catch (error) {
            console.error('Database error:', error);
            resolve({ success: false, error: 'Failed to create user' });
          }
        });
      });
      
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Registration failed' };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await AsyncStorage.removeItem('currentUser');
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      const { user } = get();
      if (!user) return;
      
      set({ loading: true });
      
      const updatedUser = { ...user, ...updates, updated_at: getCurrentTimestamp() };
      
      // Update in SQLite database
      db.withTransactionSync(() => {
        try {
          const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
          const values = [...Object.values(updates), getCurrentTimestamp(), user.id];
          
          db.runSync(
            `UPDATE users SET ${setClause}, updated_at = ? WHERE id = ?`,
            values
          );
          
          set({ user: updatedUser });
          AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Database update error:', error);
        }
      });
      
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      set({ loading: false });
    }
  }
}));