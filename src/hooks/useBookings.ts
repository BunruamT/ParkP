import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../lib/supabase'

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']
type BookingUpdate = Database['public']['Tables']['bookings']['Update']

export function useBookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async (filters?: {
    status?: string
    spotId?: string
    userId?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setBookings([])
        return
      }

      let query = supabase
        .from('bookings')
        .select(`
          *,
          parking_spots!inner(name, address, images),
          vehicles!inner(make, model, license_plate),
          users!inner(name, email)
        `)

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.spotId) {
        query = query.eq('spot_id', filters.spotId)
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      } else {
        // Default to current user's bookings
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setBookings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (bookingData: Omit<BookingInsert, 'user_id' | 'qr_code' | 'pin'>) => {
    try {
      if (!user) throw new Error('User not authenticated')

      // Generate QR code and PIN
      const qrCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const pin = Math.floor(1000 + Math.random() * 9000).toString()

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          user_id: user.id,
          qr_code: qrCode,
          pin: pin
        })
        .select(`
          *,
          parking_spots!inner(name, address, images),
          vehicles!inner(make, model, license_plate)
        `)
        .single()

      if (error) throw error

      setBookings(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const updateBooking = async (id: string, updates: BookingUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          parking_spots!inner(name, address, images),
          vehicles!inner(make, model, license_plate)
        `)
        .single()

      if (error) throw error

      setBookings(prev => prev.map(booking => booking.id === id ? data : booking))
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const extendBooking = async (id: string) => {
    try {
      const booking = bookings.find(b => b.id === id)
      if (!booking) throw new Error('Booking not found')

      if (booking.is_extended) {
        throw new Error('Booking has already been extended')
      }

      const newEndTime = new Date(booking.end_time)
      newEndTime.setHours(newEndTime.getHours() + 1)

      const newReservedEndTime = new Date(booking.reserved_end_time)
      newReservedEndTime.setHours(newReservedEndTime.getHours() + 1)

      const { data, error } = await updateBooking(id, {
        end_time: newEndTime.toISOString(),
        reserved_end_time: newReservedEndTime.toISOString(),
        is_extended: true,
        extended_at: new Date().toISOString(),
        status: 'EXTENDED'
      })

      return { data, error }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const cancelBooking = async (id: string) => {
    try {
      const { data, error } = await updateBooking(id, {
        status: 'CANCELLED'
      })

      return { data, error }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const validateEntry = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parking_spots!inner(name, address, owner_id),
          vehicles!inner(make, model, license_plate),
          users!inner(name, phone)
        `)
        .or(`qr_code.eq.${code},pin.eq.${code}`)
        .in('status', ['PENDING', 'ACTIVE', 'EXTENDED'])
        .single()

      if (error) throw error

      // Check if booking is within valid time
      const now = new Date()
      const startTime = new Date(data.start_time)
      const reservedEndTime = new Date(data.reserved_end_time)

      if (now < startTime) {
        throw new Error('Booking has not started yet')
      }

      if (now > reservedEndTime) {
        throw new Error('Booking has expired')
      }

      // Update booking status to ACTIVE if it was PENDING
      if (data.status === 'PENDING') {
        await updateBooking(data.id, { status: 'ACTIVE' })
      }

      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Invalid code or booking not found'
      return { data: null, error }
    }
  }

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    extendBooking,
    cancelBooking,
    validateEntry
  }
}