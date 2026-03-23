import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth';
import toast from 'react-hot-toast';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authApi.registerUser(email, password, name);
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.details?.[0]?.message || 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [setAuth, navigate]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await authApi.loginUser(email, password);
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [setAuth, navigate]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logoutUser(refreshToken);
      }
    } catch {
      // Ignore errors during logout
    } finally {
      clearAuth();
      navigate('/login');
      toast.success('Logged out');
    }
  }, [clearAuth, navigate]);

  return { register, login, logout, isLoading, error, user, isAuthenticated };
}
