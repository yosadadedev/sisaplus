import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Database } from './database.types'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not configured. Please check your .env file.')
  console.warn('Required variables: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth helpers
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    return { data, error }
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signUp(
    email: string, 
    password: string, 
    fullName: string,
    whatsapp?: string,
    address?: string,
    status?: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'sisaplus://auth/callback',
        data: {
          full_name: fullName,
          display_name: fullName,
          phone: whatsapp,
          whatsapp: whatsapp,
          address: address,
          status: status,
        },
      },
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Profile helpers
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Food helpers
  async getFoods(filters?: {
    status?: 'available' | 'booked' | 'completed' | 'expired'
    category?: string
    latitude?: number
    longitude?: number
    radius?: number
  }) {
    let query = supabase
      .from('foods')
      .select(`
        *,
        profiles:donor_id(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    // For location-based filtering, use RPC function
    if (filters?.latitude && filters?.longitude) {
      const { data, error } = await supabase.rpc('get_nearby_foods', {
        lat: filters.latitude,
        lng: filters.longitude,
        radius_km: filters.radius || 5
      })
      return { data, error }
    }

    const { data, error } = await query
    return { data, error }
  },

  async createFood(foodData: any) {
    const { data, error } = await supabase.functions.invoke('create-food', {
      body: foodData
    })
    return { data, error }
  },

  async bookFood(foodId: string, message?: string) {
    const { data, error } = await supabase.functions.invoke('book-food', {
      body: { food_id: foodId, message }
    })
    return { data, error }
  },

  // Booking helpers
  async getUserBookings(userId: string, type: 'donor' | 'receiver') {
    const column = type === 'donor' ? 'donor_id' : 'receiver_id'
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        foods(*),
        profiles:${type === 'donor' ? 'receiver_id' : 'donor_id'}(full_name, avatar_url)
      `)
      .eq(`foods.${column}`, userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single()
    return { data, error }
  },

  // Notification helpers
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    return { data, error }
  },

  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    return { data, error }
  },

  // Real-time subscriptions
  subscribeFoods(callback: (payload: any) => void) {
    return supabase
      .channel('foods')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'foods'
      }, callback)
      .subscribe()
  },

  subscribeBookings(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `receiver_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  // Handle email confirmation callback
  async handleEmailConfirmation(url: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(url)
    return { data, error }
  },

  // Resend confirmation email
  async resendConfirmation(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: 'sisaplus://auth/callback'
      }
    })
    return { data, error }
  }
}