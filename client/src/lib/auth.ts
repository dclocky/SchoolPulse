import { apiRequest } from "./queryClient";

// Auth related API calls
export async function login(email: string, password: string) {
  try {
    console.log('Sending login request to server with email:', email);
    // Direct fetch implementation to avoid any issues with apiRequest
    const res = await fetch('/api/auth/login', {
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
    // Use the apiRequest function which properly handles credentials
    const res = await apiRequest('GET', '/api/auth/me');
    const data = await res.json();
    console.log('Current user data:', data);
    return data;
  } catch (error) {
    // This is expected for unauthenticated users
    if (error instanceof Error && error.message.includes('401')) {
      console.log('User not authenticated');
      return null;
    }
    console.error('getCurrentUser error:', error);
    return null;
  }
}
