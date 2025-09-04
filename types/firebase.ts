import { Timestamp } from 'firebase/firestore';

// Firebase User Document
export interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firebase Food Document
export interface FirebaseFood {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  sellerId: string; // Reference to user who posted the food
  sellerName: string;
  sellerPhone?: string;
  location?: string;
  expiryDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firebase Booking Document
export interface FirebaseBooking {
  id: string;
  foodId: string; // Reference to food document
  foodName: string;
  foodPrice: number;
  buyerId: string; // Reference to user who made the booking
  buyerName: string;
  buyerPhone?: string;
  sellerId: string; // Reference to food seller
  sellerName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  pickupTime?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  FOODS: 'foods',
  BOOKINGS: 'bookings',
} as const;
