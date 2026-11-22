// Authentication Service
// Handles session simulation and fake token storage
// TODO: replace with Nexconn SDK / backend auth

export interface UserSession {
  email: string;
  token: string;
  name: string;
}

const AUTH_KEY = 'bloodbridge_auth_session';

export const authService = {
  async login(email: string, _password: string): Promise<UserSession> {
    // Simulate brief network latency for smooth UI feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    const session: UserSession = {
      email,
      name: 'Rajalakshmi Hospital',
      token: 'jwt_mock_token_' + Date.now(),
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  },

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  getSession(): UserSession | null {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_KEY);
  },
};
