export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Food {
  id: string
  title: string
  description: string
  category: string
  quantity: number
  location: string
  latitude?: number
  longitude?: number
  image_url?: string
  status: 'available' | 'booked' | 'completed' | 'expired'
  expired_at: string
  donor_id: string
  created_at: string
  updated_at: string
  distance_km?: number
  profiles?: {
    id: string
    full_name?: string
    avatar_url?: string
    phone?: string
  }
  bookings?: Booking[]
}

export interface Booking {
  id: string
  food_id: string
  receiver_id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  message?: string
  created_at: string
  updated_at: string
  foods?: Food
  profiles?: {
    id: string
    full_name?: string
    avatar_url?: string
    phone?: string
  }
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          role: 'donor' | 'receiver' | 'admin'
          expo_push_token: string | null
          location: unknown | null // PostGIS geography type
          address: string | null
          is_verified: boolean
          rating: number
          total_donations: number
          total_received: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          role?: 'donor' | 'receiver' | 'admin'
          expo_push_token?: string | null
          location?: unknown | null
          address?: string | null
          is_verified?: boolean
          rating?: number
          total_donations?: number
          total_received?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          role?: 'donor' | 'receiver' | 'admin'
          expo_push_token?: string | null
          location?: unknown | null
          address?: string | null
          is_verified?: boolean
          rating?: number
          total_donations?: number
          total_received?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          id: string
          donor_id: string
          title: string
          description: string | null
          category: string
          quantity: number
          unit: string
          image_urls: string[] | null
          pickup_location: unknown // PostGIS geography type
          pickup_address: string
          pickup_time_start: string
          pickup_time_end: string
          expired_at: string
          status: 'available' | 'booked' | 'completed' | 'expired' | 'cancelled'
          dietary_info: string[] | null
          allergen_info: string[] | null
          preparation_notes: string | null
          price_type: 'free' | 'paid'
          price: number
          is_featured: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          title: string
          description?: string | null
          category: string
          quantity?: number
          unit?: string
          image_urls?: string[] | null
          pickup_location: unknown
          pickup_address: string
          pickup_time_start: string
          pickup_time_end: string
          expired_at: string
          status?: 'available' | 'booked' | 'completed' | 'expired' | 'cancelled'
          dietary_info?: string[] | null
          allergen_info?: string[] | null
          preparation_notes?: string | null
          price_type?: 'free' | 'paid'
          price?: number
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          title?: string
          description?: string | null
          category?: string
          quantity?: number
          unit?: string
          image_urls?: string[] | null
          pickup_location?: unknown
          pickup_address?: string
          pickup_time_start?: string
          pickup_time_end?: string
          expired_at?: string
          status?: 'available' | 'booked' | 'completed' | 'expired' | 'cancelled'
          dietary_info?: string[] | null
          allergen_info?: string[] | null
          preparation_notes?: string | null
          price_type?: 'free' | 'paid'
          price?: number
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "foods_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          food_id: string
          receiver_id: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          message: string | null
          pickup_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          food_id: string
          receiver_id: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          message?: string | null
          pickup_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          food_id?: string
          receiver_id?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          message?: string | null
          pickup_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_nearby_foods: {
        Args: {
          lat: number
          lng: number
          radius_km: number
        }
        Returns: {
          id: string
          donor_id: string
          title: string
          description: string
          quantity: number
          location: string
          latitude: number
          longitude: number
          expired_at: string
          image_url: string | null
          category: string
          status: string
          created_at: string
          updated_at: string
          distance_km: number
        }[]
      }
      get_nearby_users: {
        Args: {
          lat: number
          lng: number
          radius_km: number
        }
        Returns: {
          id: string
          expo_push_token: string
        }[]
      }
      expire_old_foods: {
        Args: {}
        Returns: number
      }
    }
    Enums: {
      food_status: 'available' | 'booked' | 'completed' | 'expired'
      booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}