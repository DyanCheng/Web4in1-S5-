export function normalizeBackendUrl(
  raw?: string,
  fallback = "http://localhost:5000"
): string {
  const value = raw?.trim().replace(/\/+$/, "");
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function getBackendUrl(): string {
  return normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
}

/** Same-origin path; Vercel/Next rewrites proxy /api/* to the Railway backend. */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath;
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    throw new Error(`Máy chủ trả về phản hồi rỗng (${response.status})`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Phản hồi không hợp lệ từ máy chủ (${response.status})`);
  }
}
