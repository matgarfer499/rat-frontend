import { apiFetch, getApiHeaders } from './fetch-helper';

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  role: 'normal' | 'admin';
}

export interface RegisterData {
  username: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Token storage
const TOKEN_KEY = 'rat_access_token';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Auth API calls
export async function register(data: RegisterData): Promise<User> {
  const response = await apiFetch('/auth/register', {
    method: 'POST',
    headers: getApiHeaders('application/json'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
}

export async function login(data: LoginData): Promise<AuthTokens> {
  const response = await apiFetch('/auth/login-json', {
    method: 'POST',
    headers: getApiHeaders('application/json'),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const tokens = await response.json();
  saveToken(tokens.access_token);
  return tokens;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await apiFetch('/auth/me', {
      headers: getApiHeaders(undefined, token),
    });

    if (!response.ok) {
      removeToken();
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    removeToken();
    return null;
  }
}

export function logout(): void {
  removeToken();
}
