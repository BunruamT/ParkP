import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../lib/supabase'

type Vehicle = Database['public']['Tables']['vehicles']['Row']
type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']

export function useVehicles() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setVehicles([])
        return
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setVehicles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createVehicle = async (vehicleData: Omit<VehicleInsert, 'user_id'>) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setVehicles(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const updateVehicle = async (id: string, updates: VehicleUpdate) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single()

      if (error) throw error

      setVehicles(prev => prev.map(vehicle => vehicle.id === id ? data : vehicle))
      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error

      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id))
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { error }
    }
  }

  useEffect(() => {
    if (user) {
      fetchVehicles()
    }
  }, [user])

  return {
    vehicles,
    loading,
    error,
    fetchVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle
  }
}