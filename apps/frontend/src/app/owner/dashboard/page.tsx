'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { dashboardApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { StarRating } from '@/components/StarRating';

interface Rating {
  id: string;
  value: number;
  userId: string;
  user: { id: string; name: string; email: string; address: string };
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
}

export default function StoreOwnerDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['store-owner-dashboard'],
    queryFn: () => dashboardApi.getStoreOwnerDashboard()
  });

  const dashboard = data?.data;
  const store = dashboard?.store;
  const ratings = dashboard?.ratings || [];
  const averageRating = dashboard?.averageRating || 0;
  const totalRatings = dashboard?.totalRatings || 0;

  if (isLoading) {
    return (
      <DashboardLayout requiredRoles={['STORE_OWNER']}>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card"><div className="h-8 bg-gray-200 rounded w-3/4"></div><div className="mt-4 h-12 bg-gray-200 rounded w-1/4"></div></div>
            <div className="card"><div className="h-8 bg-gray-200 rounded w-3/4"></div><div className="mt-4 h-12 bg-gray-200 rounded w-1/4"></div></div>
          </div>
          <div className="card"><div className="h-10 bg-gray-200 rounded w-1/3"></div><div className="mt-4 space-y-4"><div className="h-12 bg-gray-200 rounded"></div><div className="h-12 bg-gray-200 rounded"></div></div></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !store) {
    return (
      <DashboardLayout requiredRoles={['STORE_OWNER']}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Store Assigned</h2>
          <p className="text-gray-600">You don't have a store assigned yet. Contact an administrator.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRoles={['STORE_OWNER']}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Store Owner Dashboard</h1>
        <p className="text-slate-600 mt-1">Manage and monitor your store's ratings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm font-medium text-slate-500">Store Name</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{store.name}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-600">Average Rating</p>
            <StarRating rating={averageRating} size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-1">{averageRating.toFixed(1)} / 5</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-gray-600">Total Ratings</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalRatings}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">User Ratings</h2>
          <span className="text-sm text-gray-500">{ratings.length} ratings</span>
        </div>

        {ratings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="mt-4 text-gray-500">No ratings yet</p>
            <p className="text-sm text-gray-400 mt-1">Ratings will appear here when users submit them</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Rating</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((rating: Rating) => (
                  <tr key={rating.id}>
                    <td className="font-medium">{rating.user.name}</td>
                    <td>{rating.user.email}</td>
                    <td className="max-w-xs truncate">{rating.user.address}</td>
                    <td>
                      <StarRating rating={rating.value} size={20} />
                      <span className="ml-2 font-medium">{rating.value}/5</span>
                    </td>
                    <td>{formatDate(rating.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}