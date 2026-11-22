// Backend API Configuration
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api/v1';

export const AUTH_STORAGE_KEY = 'bloodbridge_auth_session';

export interface ApiUserSession {
  email: string;
  token: string;
  name: string;
  role?: string;
  institution?: {
    id: string;
    name: string;
    license: string;
    type: string;
    address: string;
    locality: string;
    isVerified: boolean;
  } | null;
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token = '';
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      token = parsed.token || '';
    }
  } catch (e) {
    // ignore
  }

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
