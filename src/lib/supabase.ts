import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types matching your schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          name: string
          phone: string | null
          role: 'CUSTOMER' | 'OWNER' | 'ADMIN'
          is_active: boolean
          created_at: string
          updated_at: string
          business_name: string | null
          business_address: string | null
        }
        Insert: {
          id?: string
          email: string
          password: string
          name: string
          phone?: string | null
          role?: 'CUSTOMER' | 'OWNER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
          business_name?: string | null
          business_address?: string | null
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          phone?: string | null
          role?: 'CUSTOMER' | 'OWNER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
          updated_at?: string
          business_name?: string | null
          business_address?: string | null
        }
      }
      parking_spots: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          latitude: number
          longitude: number
          price: number
          price_type: string
          total_slots: number
          available_slots: number
          rating: number
          review_count: number
          amenities: string[]
          images: string[]
          opening_hours: string
          phone: string | null
          status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          latitude: number
          longitude: number
          price: number
          price_type: string
          total_slots: number
          available_slots: number
          rating?: number
          review_count?: number
          amenities?: string[]
          images?: string[]
          opening_hours: string
          phone?: string | null
          status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string
          latitude?: number
          longitude?: number
          price?: number
          price_type?: string
          total_slots?: number
          available_slots?: number
          rating?: number
          review_count?: number
          amenities?: string[]
          images?: string[]
          opening_hours?: string
          phone?: string | null
          status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE'
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          spot_id: string
          user_id: string
          vehicle_id: string
          start_time: string
          end_time: string
          actual_end_time: string | null
          reserved_end_time: string
          total_cost: number
          status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXTENDED'
          qr_code: string
          pin: string
          is_extended: boolean
          extended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_id: string
          vehicle_id: string
          start_time: string
          end_time: string
          actual_end_time?: string | null
          reserved_end_time: string
          total_cost: number
          status?: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXTENDED'
          qr_code: string
          pin: string
          is_extended?: boolean
          extended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          spot_id?: string
          user_id?: string
          vehicle_id?: string
          start_time?: string
          end_time?: string
          actual_end_time?: string | null
          reserved_end_time?: string
          total_cost?: number
          status?: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXTENDED'
          qr_code?: string
          pin?: string
          is_extended?: boolean
          extended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          make: string
          model: string
          license_plate: string
          color: string
          user_id: string
        }
        Insert: {
          id?: string
          make: string
          model: string
          license_plate: string
          color: string
          user_id: string
        }
        Update: {
          id?: string
          make?: string
          model?: string
          license_plate?: string
          color?: string
          user_id?: string
        }
      }
      reviews: {
        Row: {
          id: string
          spot_id: string
          user_id: string
          rating: number
          comment: string | null
          photos: string[]
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          spot_id: string
          user_id: string
          rating: number
          comment?: string | null
          photos?: string[]
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          spot_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          photos?: string[]
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'QR_PAYMENT' | 'E_WALLET'
          status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          transaction_id: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'QR_PAYMENT' | 'E_WALLET'
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          transaction_id?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          method?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'QR_PAYMENT' | 'E_WALLET'
          status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
          transaction_id?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          is_read?: boolean
          data?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          data?: any
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export default supabase