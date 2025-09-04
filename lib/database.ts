import * as SQLite from 'expo-sqlite';

// Database configuration
const DATABASE_NAME = 'sisaplus.db';
const DATABASE_VERSION = 1;

// Open database
export const db = SQLite.openDatabaseSync(DATABASE_NAME);

// Database types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Food {
  id: string;
  title: string;
  description: string | null;
  unit: string;
  pickup_address: string;
  pickup_time_start: string;
  pickup_time_end: string;
  dietary_info: string | null;
  allergen_info: string | null;
  preparation_notes: string | null;
  price_type: 'free' | 'paid';
  price: number | null;
  is_featured: boolean;
  view_count: number;
  donor_id: string;
  created_at: string;
  updated_at: string;
  expired_at: string;
}

export interface Booking {
  id: string;
  food_id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pickup_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithFood extends Booking {
  food: Food;
}

// Initialize database tables
export const initializeDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.withTransactionSync(() => {
      try {
        // Users table
        db.execSync(
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            phone TEXT,
            address TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          );`
        );

        // Foods table
        db.execSync(
          `CREATE TABLE IF NOT EXISTS foods (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            unit TEXT NOT NULL,
            pickup_address TEXT NOT NULL,
            pickup_time_start TEXT NOT NULL,
            pickup_time_end TEXT NOT NULL,
            dietary_info TEXT,
            allergen_info TEXT,
            preparation_notes TEXT,
            price_type TEXT NOT NULL CHECK (price_type IN ('free', 'paid')),
            price REAL,
            is_featured INTEGER NOT NULL DEFAULT 0,
            view_count INTEGER NOT NULL DEFAULT 0,
            donor_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            expired_at TEXT NOT NULL,
            FOREIGN KEY (donor_id) REFERENCES users (id)
          );`
        );

        // Bookings table
        db.execSync(
          `CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            food_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
            pickup_time TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (food_id) REFERENCES foods (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
          );`
        );

        console.log('Database tables created successfully');
        console.log('Database initialization completed');
        resolve();
      } catch (error: any) {
        console.error('Error creating database tables:', error);
        reject(error);
      }
    });
  });
};

// Helper function to generate UUID
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper function to get current timestamp
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};