import client from './client';
import { AuthResponse } from '../types';

export async function registerUser(email: string, password: string, name: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/register', { email, password, name });
  return data.data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}

export async function refreshTokens(refreshToken: string) {
  const { data } = await client.post('/auth/refresh', { refreshToken });
  return data.data;
}

export async function logoutUser(refreshToken: string) {
  await client.post('/auth/logout', { refreshToken });
}

export async function getCurrentUser() {
  const { data } = await client.get('/auth/me');
  return data.data;
}
