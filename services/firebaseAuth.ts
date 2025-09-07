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
      // Add retry mechanism for Firestore operations
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await userService.createUser({
            email,
            name,
            phone: phone || '',
          }, user.uid);
          break; // Success, exit retry loop
        } catch (firestoreError: any) {
          retryCount++;
          console.log(`Firestore operation failed, retry ${retryCount}/${maxRetries}:`, firestoreError.message);
          
          if (retryCount >= maxRetries) {
            // If all retries failed, clean up the Auth user and throw error
            try {
              await user.delete();
            } catch (deleteError) {
              console.error('Failed to delete auth user after Firestore failure:', deleteError);
            }
            throw firestoreError;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        }
      }

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = error.message;
      
      if (error.message?.includes('timeout') || error.message?.includes('backend')) {
        errorMessage = 'Koneksi timeout. Periksa koneksi internet Anda dan coba lagi.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Gunakan minimal 6 karakter.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }
      
      return {
        success: false,
        error: errorMessage,
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
