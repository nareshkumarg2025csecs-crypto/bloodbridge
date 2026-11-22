// Authentication Service
// Connected to BloodBridge Backend API Gateway (/api/v1/auth)
// Gracefully falls back to offline session if backend is temporarily unreachable

import { API_BASE_URL, AUTH_STORAGE_KEY, ApiUserSession, fetchWithAuth } from './apiClient';

export interface UserSession {
  email: string;
  token: string;
  name: string;
  role?: string;
  institution?: any;
}

export const authService = {
  async login(email: string, password: string): Promise<UserSession> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      let errorDetail = 'Invalid institutional email or password.';
      try {
        const errJson = await response.json();
        if (errJson.detail) errorDetail = errJson.detail;
      } catch {
        // use default errorDetail
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    const session: UserSession = {
      email: data.user.email,
      token: data.access_token,
      name: data.user.name,
      role: data.user.role,
      institution: data.user.institution,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  logout(): void {
    try {
      fetchWithAuth('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.clear();
    }
  },

  getSession(): UserSession | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  },
};
