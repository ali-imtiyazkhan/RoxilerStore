'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { storeApi } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStoreSchema, type CreateStoreInput } from '@roxiler/shared-validation';
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
}

export default function AdminStoresPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [showModal, setShowModal] = useState(false);

  const queryParams = { page, limit, sortBy, sortOrder, ...filters };

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-stores', queryParams],
    queryFn: () => storeApi.list(queryParams)
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateStoreInput) => storeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      setShowModal(false);
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema)
  });

  const onSubmit = (data: CreateStoreInput) => {
    createMutation.mutate(data);
    reset();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
    setPage(1);
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRoles={['SYSTEM_ADMIN']}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Owner</th>
                  <th>Rating</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                    <td><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout requiredRoles={['SYSTEM_ADMIN']}>
        <div className="text-red-600">Failed to load stores</div>
      </DashboardLayout>
    );
  }

  const stores = data?.data?.stores || [];
  const pagination = data?.data?.pagination;

  return (
    <DashboardLayout requiredRoles={['SYSTEM_ADMIN']}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Store Management</h1>
          <p className="text-slate-600 mt-1">Manage all registered stores</p>
        </div>
        <button onClick={() => { reset(); setShowModal(true); }} className="btn-primary">Add Store</button>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={filters.name}
              onChange={e => { setFilters(prev => ({ ...prev, name: e.target.value })); setPage(1); }}
              className="input"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="text"
              value={filters.email}
              onChange={e => { setFilters(prev => ({ ...prev, email: e.target.value })); setPage(1); }}
              className="input"
              placeholder="Search by email"
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

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">Name <SortIcon sortBy={sortBy} sortOrder={sortOrder} field="name" /></div>
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-2">Email <SortIcon sortBy={sortBy} sortOrder={sortOrder} field="email" /></div>
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('address')}>
                <div className="flex items-center gap-2">Address <SortIcon sortBy={sortBy} sortOrder={sortOrder} field="address" /></div>
              </th>
              <th>Owner</th>
              <th className="cursor-pointer" onClick={() => handleSort('averageRating')}>
                <div className="flex items-center gap-2">Rating <SortIcon sortBy={sortBy} sortOrder={sortOrder} field="averageRating" /></div>
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-2">Created <SortIcon sortBy={sortBy} sortOrder={sortOrder} field="createdAt" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store: Store) => (
              <tr key={store.id}>
                <td className="font-medium">{store.name}</td>
                <td>{store.email}</td>
                <td className="max-w-xs truncate">{store.address}</td>
                <td>{store.owner.name} ({store.owner.email})</td>
                <td>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-600">★</span>
                    <span className="font-medium">{store.averageRating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({store.totalRatings})</span>
                  </div>
                </td>
                <td>{formatDate(store.createdAt)}</td>
                <td>
                  <button className="text-primary-600 hover:text-primary-900 text-sm font-medium mr-3">View</button>
                  <button className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {stores.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No stores found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">Previous</button>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-secondary text-sm">Next</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Store</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Store Name</label>
                  <input {...register('name')} className={cn('input', errors.name && 'border-red-500')} />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input {...register('email')} className={cn('input', errors.email && 'border-red-500')} />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea {...register('address')} rows={3} className={cn('input', errors.address && 'border-red-500')} />
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="label">Owner ID</label>
                  <input {...register('ownerId')} className={cn('input', errors.ownerId && 'border-red-500')} placeholder="Store Owner user ID" />
                  {errors.ownerId && <p className="mt-1 text-sm text-red-600">{errors.ownerId.message}</p>}
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                    {createMutation.isPending ? 'Creating...' : 'Create Store'}
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