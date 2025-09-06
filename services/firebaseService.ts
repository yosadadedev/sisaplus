import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseUser, FirebaseFood, FirebaseBooking, COLLECTIONS } from '../types/firebase';
import { Food, Booking, BookingWithFood } from '../lib/database';

// Conversion functions between Firebase and local types
export const convertFirebaseFoodToLocal = (firebaseFood: FirebaseFood, userData?: FirebaseUser): Food => {
  return {
    id: firebaseFood.id,
    title: firebaseFood.name,
    description: firebaseFood.description,
    unit: 'portion', // Default unit
    pickup_address: firebaseFood.location || '',
    pickup_time_start: '09:00',
    pickup_time_end: '18:00',
    dietary_info: null,
    allergen_info: null,
    preparation_notes: null,
    price_type: firebaseFood.price > 0 ? 'paid' : 'free',
    price: firebaseFood.price,
    is_featured: false,
    view_count: 0,
    donor_id: firebaseFood.sellerId,
    created_at: firebaseFood.createdAt.toDate().toISOString(),
    updated_at: firebaseFood.updatedAt.toDate().toISOString(),
    expired_at:
      firebaseFood.expiryDate?.toDate().toISOString() ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    image_urls: firebaseFood.image_urls || [],
    category: firebaseFood.category,
    location: firebaseFood.location,
    status: firebaseFood.isAvailable ? 'available' : 'completed',
    profiles: userData ? {
      full_name: userData.name,
    } : {
      full_name: 'Pengguna tidak diketahui',
      avatar_url: undefined,
    },
  };
};

export const convertLocalFoodToFirebase = (
  localFood: Omit<Food, 'id' | 'created_at' | 'updated_at'>
): Omit<FirebaseFood, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: localFood.title,
    description: localFood.description || '',
    price: localFood.price || 0,
    image_urls: localFood.image_urls || [],
    category: localFood.category || 'others',
    isAvailable: localFood.status !== 'completed',
    sellerId: localFood.donor_id,
    sellerName: '', // Will be filled by the service
    location: localFood.location || localFood.pickup_address,
    expiryDate: localFood.expired_at ? Timestamp.fromDate(new Date(localFood.expired_at)) : undefined,
  };
};

export const convertFirebaseBookingToLocal = (firebaseBooking: FirebaseBooking): Booking => {
  // Helper function to convert timestamp to ISO string
  const toISOString = (timestamp: any): string => {
    if (!timestamp) return new Date().toISOString();
    if (typeof timestamp === 'string') return timestamp;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }
    return new Date(timestamp).toISOString();
  };

  return {
    id: firebaseBooking.id,
    food_id: firebaseBooking.foodId,
    user_id: firebaseBooking.buyerId,
    status: firebaseBooking.status,
    pickup_time: firebaseBooking.pickupTime ? toISOString(firebaseBooking.pickupTime) : null,
    notes: firebaseBooking.notes || null,
    created_at: toISOString(firebaseBooking.createdAt),
    updated_at: toISOString(firebaseBooking.updatedAt),
  };
};

