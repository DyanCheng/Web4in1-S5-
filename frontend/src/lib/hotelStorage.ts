export interface SavedHotel {
  id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  stars: number;
}

const HOTEL_FAVORITES_KEY = 'travel-hotel-favorites';

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

export function getHotelFavorites() {
  return readStorage<SavedHotel[]>(HOTEL_FAVORITES_KEY, []);
}

export function setHotelFavorites(favorites: SavedHotel[]) {
  writeStorage(HOTEL_FAVORITES_KEY, favorites);
}

export function toggleHotelFavorite(hotel: SavedHotel) {
  const favorites = getHotelFavorites();
  const exists = favorites.some((item) => item.id === hotel.id);
  const next = exists ? favorites.filter((item) => item.id !== hotel.id) : [hotel, ...favorites];
  setHotelFavorites(next);
  return next;
}

export function isHotelFavorite(id: string) {
  return getHotelFavorites().some((hotel) => hotel.id === id);
}
