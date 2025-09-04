import { create } from 'zustand';
import { foodService, bookingService } from '../services/firebaseService';
import { Food, Booking, BookingWithFood } from '../lib/database';
import { useAuthStore } from './authStore';
import { Unsubscribe } from 'firebase/firestore';



interface FoodStore {
  foods: Food[];
  filteredFoods: Food[];
  selectedCategory: string | null;
  myDonations: Food[];
  userBookings: BookingWithFood[];
  incomingBookings: BookingWithFood[];
  isLoading: boolean;
  error: string | null;

  // Firebase listeners
  foodsListener: Unsubscribe | null;
  bookingsListener: Unsubscribe | null;

  // Actions
  loadFoods: (category?: string, searchQuery?: string) => Promise<void>;
  loadMyDonations: () => Promise<void>;
  loadUserBookings: () => Promise<void>;
  loadIncomingBookings: () => Promise<void>;
  createFood: (food: Omit<Food, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  bookFood: (foodId: string, userId: string, notes?: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  initFirestore: () => Promise<void>;
  cleanup: () => void;
  setCategory: (category: string | null) => void;
  getCategories: () => string[];
}

// Helper function to get current timestamp
const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

export const useFoodStore = create<FoodStore>((set, get) => ({
  foods: [],
  filteredFoods: [],
  selectedCategory: null,
  myDonations: [],
  userBookings: [],
  incomingBookings: [],
  isLoading: false,
  error: null,
  foodsListener: null,
  bookingsListener: null,

  // Initialize Firestore listeners
  initFirestore: async () => {
    try {
      const { foodsListener, bookingsListener } = get();

      // Clean up existing listeners
      if (foodsListener) foodsListener();
      if (bookingsListener) bookingsListener();

      // Setup foods listener
      const newFoodsListener = foodService.listenToFoods((foods) => {
        set({ foods, filteredFoods: foods });
      });

      // Setup bookings listener for current user
      const currentUser = useAuthStore.getState().user;
      let newBookingsListener: Unsubscribe | null = null;

      if (currentUser) {
        newBookingsListener = bookingService.listenToUserBookings(currentUser.id, (bookings) => {
          set({ userBookings: bookings });
        });
      }

      set({
        foodsListener: newFoodsListener,
        bookingsListener: newBookingsListener,
      });

      console.log('Firestore listeners initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      set({ error: 'Failed to initialize Firestore' });
    }
  },

  // Cleanup listeners
  cleanup: () => {
    const { foodsListener, bookingsListener } = get();
    if (foodsListener) foodsListener();
    if (bookingsListener) bookingsListener();
    set({ foodsListener: null, bookingsListener: null });
  },

  loadFoods: async (category?: string, searchQuery?: string) => {
    set({ isLoading: true, error: null });

    try {
      const foods = await foodService.getAvailableFoods();
      const currentUser = useAuthStore.getState().user;
      
      // Filter out user's own donations
      const allFoods = foods.filter(food => food.donor_id !== currentUser?.id);

      // Update selectedCategory if category parameter is provided
      if (category !== undefined) {
        set({ selectedCategory: category });
      }

      // Get the active category (from parameter or current state)
      const { selectedCategory } = get();
      const activeCategory = category !== undefined ? category : selectedCategory;

      // Apply filters
      let filteredFoods = allFoods;

      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredFoods = filteredFoods.filter(
          (food) =>
            food.title.toLowerCase().includes(query) ||
            (food.description && food.description.toLowerCase().includes(query))
        );
      }

      // Apply category filter
      if (activeCategory && activeCategory !== null && activeCategory !== 'all') {
        filteredFoods = filteredFoods.filter((food) => food.category === activeCategory);
      }

      set({ foods: allFoods, filteredFoods: filteredFoods, isLoading: false });
    } catch (error) {
      console.error('Error loading foods:', error);
      // Don't fallback to dummy data as it causes booking errors
      // Instead, show empty state with proper error message
      set({
        foods: [],
        filteredFoods: [],
        error: 'Failed to load foods from server. Please check your connection.',
        isLoading: false,
      });
    }
  },

  loadMyDonations: async () => {
    set({ isLoading: true, error: null });

    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        set({ myDonations: [], isLoading: false });
        return;
      }

      const donations = await foodService.getUserDonations(currentUser.id);
      set({ myDonations: donations, isLoading: false });
    } catch (error) {
      console.error('Error loading my donations:', error);
      set({ myDonations: [], error: 'Failed to load donations', isLoading: false });
    }
  },

  loadUserBookings: async () => {
    set({ isLoading: true, error: null });

    try {
      const { user } = useAuthStore.getState();
      if (!user?.id) {
        set({ userBookings: [], isLoading: false });
        return;
      }

      const bookings = await bookingService.getBookingsByBuyer(user.id);
      
      // Fetch food details for each booking
      const bookingsWithFood: BookingWithFood[] = await Promise.all(
        bookings.map(async (booking: Booking) => {
          try {
            const food = await foodService.getFoodById(booking.food_id);
            return {
              ...booking,
              food: food || {
                id: booking.food_id,
                title: 'Makanan tidak ditemukan',
                description: '',
                unit: '',
                pickup_address: '',
                pickup_time_start: '',
                pickup_time_end: '',
                dietary_info: null,
                allergen_info: null,
                preparation_notes: null,
                price_type: 'free' as const,
                price: null,
                is_featured: false,
                view_count: 0,
                donor_id: '',
                created_at: '',
                updated_at: '',
                expired_at: '',
                quantity: 0,
                category: '',
                location: '',
                distance_km: 0,
                status: 'completed' as const,
                profiles: {
                  full_name: 'Tidak diketahui',
                  avatar_url: undefined,
                },
              } as Food,
            };
          } catch (error) {
             console.error('Error fetching food for booking:', booking.id, error);
             return {
               ...booking,
               food: {
                 id: booking.food_id,
                 title: 'Makanan tidak ditemukan',
                 description: '',
                 unit: '',
                 pickup_address: '',
                 pickup_time_start: '',
                 pickup_time_end: '',
                 dietary_info: null,
                 allergen_info: null,
                 preparation_notes: null,
                 price_type: 'free' as const,
                 price: null,
                 is_featured: false,
                 view_count: 0,
                 donor_id: '',
                 created_at: '',
                 updated_at: '',
                 expired_at: '',
                 quantity: 0,
                 category: '',
                 location: '',
                 distance_km: 0,
                 status: 'completed' as const,
                 profiles: {
                   full_name: 'Tidak diketahui',
                   avatar_url: undefined,
                 },
               } as Food,
             };
           }
        })
      );

      set({ userBookings: bookingsWithFood, isLoading: false });
    } catch (error) {
      console.error('Error loading user bookings:', error);
      set({ userBookings: [], error: 'Failed to load bookings', isLoading: false });
    }
  },

  loadIncomingBookings: async () => {
    set({ isLoading: true, error: null });

    try {
      const { user } = useAuthStore.getState();
      if (!user?.id) {
        set({ incomingBookings: [], isLoading: false });
        return;
      }

      const firebaseBookings = await bookingService.getBookingsBySeller(user.id);
      
      // Convert Firebase bookings to local format and fetch food details
      const bookingsWithFood = await Promise.all(
        firebaseBookings.map(async (firebaseBooking) => {
          try {
            const booking = {
              id: firebaseBooking.id,
              food_id: firebaseBooking.foodId,
              user_id: firebaseBooking.buyerId,
              status: firebaseBooking.status,
              pickup_time: firebaseBooking.pickupTime?.toDate().toISOString() || null,
              notes: firebaseBooking.notes || null,
              created_at: firebaseBooking.createdAt.toDate().toISOString(),
              updated_at: firebaseBooking.updatedAt.toDate().toISOString(),
            } as Booking;

            const food = await foodService.getFoodById(booking.food_id);
            return {
              ...booking,
              food: food || {
                id: booking.food_id,
                title: firebaseBooking.foodName || 'Makanan tidak ditemukan',
                description: '',
                unit: '',
                pickup_address: '',
                pickup_time_start: '',
                pickup_time_end: '',
                dietary_info: null,
                allergen_info: null,
                preparation_notes: null,
                price_type: 'free' as const,
                price: null,
                is_featured: false,
                view_count: 0,
                donor_id: user.id,
                created_at: '',
                updated_at: '',
                expired_at: '',
                quantity: 0,
                category: '',
                location: '',
                distance_km: 0,
                status: 'completed' as const,
                profiles: {
                  full_name: firebaseBooking.buyerName || 'Pembeli tidak ditemukan',
                  avatar_url: undefined,
                },
              } as Food,
            } as BookingWithFood;
          } catch (error) {
            console.error('Error processing incoming booking:', firebaseBooking.id, error);
            return null;
          }
        })
      );

      // Filter out null values
      const validBookings = bookingsWithFood.filter((booking): booking is BookingWithFood => booking !== null);
      
      set({ incomingBookings: validBookings, isLoading: false });
    } catch (error) {
      console.error('Error loading incoming bookings:', error);
      if (error instanceof Error && error.message.includes('index')) {
        console.log('Firebase index is still building. Please wait a few minutes and try again.');
      }
      // Set empty array to prevent UI issues
      set({ incomingBookings: [], error: 'Failed to load incoming bookings', isLoading: false });
    }
  },

  createFood: async (foodData) => {
    set({ isLoading: true, error: null });

    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const newFood = await foodService.createFood({
        ...foodData,
        donor_id: currentUser.id,
      });

      // Update local state
      const currentFoods = get().foods;
      set({ foods: [...currentFoods, newFood], isLoading: false });

      // Also add to myDonations
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
      const bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'> = {
        food_id: foodId,
        user_id: userId,
        status: 'pending',
        pickup_time: null,
        notes: notes && notes.trim() !== '' ? notes : null,
      };
      
      const newBooking = await bookingService.createBooking(bookingData);

      // Find the food item
      const food = get().foods.find((f) => f.id === foodId);
      if (!food) {
        throw new Error('Food not found');
      }

      const bookingWithFood: BookingWithFood = {
        ...newBooking,
        food,
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
      const updatedBookings = currentBookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status, updated_at: getCurrentTimestamp() }
          : booking
      );

      set({ userBookings: updatedBookings, isLoading: false });
    } catch (error) {
      console.error('Error updating booking status:', error);
      set({ error: 'Failed to update booking status', isLoading: false });
    }
  },

  setCategory: (category: string | null) => {
    const { foods } = get();
    let filteredFoods = foods;

    // Apply category filter
    if (category && category !== null && category !== 'all') {
      filteredFoods = foods.filter((food) => food.category === category);
    }

    set({
      selectedCategory: category,
      filteredFoods,
    });
  },

  getCategories: () => {
    const { foods } = get();
    const categories = [...new Set(foods.map((food) => food.category).filter(Boolean))] as string[];
    return categories.sort();
  },
}));
