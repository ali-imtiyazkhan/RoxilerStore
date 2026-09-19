'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { storeApi, ratingApi } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { ratingSchema } from '@roxiler/shared-validation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarRating } from '@/components/StarRating';
import { SortIcon } from '@/components/SortIcon';

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  userRating?: number;
}

export default function StoresPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [ratingModal, setRatingModal] = useState<{ store: Store; currentRating?: number } | null>(null);

  const queryParams = { page, limit, sortBy, sortOrder, ...filters };

  const { data, isLoading, error } = useQuery({
    queryKey: ['stores', queryParams],
    queryFn: () => storeApi.list(queryParams)
  });

  const submitRatingMutation = useMutation({
    mutationFn: ({ storeId, value }: { storeId: string; value: number }) => ratingApi.submit(storeId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['user-rating'] });
      setRatingModal(null);
    }
  });

  const deleteRatingMutation = useMutation({
    mutationFn: (storeId: string) => ratingApi.delete(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['user-rating'] });
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<{ value: number }>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { value: 5 }
  });

  const handleRatingSubmit = (data: { value: number }) => {
    if (ratingModal) submitRatingMutation.mutate({ storeId: ratingModal.store.id, value: data.value });
    reset();
  };

  const handleDeleteRating = (storeId: string) => {
    if (confirm('Are you sure you want to delete your rating?')) deleteRatingMutation.mutate(storeId);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
    setPage(1);
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRoles={['NORMAL_USER']}>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={['NORMAL_USER']}>
        <div className="text-red-600">Failed to load stores</div>
      </DashboardLayout>
    );
  }

  const stores = data?.data?.stores || [];
  const pagination = data?.data?.pagination;

  return (
    <DashboardLayout requiredRoles={['NORMAL_USER']}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Stores</h1>
        <p className="text-gray-600 mt-1">Browse and rate stores</p>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Search</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Store Name</label>
            <input
              type="text"
              value={filters.name}
              onChange={e => { setFilters(prev => ({ ...prev, name: e.target.value })); setPage(1); }}
              className="input"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              type="text"
              value={filters.address}
              onChange={e => { setFilters(prev => ({ ...prev, address: e.target.value })); setPage(1); }}
              className="input"
              placeholder="Search by address"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store: Store) => (
          <div key={store.id} className="card">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
              <p className="text-gray-500 text-sm mt-1">{store.address}</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={store.averageRating} size={20} />
              <span className="font-medium">{store.averageRating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({store.totalRatings} reviews)</span>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Your Rating</p>
              <div className="flex items-center gap-2 mt-2">
                {store.userRating ? (
                  <>
                    <StarRating rating={store.userRating} size={20} />
                    <span className="text-sm text-gray-600">You rated: {store.userRating}/5</span>
                    <button
                      onClick={() => handleDeleteRating(store.id)}
                      className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setRatingModal({ store, currentRating: store.userRating })}
                    className="btn-primary text-sm"
                  >
                    Rate this store
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">Added on {formatDate(store.createdAt)}</p>
          </div>
        ))}
        {stores.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No stores found matching your criteria</p>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center mt-6 gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-secondary">Next</button>
        </div>
      )}

      {ratingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Rate {ratingModal.store.name}</h2>
              <form onSubmit={handleSubmit(handleRatingSubmit)} className="space-y-4">
                <div>
                  <label className="label">Your Rating</label>
                  <StarRating
                    rating={ratingModal.currentRating || 5}
                    size={32}
                    interactive
                    onClick={value => setValue('value', value, { shouldValidate: true })}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setRatingModal(null)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={submitRatingMutation.isPending} className="btn-primary flex-1">
                    {submitRatingMutation.isPending ? 'Submitting...' : ratingModal.currentRating ? 'Update Rating' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}