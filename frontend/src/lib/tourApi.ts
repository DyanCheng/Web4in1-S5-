import { apiUrl } from '@/lib/backendUrl';

export const DEFAULT_FALLBACK_TOUR_ID = '1';

async function fetchTourOnce(id: string): Promise<any | null> {
  try {
    const response = await fetch(apiUrl(`/api/tours/${id}`));
    if (response.ok) return response.json();
  } catch {
    // ignore — caller handles fallback
  }
  return null;
}

export async function fetchTourById(id: string): Promise<any | null> {
  const tour = await fetchTourOnce(id);
  if (tour) return tour;
  if (id === DEFAULT_FALLBACK_TOUR_ID) return null;
  return fetchTourOnce(DEFAULT_FALLBACK_TOUR_ID);
}

export async function fetchAllTours(destination?: string): Promise<any[]> {
  const query = destination ? `?destination=${encodeURIComponent(destination)}` : '';

  try {
    const response = await fetch(apiUrl(`/api/tours${query}`));
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // ignore — fallback below
  }

  const fallback = await fetchTourById(DEFAULT_FALLBACK_TOUR_ID);
  return fallback ? [fallback] : [];
}