// User Services
export const userService = {
  // Create user document with specific ID (Firebase Auth UID)
  async createUser(
    userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>,
    userId?: string
  ): Promise<string> {
    const now = Timestamp.now();
    
    if (userId) {
      // Use setDoc with specific document ID (Firebase Auth UID)
      const docRef = doc(db, COLLECTIONS.USERS, userId);
      await setDoc(docRef, {
        ...userData,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    } else {
      // Fallback to auto-generated ID
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...userData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<FirebaseUser | null> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseUser;
    }
    return null;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirebaseUser;
    }
    return null;
  },

  // Update user
  async updateUser(
    userId: string,
    userData: Partial<Omit<FirebaseUser, 'id' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
  },
};

// Food Services
export const foodService = {
  // Create food
  async createFood(foodData: Omit<Food, 'id' | 'created_at' | 'updated_at'>): Promise<Food> {
    // Get user data for seller info
    const user = await userService.getUserById(foodData.donor_id);
    if (!user) {
      throw new Error('User not found');
    }

    const firebaseData: Omit<FirebaseFood, 'id' | 'createdAt' | 'updatedAt'> = {
      ...convertLocalFoodToFirebase(foodData),
      sellerName: user.name,
      sellerPhone: user.phone,
    };

    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.FOODS), {
      ...firebaseData,
      createdAt: now,
      updatedAt: now,
    });

    // Return the created food as local type
    const createdFood: Food = {
      ...foodData,
      id: docRef.id,
      created_at: now.toDate().toISOString(),
      updated_at: now.toDate().toISOString(),
    };

    return createdFood;
  },

  // Get available foods
  async getAvailableFoods(): Promise<Food[]> {
    const q = query(
      collection(db, COLLECTIONS.FOODS),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const firebaseFoods = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as FirebaseFood
    );
    
    // Get user data for each food
    const foodsWithProfiles = await Promise.all(
      firebaseFoods.map(async (firebaseFood) => {
        const userData = await userService.getUserById(firebaseFood.sellerId);
        return convertFirebaseFoodToLocal(firebaseFood, userData || undefined);
      })
    );
    
    return foodsWithProfiles;
  },

  // Get foods by seller
  async getFoodsBySeller(sellerId: string): Promise<Food[]> {
    const q = query(
      collection(db, COLLECTIONS.FOODS),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const firebaseFoods = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as FirebaseFood
    );
    
    // Get user data for each food
    const userData = await userService.getUserById(sellerId);
    return firebaseFoods.map(firebaseFood => convertFirebaseFoodToLocal(firebaseFood, userData || undefined));
  },

  // Get food by ID
  async getFoodById(foodId: string): Promise<Food | null> {
    const docRef = doc(db, COLLECTIONS.FOODS, foodId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const firebaseFood = { id: docSnap.id, ...docSnap.data() } as FirebaseFood;
      // Get user data for profiles
      const userData = await userService.getUserById(firebaseFood.sellerId);
      return convertFirebaseFoodToLocal(firebaseFood, userData || undefined);
    }
    return null;
  },

  // Get user donations (alias for getFoodsBySeller)
  async getUserDonations(userId: string): Promise<Food[]> {
    return this.getFoodsBySeller(userId);
  },

  // Update food
  async updateFood(
    foodId: string,
    foodData: Partial<Omit<FirebaseFood, 'id' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.FOODS, foodId);
    await updateDoc(docRef, {
      ...foodData,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete food
  async deleteFood(foodId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.FOODS, foodId);
    await deleteDoc(docRef);
  },

  // Listen to foods real-time
  onFoodsSnapshot(callback: (foods: Food[]) => void): () => void {
    const q = query(
      collection(db, COLLECTIONS.FOODS),
      where('isAvailable', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, async (querySnapshot: QuerySnapshot<DocumentData>) => {
      const firebaseFoods = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FirebaseFood
      );
      
      // Get user data for each food
      const foodsWithProfiles = await Promise.all(
        firebaseFoods.map(async (firebaseFood) => {
          const userData = await userService.getUserById(firebaseFood.sellerId);
          return convertFirebaseFoodToLocal(firebaseFood, userData || undefined);
        })
      );
      
      callback(foodsWithProfiles);
    });
  },

  // Alias for compatibility with foodStore
  listenToFoods(callback: (foods: Food[]) => void): () => void {
    return this.onFoodsSnapshot(callback);
  },
};

