import { apiRequest } from "./queryClient";

// Auth related API calls
export async function login(email: string, password: string) {
  try {
    console.log('Sending login request to server with email:', email);
    // Direct fetch implementation to avoid any issues with apiRequest
    const res = await fetch('http://0.0.0.0:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Login failed: ${res.status} - ${errorText}`);
      throw new Error(errorText || 'Login failed');
    }
    
    const data = await res.json();
    console.log('Server login response:', data);
    return data;
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
    // Direct fetch implementation to avoid any issues with apiRequest
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      },
      credentials: 'include'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        console.log('User not authenticated');
        return null;
      }
      const errorText = await res.text();
      throw new Error(`Failed to fetch user: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Current user data:', data);
    return data.user; // Return just the user object, not the wrapper
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}
