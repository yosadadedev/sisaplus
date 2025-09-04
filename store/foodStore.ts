import { create } from 'zustand';
import { db, initializeDatabase, generateId, getCurrentTimestamp, Food, Booking, BookingWithFood } from '../lib/database';

// Dummy data
const DUMMY_FOODS: Food[] = [
  {
    id: '1',
    title: 'Nasi Gudeg Yogya',
    description: 'Gudeg khas Yogyakarta dengan ayam dan telur, masih hangat dan segar',
    unit: 'porsi',
    pickup_address: 'Jl. Malioboro No. 123, Yogyakarta',
    pickup_time_start: '2024-01-15T18:00:00.000Z',
    pickup_time_end: '2024-01-15T20:00:00.000Z',
    dietary_info: 'Halal, tidak pedas',
    allergen_info: 'Mengandung telur',
    preparation_notes: 'Disajikan dengan nasi putih hangat',
    price_type: 'free',
    price: null,
    is_featured: true,
    view_count: 45,
    donor_id: 'donor1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    expired_at: '2024-01-16T20:00:00Z'
  },
  {
    id: '2',
    title: 'Soto Ayam Lamongan',
    description: 'Soto ayam dengan kuah bening, dilengkapi dengan telur dan kerupuk',
    unit: 'mangkok',
    pickup_address: 'Jl. Sudirman No. 456, Jakarta',
    pickup_time_start: '2024-01-15T11:00:00.000Z',
    pickup_time_end: '2024-01-15T13:00:00.000Z',
    dietary_info: 'Halal, sedikit pedas',
    allergen_info: 'Mengandung telur dan gluten',
    preparation_notes: 'Kuah masih panas, siap santap',
    price_type: 'free',
    price: null,
    is_featured: false,
    view_count: 23,
    donor_id: 'donor2',
    created_at: '2024-01-15T08:30:00Z',
    updated_at: '2024-01-15T08:30:00Z',
    expired_at: '2024-01-16T13:00:00Z'
  },
  {
    id: '3',
    title: 'Gado-gado Jakarta',
    description: 'Gado-gado dengan sayuran segar dan bumbu kacang yang gurih',
    unit: 'porsi',
    pickup_address: 'Jl. Thamrin No. 789, Jakarta',
    pickup_time_start: '2024-01-15T12:00:00.000Z',
    pickup_time_end: '2024-01-15T14:00:00.000Z',
    dietary_info: 'Vegetarian, halal',
    allergen_info: 'Mengandung kacang',
    preparation_notes: 'Bumbu kacang terpisah untuk menjaga kesegaran',
    price_type: 'paid',
    price: 15000,
    is_featured: true,
    view_count: 67,
    donor_id: 'donor3',
    created_at: '2024-01-15T09:15:00Z',
    updated_at: '2024-01-15T09:15:00Z',
    expired_at: '2024-01-16T14:00:00Z'
  }
];

const DUMMY_MY_DONATIONS: Food[] = [
  {
    id: '4',
    title: 'Rendang Padang',
    description: 'Rendang daging sapi khas Padang yang empuk dan bumbu meresap',
    unit: 'porsi',
    pickup_address: 'Jl. Asia Afrika No. 101, Bandung',
    pickup_time_start: '2024-01-14T19:00:00.000Z',
    pickup_time_end: '2024-01-14T21:00:00.000Z',
    dietary_info: 'Halal, pedas sedang',
    allergen_info: 'Tidak ada',
    preparation_notes: 'Masih hangat, siap untuk dibagikan',
    price_type: 'free',
    price: null,
    is_featured: false,
    view_count: 12,
    donor_id: 'current_user',
    created_at: '2024-01-14T16:00:00Z',
    updated_at: '2024-01-14T16:00:00Z',
    expired_at: '2024-01-15T21:00:00Z'
  },
  {
    id: '5',
    title: 'Bakso Malang',
    description: 'Bakso dengan berbagai isian, kuah hangat dan mie',
    unit: 'mangkok',
    pickup_address: 'Jl. Diponegoro No. 202, Malang',
    pickup_time_start: '2024-01-14T17:30:00.000Z',
    pickup_time_end: '2024-01-14T19:30:00.000Z',
    dietary_info: 'Halal',
    allergen_info: 'Mengandung gluten',
    preparation_notes: 'Kuah panas, bakso fresh',
    price_type: 'free',
    price: null,
    is_featured: true,
    view_count: 34,
    donor_id: 'current_user',
    created_at: '2024-01-14T14:30:00Z',
    updated_at: '2024-01-14T14:30:00Z',
    expired_at: '2024-01-15T19:30:00Z'
  }
];

