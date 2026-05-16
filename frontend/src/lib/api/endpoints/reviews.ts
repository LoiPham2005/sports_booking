import { apiGet, apiPost } from '../client';

export interface ReviewDto {
  id: string;
  userId: string;
  venueId: string;
  rating: number;
  content: string | null;
  ownerReply: string | null;
  ownerRepliedAt: string | null;
  createdAt: string;
  user: { id: string; fullName: string; avatarUrl: string | null };
}

export interface CreateReviewInput {
  bookingId: string;
  rating: number;
  content?: string;
}

export const reviewsApi = {
  listByVenue: (venueId: string, sort?: 'recent' | 'rating') =>
    apiGet<ReviewDto[]>(`/venues/${encodeURIComponent(venueId)}/reviews`, {
      query: sort ? { sort } : undefined,
    }),

  create: (body: CreateReviewInput) => apiPost<ReviewDto>('/reviews', body),
};
