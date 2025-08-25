import { create } from 'zustand'
import { supabaseHelpers } from '../lib/supabase'
import { Database } from '../lib/database.types'
import * as Location from 'expo-location'

type Food = Database['public']['Tables']['foods']['Row'] & {
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
  distance_km?: number
}

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  foods?: Food
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

interface FoodState {
  foods: Food[]
  myDonations: Food[]
  myBookings: Booking[]
  userBookings: Booking[]
  loading: boolean
  refreshing: boolean
  error: string | null
  userLocation: Location.LocationObject | null
  
  // Filters
  selectedCategory: string | null
  searchQuery: string
  
  // Actions
  loadFoods: () => Promise<void>
  loadMyDonations: (userId: string) => Promise<void>
  loadMyBookings: (userId: string) => Promise<void>
  loadUserBookings: () => Promise<void>
  refreshFoods: () => Promise<void>
  createFood: (foodData: any) => Promise<{ success: boolean; error?: any }>
  bookFood: (foodId: string, message?: string) => Promise<{ success: boolean; error?: any }>
  updateBookingStatus: (bookingId: string, status: string) => Promise<{ success: boolean; error?: any }>
  setCategory: (category: string | null) => void
  setSearchQuery: (query: string) => void
  getUserLocation: () => Promise<void>
  
  // Real-time subscriptions
  subscribeToFoods: () => () => void
  subscribeToBookings: (userId: string) => () => void
  subscribeFoods: () => () => void
  subscribeBookings: () => () => void
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  myDonations: [],
  myBookings: [],
  userBookings: [],
  loading: false,
  refreshing: false,
  error: null,
  userLocation: null,
  selectedCategory: null,
  searchQuery: '',

  loadFoods: async () => {
    try {
      set({ loading: true })
      const { userLocation, selectedCategory } = get()
      
      const filters: any = {
        status: 'available'
      }
      
      if (selectedCategory) {
        filters.category = selectedCategory
      }
      
      if (userLocation) {
        filters.latitude = userLocation.coords.latitude
        filters.longitude = userLocation.coords.longitude
        filters.radius = 10 // 10km radius
      }
      
      const { data: foods, error } = await supabaseHelpers.getFoods(filters)
      
      if (error) {
        console.error('Error loading foods:', error)
        return
      }
      
      // Filter by search query if exists
      let filteredFoods = foods || []
      const { searchQuery } = get()
      
      if (searchQuery) {
        filteredFoods = filteredFoods.filter((food: Food) => 
          food.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          food.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          food.location.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      set({ foods: filteredFoods })
    } catch (error) {
      console.error('Load foods error:', error)
    } finally {
      set({ loading: false })
    }
  },

  loadMyDonations: async (userId: string) => {
    try {
      const { data: donations, error } = await supabaseHelpers.getFoods()
      
      if (error) {
        console.error('Error loading donations:', error)
        return
      }
      
      const myDonations = donations?.filter((food: Food) => food.donor_id === userId) || []
      set({ myDonations })
    } catch (error) {
      console.error('Load donations error:', error)
    }
  },

  loadMyBookings: async (userId: string) => {
    try {
      const { data: bookings, error } = await supabaseHelpers.getUserBookings(userId, 'receiver')
      
      if (error) {
        console.error('Error loading bookings:', error)
        return
      }
      
      set({ myBookings: bookings || [] })
    } catch (error) {
      console.error('Load bookings error:', error)
    }
  },

  refreshFoods: async () => {
    try {
      set({ refreshing: true })
      await get().loadFoods()
    } finally {
      set({ refreshing: false })
    }
  },

  createFood: async (foodData) => {
    try {
      set({ loading: true })
      const { data, error } = await supabaseHelpers.createFood(foodData)
      
      if (error) {
        console.error('Error creating food:', error)
        return { success: false, error }
      }
      
      // Refresh foods list
      await get().loadFoods()
      
      return { success: true }
    } catch (error) {
      console.error('Create food error:', error)
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  bookFood: async (foodId: string, message?: string) => {
    try {
      set({ loading: true })
      const { data, error } = await supabaseHelpers.bookFood(foodId, message)
      
      if (error) {
        console.error('Error booking food:', error)
        return { success: false, error }
      }
      
      // Refresh foods and bookings
      await get().loadFoods()
      
      return { success: true }
    } catch (error) {
      console.error('Book food error:', error)
      return { success: false, error }
    } finally {
      set({ loading: false })
    }
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    try {
      const { data, error } = await supabaseHelpers.updateBookingStatus(bookingId, status)
      
      if (error) {
        console.error('Error updating booking status:', error)
        return { success: false, error }
      }
      
      // Update local state
      set(state => ({
        myBookings: state.myBookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: status as any } : booking
        ),
        userBookings: state.userBookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: status as any } : booking
        )
      }))
      
      return { success: true }
    } catch (error) {
      console.error('Update booking status error:', error)
      return { success: false, error }
    }
  },

  loadUserBookings: async () => {
    try {
      set({ loading: true, error: null })
      const { data: bookings, error } = await supabaseHelpers.getUserBookings()
      
      if (error) {
        console.error('Error loading user bookings:', error)
        set({ error: 'Failed to load bookings' })
        return
      }
      
      set({ userBookings: bookings || [] })
    } catch (error) {
      console.error('Load user bookings error:', error)
      set({ error: 'Failed to load bookings' })
    } finally {
      set({ loading: false })
    }
  },

  setCategory: (category: string | null) => {
    set({ selectedCategory: category })
    get().loadFoods()
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query })
    get().loadFoods()
  },

  getUserLocation: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        console.log('Location permission denied')
        return
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      
      set({ userLocation: location })
      
      // Reload foods with location
      await get().loadFoods()
    } catch (error) {
      console.error('Get location error:', error)
    }
  },

  subscribeToFoods: () => {
    const subscription = supabaseHelpers.subscribeFoods((payload) => {
      console.log('Foods real-time update:', payload)
      get().loadFoods()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  },

  subscribeToBookings: (userId: string) => {
    const subscription = supabaseHelpers.subscribeBookings(userId, (payload) => {
      console.log('Bookings real-time update:', payload)
      get().loadMyBookings(userId)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  },

  subscribeFoods: () => {
    const subscription = supabaseHelpers.subscribeFoods((payload) => {
      console.log('Foods real-time update:', payload)
      get().loadFoods()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  },

  subscribeBookings: () => {
    const subscription = supabaseHelpers.subscribeBookings('', (payload) => {
      console.log('Bookings real-time update:', payload)
      get().loadUserBookings()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  },
}))