const DUMMY_USER_BOOKINGS: BookingWithFood[] = [
  {
    id: 'booking1',
    food_id: '1',
    user_id: 'current_user',
    status: 'confirmed',
    pickup_time: '2024-01-15T19:00:00Z',
    notes: 'Akan datang tepat waktu',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:30:00Z',
    food: DUMMY_FOODS[0]
  },
  {
    id: 'booking2',
    food_id: '2',
    user_id: 'current_user',
    status: 'pending',
    pickup_time: null,
    notes: 'Menunggu konfirmasi dari donor',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    food: DUMMY_FOODS[1]
  },
  {
    id: 'booking3',
    food_id: '3',
    user_id: 'current_user',
    status: 'completed',
    pickup_time: '2024-01-14T13:00:00Z',
    notes: 'Makanan sudah diambil, terima kasih',
    created_at: '2024-01-14T11:00:00Z',
    updated_at: '2024-01-14T13:30:00Z',
    food: DUMMY_FOODS[2]
  }
];

interface FoodStore {
  foods: Food[];
  myDonations: Food[];
  userBookings: BookingWithFood[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadFoods: (category?: string, searchQuery?: string) => Promise<void>;
  loadMyDonations: () => Promise<void>;
  loadUserBookings: () => Promise<void>;
  createFood: (food: Omit<Food, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  bookFood: (foodId: string, userId: string, notes?: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  initDatabase: () => Promise<void>;
}

export const useFoodStore = create<FoodStore>((set, get) => ({
  foods: [],
  myDonations: [],
  userBookings: [],
  isLoading: false,
  error: null,

  initDatabase: async () => {
    try {
      await initializeDatabase();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      set({ error: 'Failed to initialize database' });
    }
  },

  loadFoods: async (category?: string, searchQuery?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, use dummy data as SQLite implementation
      let filteredFoods = [...DUMMY_FOODS];
      
      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredFoods = filteredFoods.filter(food => 
          food.title.toLowerCase().includes(query) ||
          (food.description && food.description.toLowerCase().includes(query))
        );
      }
      
      // Apply category filter if provided
      if (category && category !== 'all') {
        // For now, we don't have category field, so we'll skip this filter
        // In future, add category field to Food interface
      }
      
      set({ foods: filteredFoods, isLoading: false });
    } catch (error) {
      console.error('Error loading foods:', error);
      // Fallback to dummy data on error
      set({ foods: DUMMY_FOODS, error: 'Failed to load foods', isLoading: false });
    }
  },

  loadMyDonations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, use dummy data
      set({ myDonations: DUMMY_MY_DONATIONS, isLoading: false });
    } catch (error) {
      console.error('Error loading my donations:', error);
      set({ myDonations: [], error: 'Failed to load donations', isLoading: false });
    }
  },

  loadUserBookings: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // For now, use dummy data
      set({ userBookings: DUMMY_USER_BOOKINGS, isLoading: false });
    } catch (error) {
      console.error('Error loading user bookings:', error);
      set({ userBookings: [], error: 'Failed to load bookings', isLoading: false });
    }
  },

  createFood: async (foodData) => {
    set({ isLoading: true, error: null });
    
    try {
      const newFood: Food = {
        ...foodData,
        id: generateId(),
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      // For now, just add to dummy data
      const currentFoods = get().foods;
      set({ foods: [...currentFoods, newFood], isLoading: false });
      
      // Also add to myDonations if it's from current user
      const currentDonations = get().myDonations;
      set({ myDonations: [...currentDonations, newFood] });
      
    } catch (error) {
      console.error('Error creating food:', error);
      set({ error: 'Failed to create food', isLoading: false });
    }
  },

  bookFood: async (foodId: string, userId: string, notes?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const newBooking: Booking = {
        id: generateId(),
        food_id: foodId,
        user_id: userId,
        status: 'pending',
        pickup_time: null,
        notes: notes || null,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp()
      };
      
      // Find the food item
      const food = get().foods.find(f => f.id === foodId);
      if (!food) {
        throw new Error('Food not found');
      }
      
      const bookingWithFood: BookingWithFood = {
        ...newBooking,
        food
      };
      
      // Add to user bookings
      const currentBookings = get().userBookings;
      set({ userBookings: [...currentBookings, bookingWithFood], isLoading: false });
      
    } catch (error) {
      console.error('Error booking food:', error);
      set({ error: 'Failed to book food', isLoading: false });
    }
  },

  updateBookingStatus: async (bookingId: string, status: Booking['status']) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentBookings = get().userBookings;
      const updatedBookings = currentBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, updated_at: getCurrentTimestamp() }
          : booking
      );
      
      set({ userBookings: updatedBookings, isLoading: false });
      
    } catch (error) {
      console.error('Error updating booking status:', error);
      set({ error: 'Failed to update booking status', isLoading: false });
    }
  }
}));