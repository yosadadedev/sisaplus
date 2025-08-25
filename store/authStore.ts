import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase, supabaseHelpers } from '../lib/supabase'
import { Database } from '../lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  
  // Actions
  initialize: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: any }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>
  signUp: (
     email: string, 
     password: string, 
     fullName: string,
     whatsapp?: string,
     address?: string,
     status?: string
   ) => Promise<{ success: boolean; error?: string; data?: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  setExpoPushToken: (token: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true })
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        set({ user: session.user })
        
        // Get user profile
        const { data: profile } = await supabaseHelpers.getProfile(session.user.id)
        if (profile) {
          set({ profile })
        }
      }
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          set({ user: session.user })
          
          // Get or create profile
          let { data: profile, error } = await supabaseHelpers.getProfile(session.user.id)
          
          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { data: newProfile } = await supabaseHelpers.updateProfile(session.user.id, {
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              avatar_url: session.user.user_metadata?.avatar_url || null,
            })
            profile = newProfile
          }
          
          if (profile) {
            set({ profile })
          }
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null })
        }
      })
      
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ loading: true })
      const { data, error } = await supabaseHelpers.signInWithGoogle()
      return { error }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error }
    } finally {
      set({ loading: false })
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      set({ loading: true })
      const { data, error } = await supabaseHelpers.signInWithEmail(email, password)
      return { error }
    } catch (error) {
      console.error('Sign in with email error:', error)
      return { error }
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (
     email: string, 
     password: string, 
     fullName: string,
     whatsapp?: string,
     address?: string,
     status?: string
   ) => {
    set({ loading: true });
    try {
      const { data, error } = await supabaseHelpers.signUp(
         email, 
         password, 
         fullName,
         whatsapp,
         address,
         status
       );
      if (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Terjadi kesalahan saat mendaftar' };
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      await supabaseHelpers.signOut()
      set({ user: null, profile: null })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (updates) => {
    try {
      const { user, profile } = get()
      if (!user || !profile) return
      
      set({ loading: true })
      const { data: updatedProfile } = await supabaseHelpers.updateProfile(user.id, updates)
      
      if (updatedProfile) {
        set({ profile: updatedProfile })
      }
    } catch (error) {
      console.error('Update profile error:', error)
    } finally {
      set({ loading: false })
    }
  },

  setExpoPushToken: async (token) => {
    try {
      const { user } = get()
      if (!user) return
      
      await get().updateProfile({ expo_push_token: token })
    } catch (error) {
      console.error('Set push token error:', error)
    }
  },
}))