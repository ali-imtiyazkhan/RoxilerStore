export type Role = 'SYSTEM_ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  store?: Store;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  owner?: User;
  ratings?: Rating[];
  averageRating?: number;
  totalRatings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  value: number;
  userId: string;
  user?: User;
  storeId: string;
  store?: Store;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  usersByRole: Record<Role, number>;
}

export interface StoreOwnerDashboard {
  store: Store | null;
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

export interface StoreWithRating extends Store {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
}

export interface UserWithStore {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  store?: Pick<Store, 'id' | 'name' | 'averageRating'>;
}