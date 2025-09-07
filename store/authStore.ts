import { create } from 'zustand';
import { User } from '../lib/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseAuth, RegisterData } from '../services/firebaseAuth';
import { userService } from '../services/firebaseService';
import { FirebaseUser } from '../types/firebase';
import { User as FirebaseAuthUser } from 'firebase/auth';
import { notificationService } from '../services/notificationService';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseAuthUser | null;
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

// Convert Firebase user to local User format
const convertFirebaseUserToLocal = (
  firebaseUser: FirebaseAuthUser,
  userData?: FirebaseUser
): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    full_name: userData?.name || firebaseUser.displayName || '',
    phone: userData?.phone || null,
    address: userData?.address || null,
    created_at: userData?.createdAt?.toDate().toISOString() || new Date().toISOString(),
    updated_at: userData?.updatedAt?.toDate().toISOString() || new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });

      // Listen to Firebase auth state changes
      const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          // Get user data from Firestore
          let userData = await firebaseAuth.getUserData(firebaseUser.uid);
          
          // If user data doesn't exist in Firestore, create it
          if (!userData) {
            console.log('User document missing in Firestore, creating new document for:', firebaseUser.uid);
            try {
              await userService.createUser({
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || 'User',
                phone: '',
              }, firebaseUser.uid);
              
              // Fetch the newly created user data
              userData = await firebaseAuth.getUserData(firebaseUser.uid);
            } catch (error) {
              console.error('Failed to create missing user document:', error);
            }
          }
          
          const localUser = convertFirebaseUserToLocal(firebaseUser, userData || undefined);

          set({ user: localUser, firebaseUser });
          await AsyncStorage.setItem('currentUser', JSON.stringify(localUser));
          
          // Initialize FCM for the user
          try {
            await notificationService.initializeFCMForUser(firebaseUser.uid);
            console.log('FCM initialized for user:', firebaseUser.uid);
          } catch (fcmError) {
            console.warn('Failed to initialize FCM:', fcmError);
          }
        } else {
          set({ user: null, firebaseUser: null });
          await AsyncStorage.removeItem('currentUser');
        }
      });

      // Store unsubscribe function for cleanup
      (get() as any).unsubscribeAuth = unsubscribe;
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ loading: true });

      const result = await firebaseAuth.login(email, password);

      if (result.success && result.user) {
        // Get user data from Firestore
        let userData = await firebaseAuth.getUserData(result.user.uid);
        
        // If user data doesn't exist in Firestore, create it
        if (!userData) {
          console.log('User document missing in Firestore during login, creating new document for:', result.user.uid);
          try {
            await userService.createUser({
              email: result.user.email || '',
              name: result.user.displayName || 'User',
              phone: '',
            }, result.user.uid);
            
            // Fetch the newly created user data
            userData = await firebaseAuth.getUserData(result.user.uid);
          } catch (error) {
            console.error('Failed to create missing user document during login:', error);
          }
        }
        const localUser = convertFirebaseUserToLocal(result.user, userData || undefined);

        set({ user: localUser, firebaseUser: result.user });
        await AsyncStorage.setItem('currentUser', JSON.stringify(localUser));
        
        // Initialize FCM for the user
        try {
          await notificationService.initializeFCMForUser(result.user.uid);
          console.log('FCM initialized for user on login:', result.user.uid);
        } catch (fcmError) {
          console.warn('Failed to initialize FCM on login:', fcmError);
        }
        
        return { error: null };
      } else {
        return { error: { message: result.error || 'Login failed' } };
      }
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
      const registerData: RegisterData = {
        email,
        password,
        name: fullName,
        phone,
      };

      const result = await firebaseAuth.register(registerData);

      if (result.success && result.user) {
        // Update user document with additional info if provided
        if (address) {
          await userService.updateUser(result.user.uid, { address });
        }

        // Get updated user data from Firestore
        const userData = await firebaseAuth.getUserData(result.user.uid);
        const localUser = convertFirebaseUserToLocal(result.user, userData || undefined);

        set({ user: localUser, firebaseUser: result.user });
        await AsyncStorage.setItem('currentUser', JSON.stringify(localUser));
        
        // Initialize FCM for the new user
        try {
          await notificationService.initializeFCMForUser(result.user.uid);
          console.log('FCM initialized for new user:', result.user.uid);
        } catch (fcmError) {
          console.warn('Failed to initialize FCM for new user:', fcmError);
        }
        
        return { success: true, data: localUser };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
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

      const result = await firebaseAuth.logout();

      if (result.success) {
        // Cleanup auth state listener
        const state = get() as any;
        if (state.unsubscribeAuth) {
          state.unsubscribeAuth();
        }

        await AsyncStorage.removeItem('currentUser');
        set({ user: null, firebaseUser: null });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      set({ loading: true });
      const { user, firebaseUser } = get();
      if (!user || !firebaseUser) return;

      // Update Firebase Auth profile if name is being updated
      if (updates.full_name) {
        await firebaseAuth.updateUserProfile(updates.full_name);
      }

      // Update Firestore user document
      const firebaseUpdates: Partial<FirebaseUser> = {};
      if (updates.full_name) firebaseUpdates.name = updates.full_name;
      if (updates.phone) firebaseUpdates.phone = updates.phone;
      if (updates.address) firebaseUpdates.address = updates.address;

      if (Object.keys(firebaseUpdates).length > 0) {
        await userService.updateUser(firebaseUser.uid, firebaseUpdates);
      }

      // Update local state
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      set({ user: updatedUser });
      await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
