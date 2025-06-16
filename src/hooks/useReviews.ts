import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../lib/supabase'

type Review = Database['public']['Tables']['reviews']['Row']
type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export function useReviews(spotId?: string) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async (filters?: {
    spotId?: string
    userId?: string
    rating?: number
  }) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('reviews')
        .select(`
          *,
          users!inner(name)
        `)

      if (filters?.spotId || spotId) {
        query = query.eq('spot_id', filters?.spotId || spotId)
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters?.rating) {
        query = query.eq('rating', filters.rating)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createReview = async (reviewData: Omit<ReviewInsert, 'user_id'>) => {
    try {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          user_id: user.id
        })
        .select(`
          *,
          users!inner(name)
        `)
        .single()

      if (error) throw error

      setReviews(prev => [data, ...prev])

      // Update parking spot rating
      await updateParkingSpotRating(reviewData.spot_id)

      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const updateReview = async (id: string, updates: ReviewUpdate) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select(`
          *,
          users!inner(name)
        `)
        .single()

      if (error) throw error

      setReviews(prev => prev.map(review => review.id === id ? data : review))

      // Update parking spot rating
      await updateParkingSpotRating(data.spot_id)

      return { data, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { data: null, error }
    }
  }

  const deleteReview = async (id: string) => {
    try {
      const review = reviews.find(r => r.id === id)
      if (!review) throw new Error('Review not found')

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) throw error

      setReviews(prev => prev.filter(review => review.id !== id))

      // Update parking spot rating
      await updateParkingSpotRating(review.spot_id)

      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An error occurred'
      return { error }
    }
  }

  const updateParkingSpotRating = async (spotId: string) => {
    try {
      // Get all reviews for this spot
      const { data: spotReviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('spot_id', spotId)

      if (error) throw error

      if (spotReviews && spotReviews.length > 0) {
        const averageRating = spotReviews.reduce((sum, review) => sum + review.rating, 0) / spotReviews.length
        const roundedRating = Math.round(averageRating * 10) / 10

        await supabase
          .from('parking_spots')
          .update({
            rating: roundedRating,
            review_count: spotReviews.length
          })
          .eq('id', spotId)
      }
    } catch (err) {
      console.error('Error updating parking spot rating:', err)
    }
  }

  useEffect(() => {
    if (spotId) {
      fetchReviews({ spotId })
    }
  }, [spotId])

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview
  }
}