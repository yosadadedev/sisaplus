import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { userService } from './firebaseService';
import { FirebaseUser } from '../types/firebase';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export const firebaseAuth = {
  // Register new user
  async register(userData: RegisterData): Promise<AuthResult> {
    try {
      const { email, password, name, phone } = userData;

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: name,
      });

      // Create user document in Firestore with Firebase Auth UID
      await userService.createUser({
        email,
        name,
        phone: phone || '',
      }, user.uid);

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Login user
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Logout user
  async logout(): Promise<AuthResult> {
    try {
      await signOut(auth);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user logged in',
        };
      }

      await updatePassword(user, newPassword);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Update user profile
  async updateUserProfile(displayName?: string, photoURL?: string): Promise<AuthResult> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'No user logged in',
        };
      }

      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
      });

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Get user data from Firestore
  async getUserData(userId?: string): Promise<FirebaseUser | null> {
    try {
      const uid = userId || auth.currentUser?.uid;
      if (!uid) return null;

      return await userService.getUserById(uid);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },
};
