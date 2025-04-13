import { apiRequest } from "./queryClient";

// Auth related API calls
export async function login(email: string, password: string) {
  const res = await apiRequest('POST', '/api/auth/login', { email, password });
  return res.json();
}

export async function logout() {
  const res = await apiRequest('POST', '/api/auth/logout', {});
  return res.json();
}

export async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      if (res.status === 401) {
        return null;
      }
      throw new Error('Failed to fetch current user');
    }
    return res.json();
  } catch (error) {
    return null;
  }
}
