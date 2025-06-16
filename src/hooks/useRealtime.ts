import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtime() {
  useEffect(() => {
    // Subscribe to parking spots changes
    const spotsChannel = supabase
      .channel('parking-spots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_spots'
        },
        (payload) => {
          console.log('Parking spot changed:', payload)
          // You can dispatch events or update state here
          window.dispatchEvent(new CustomEvent('parking-spots-changed', { detail: payload }))
        }
      )
      .subscribe()

    // Subscribe to bookings changes
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking changed:', payload)
          window.dispatchEvent(new CustomEvent('bookings-changed', { detail: payload }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(spotsChannel)
      supabase.removeChannel(bookingsChannel)
    }
  }, [])
}