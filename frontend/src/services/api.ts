// Core API client for FasalGo platform

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

export function getAuthToken(): string | null {
  return localStorage.getItem('fasalgo_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('fasalgo_token', token);
}

export function removeAuthToken(): void {
  localStorage.setItem('fasalgo_token', '');
  localStorage.removeItem('fasalgo_token');
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          errorMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // Fallback to generic message
      }
      throw new Error(errorMessage);
    }

    // Return JSON or empty object
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return {} as T;
  } catch (error: any) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}
