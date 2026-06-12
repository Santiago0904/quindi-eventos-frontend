import axios from "axios";
import { getAuthUser } from "../utils/storage";

export interface Review {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

type ApiReview = Omit<Review, "id"> & { id: string | number };

type ReviewResponse<T> = {
  data: T;
};

const api = axios.create({
  baseURL: "https://quindi-eventos-backend.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = getAuthUser()?.token;
  if (token) {
    config.headers["x-user-id"] = token;
  }
  return config;
});

function normalizeReview(review: ApiReview): Review {
  return {
    ...review,
    id: String(review.id),
    eventId: String(review.eventId),
    userId: String(review.userId),
    rating: Number(review.rating),
  };
}

export async function getEventReviews(eventId: string): Promise<Review[]> {
  const result = await api.get<ReviewResponse<ApiReview[]> | ApiReview[]>(`/api/events/${eventId}/reviews`);
  const reviews = Array.isArray(result.data) ? result.data : result.data.data;
  return reviews.map(normalizeReview);
}

export async function createEventReview(eventId: string, rating: number, comment: string): Promise<Review> {
  const result = await api.post<ReviewResponse<ApiReview> | ApiReview>(`/api/events/${eventId}/reviews`, {
    rating,
    comment,
  });
  const review = "data" in result.data ? result.data.data : result.data;
  return normalizeReview(review);
}
