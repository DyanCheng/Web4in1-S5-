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
