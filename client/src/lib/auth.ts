import { apiRequest } from "./queryClient";

// Auth related API calls
export async function login(email: string, password: string) {
  try {
    const res = await apiRequest('POST', '/api/auth/login', { email, password });
    return await res.json();
  } catch (error) {
    console.error('Login request failed:', error);
    throw error;
  }
}

export async function logout() {
  try {
    const res = await apiRequest('POST', '/api/auth/logout', {});
    return await res.json();
  } catch (error) {
    console.error('Logout request failed:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    console.log('Fetching current user...');
    const res = await fetch('/api/auth/me', { 
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
      } 
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        console.log('User not authenticated');
        return null;
      }
      const errorText = await res.text();
      console.error(`Failed to fetch current user: ${res.status} - ${errorText}`);
      throw new Error(`Failed to fetch current user: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Current user data:', data);
    return data;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}
