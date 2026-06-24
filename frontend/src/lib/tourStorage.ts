export interface SavedTour {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  rating: number;
  reviews: number;
}

const FAVORITES_KEY = 'travel-favorites';
const EXPERIENCED_KEY = 'travel-experienced-tours';
const REVIEWS_KEY = 'travel-user-reviews';

export interface UserReview {
  id: number;
  tourId?: string;
  tour: string;
  rating: number;
  comment: string;
  date: string;
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getFavorites() {
  return readStorage<SavedTour[]>(FAVORITES_KEY, []);
}

export function setFavorites(favorites: SavedTour[]) {
  writeStorage(FAVORITES_KEY, favorites);
}

export function toggleFavorite(tour: SavedTour) {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.id === tour.id);
  const next = exists ? favorites.filter((item) => item.id !== tour.id) : [tour, ...favorites];
  setFavorites(next);
  return next;
}

export function isFavorite(id: string) {
  return getFavorites().some((tour) => tour.id === id);
}

export function getExperiencedTourIds() {
  return readStorage<string[]>(EXPERIENCED_KEY, []);
}

export function markTourExperienced(tourId: string) {
  const current = getExperiencedTourIds();
  if (current.includes(tourId)) return current;
  const next = [tourId, ...current];
  writeStorage(EXPERIENCED_KEY, next);
  return next;
}

export function isTourExperienced(tourId: string) {
  return getExperiencedTourIds().includes(tourId);
}

export function getUserReviews() {
  return readStorage<UserReview[]>(REVIEWS_KEY, []);
}

export function addUserReview(review: UserReview) {
  const current = getUserReviews();
  const next = [review, ...current];
  writeStorage(REVIEWS_KEY, next);
  return next;
}

export function hasReviewedTourTitle(tourTitle: string) {
  return getUserReviews().some(r => r.tour === tourTitle);
}

export function hasReviewedTourId(tourId: string) {
  return getUserReviews().some(r => r.tourId === tourId);
}