// Booking Services
export const bookingService = {
  // Create booking
  async createBooking(
    bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Booking> {
    // Get food and user data for booking info
    console.log('Creating booking with data:', { food_id: bookingData.food_id, user_id: bookingData.user_id });
    
    const foodDoc = await getDoc(doc(db, COLLECTIONS.FOODS, bookingData.food_id));
    const user = await userService.getUserById(bookingData.user_id);

    console.log('Food exists:', foodDoc.exists());
    console.log('User found:', !!user);
    
    if (!foodDoc.exists()) {
      console.error('Food not found with ID:', bookingData.food_id);
      throw new Error('Food not found');
    }
    
    if (!user) {
      console.error('User not found with ID:', bookingData.user_id);
      throw new Error('User not found');
    }

    const foodData = { id: foodDoc.id, ...foodDoc.data() } as FirebaseFood;

    const firebaseBookingData: Omit<FirebaseBooking, 'id' | 'createdAt' | 'updatedAt'> = {
      foodId: bookingData.food_id,
      foodName: foodData.name,
      foodPrice: foodData.price,
      buyerId: bookingData.user_id,
      buyerName: user.name,
      buyerPhone: user.phone,
      sellerId: foodData.sellerId,
      sellerName: foodData.sellerName,
      quantity: 1,
      totalPrice: foodData.price,
      status: bookingData.status,
      ...(bookingData.notes ? { notes: bookingData.notes } : {}),
      ...(bookingData.pickup_time && {
        pickupTime: Timestamp.fromDate(new Date(bookingData.pickup_time))
      }),
    };

    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.BOOKINGS), {
      ...firebaseBookingData,
      createdAt: now,
      updatedAt: now,
    });

    // Return the created booking as local type
    const createdBooking: Booking = {
      ...bookingData,
      id: docRef.id,
      created_at: now.toDate().toISOString(),
      updated_at: now.toDate().toISOString(),
    };

    return createdBooking;
  },

  // Get bookings by buyer
  async getBookingsByBuyer(buyerId: string): Promise<Booking[]> {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('buyerId', '==', buyerId)
    );
    const querySnapshot = await getDocs(q);
    const firebaseBookings = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as FirebaseBooking
    );
    // Sort manually by created_at descending
    const localBookings = firebaseBookings.map(convertFirebaseBookingToLocal);
    return localBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Get bookings by seller
  async getBookingsBySeller(sellerId: string): Promise<FirebaseBooking[]> {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FirebaseBooking);
  },

  // Update booking status
  async updateBookingStatus(bookingId: string, status: FirebaseBooking['status']): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
  },

  // Update booking
  async updateBooking(
    bookingId: string,
    bookingData: Partial<Omit<FirebaseBooking, 'id' | 'createdAt'>>
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    await updateDoc(docRef, {
      ...bookingData,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete booking
  async deleteBooking(bookingId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    await deleteDoc(docRef);
  },

  // Listen to user bookings real-time
  listenToUserBookings(
    userId: string,
    callback: (bookings: BookingWithFood[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTIONS.BOOKINGS),
      where('buyerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, async (querySnapshot: QuerySnapshot<DocumentData>) => {
      const firebaseBookings = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as FirebaseBooking
      );

      // Convert to BookingWithFood by fetching food data
      const bookingsWithFood: BookingWithFood[] = await Promise.all(
        firebaseBookings.map(async (firebaseBooking) => {
          const booking = convertFirebaseBookingToLocal(firebaseBooking);

          // Get food data
          const foodDoc = await getDoc(doc(db, COLLECTIONS.FOODS, firebaseBooking.foodId));
          let food: Food;

          if (foodDoc.exists()) {
            const firebaseFood = { id: foodDoc.id, ...foodDoc.data() } as FirebaseFood;
            food = convertFirebaseFoodToLocal(firebaseFood);
          } else {
            // Create a placeholder food if not found
            food = {
              id: firebaseBooking.foodId,
              title: firebaseBooking.foodName,
              description: 'Food not found',
              unit: 'portion',
              pickup_address: '',
              pickup_time_start: '09:00',
              pickup_time_end: '18:00',
              dietary_info: null,
              allergen_info: null,
              preparation_notes: null,
              price_type: firebaseBooking.foodPrice > 0 ? 'paid' : 'free',
              price: firebaseBooking.foodPrice,
              is_featured: false,
              view_count: 0,
              donor_id: firebaseBooking.sellerId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              expired_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            };
          }

          return {
            ...booking,
            food,
          };
        })
      );

      callback(bookingsWithFood);
    });
  },
};
