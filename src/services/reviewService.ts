import api from '../config/api';

export interface CreateReviewData {
  spotId: string;
  rating: number;
  comment?: string;
  photos?: string[];
  isAnonymous?: boolean;
}

class ReviewService {
  async createReview(data: CreateReviewData) {
    const response = await api.post('/reviews', data);
    return response.data;
  }

  async getSpotReviews(spotId: string, params: { page?: number; limit?: number; rating?: number } = {}) {
    const response = await api.get(`/reviews/spot/${spotId}`, { params });
    return response.data;
  }

  async updateReview(id: string, data: Partial<CreateReviewData>) {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  }

  async deleteReview(id: string) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }

  async getMyReviews(params: { page?: number; limit?: number } = {}) {
    const response = await api.get('/reviews/my-reviews', { params });
    return response.data;
  }
}

export const reviewService = new ReviewService();