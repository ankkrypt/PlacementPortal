'use client';
import { jwtDecode } from 'jwt-decode';

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored);
  }
  return null;
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function isAuthenticated() {
  return !!getToken();
}

export function getRole() {
  const user = getUser();
  return user?.role || null;
}
