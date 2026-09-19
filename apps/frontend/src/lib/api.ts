import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updatePassword: (data: any) => api.put('/auth/password', data)
};

export const userApi = {
  list: (params?: any) => api.get('/users', { params }),
  create: (data: any) => api.post('/users', data),
  get: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`)
};

export const storeApi = {
  list: (params?: any) => api.get('/stores', { params }),
  create: (data: any) => api.post('/stores', data),
  get: (id: string) => api.get(`/stores/${id}`),
  update: (id: string, data: any) => api.put(`/stores/${id}`, data),
  delete: (id: string) => api.delete(`/stores/${id}`)
};

export const ratingApi = {
  submit: (storeId: string, value: number) => api.post(`/ratings/stores/${storeId}`, { value }),
  getMyRating: (storeId: string) => api.get(`/ratings/stores/${storeId}/my-rating`),
  delete: (storeId: string) => api.delete(`/ratings/stores/${storeId}`),
  getStoreRatings: (storeId: string) => api.get(`/ratings/store/${storeId}`)
};

export const dashboardApi = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getStoreOwnerDashboard: () => api.get('/dashboard/store-owner')
};