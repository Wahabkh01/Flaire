// lib/auth.ts - Helper functions for authentication
import { cookies } from 'next/headers';

export async function getAuthToken() {
  const cookieStore = cookies();
  return (await cookieStore).get('token')?.value;
}

export async function getServerAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Client-side utilities
export const clientAuthUtils = {
  setAuthCookie: (token: string) => {
    // This will be handled by the API route
    return fetch('/api/auth/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
  },
  
  clearAuthCookie: () => {
    return fetch('/api/auth/logout', {
      method: 'POST'
    });
  }
};