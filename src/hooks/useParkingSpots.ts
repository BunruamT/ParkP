import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type ParkingSpot = Database['public']['Tables']['parking_spots']['Row']
type ParkingSpotInsert = Database['public']['Tables']['parking_spots']['Insert']
type ParkingSpotUpdate = Database['public']['Tables']['parking_spots']['Update']

export function useParkingSpots() {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpots = async (filters?: {
    search?: string
    lat?: number
    lng?: number
    radius?: number
    minPrice?: number
    maxPrice?: number
    amenities?: string[]
    priceType?: string
    ownerId?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('parking_spots')
        .select('*')
        .eq('status', 'ACTIVE')

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters?.priceType) {
        query = query.eq('price_type', filters.priceType)
      }

      if (filters?.ownerId) {
        query = query.eq('owner_id', filters.ownerId)
      }

      if (filters?.amenities && filters.amenities.length > 0) {
        query = query.contains('amenities', filters.amenities)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Apply distance filter if coordinates provided
      let filteredData = data || []
      if (filters?.lat && filters?.lng && filters?.radius) {
        filteredData = filteredData.filter(spot => {
          const distance = calculateDistance(
            filters.lat!,
            filters.lng!,
            spot.latitude,
            spot.longitude
          )
          return distance <= filters.radius!
        })
      }

      setSpots(filteredData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createSpot = async (spotData: ParkingSpotInsert) => {
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .insert(spotData)
        .select()
        .single()

      if (error) throw error

      setSpots(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const updateSpot = async (id: string, updates: ParkingSpotUpdate) => {
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setSpots(prev => prev.map(spot => spot.id === id ? data : spot))
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const deleteSpot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('parking_spots')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSpots(prev => prev.filter(spot => spot.id !== id))
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { error }
    }
  }

  useEffect(() => {
    fetchSpots()
  }, [])

  return {
    spots,
    loading,
    error,
    fetchSpots,
    createSpot,
    updateSpot,
    deleteSpot
  }
}

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}