'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/DashboardLayout';
import { userApi } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { SortIcon } from '@/components/SortIcon';

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
  createdAt: string;
  store?: { id: string; name: string; averageRating?: number };
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });

  const queryParams = { page, limit, sortBy, sortOrder, ...filters };

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', queryParams],
    queryFn: () => userApi.list(queryParams)
  });

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
    setPage(1);
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredRoles={['SYSTEM_ADMIN']}>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                  <th>Store</th>
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
                    <td><div className="h-4 bg-gray-200 rounded w-1/4"></div></td>
                    <td><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
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
        <div className="text-red-600">Failed to load users</div>
      </DashboardLayout>
    );
  }

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  return (
    <DashboardLayout requiredRoles={['SYSTEM_ADMIN']}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-1">Manage all platform users</p>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div>
            <label className="label">Role</label>
            <select
              value={filters.role}
              onChange={e => { setFilters(prev => ({ ...prev, role: e.target.value })); setPage(1); }}
              className="input"
            >
              <option value="">All Roles</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
            </select>
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
              <th className="cursor-pointer" onClick={() => handleSort('role')}>
                <div className="flex items-center gap-2">Role <SortIcon sortBy={sortBy} sortOrder={sortOrder} field="role" /></div>
              </th>
              <th>Store</th>
              <th className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-2">Created <SortIcon sortBy={sortBy} sortOrder={sortOrder} field="createdAt" /></div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id}>
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td className="max-w-xs truncate">{user.address}</td>
                <td>
                  <span className={cn('px-2 py-1 text-xs font-medium rounded-full', {
                    'bg-purple-100 text-purple-800': user.role === 'SYSTEM_ADMIN',
                    'bg-blue-100 text-blue-800': user.role === 'STORE_OWNER',
                    'bg-green-100 text-green-800': user.role === 'NORMAL_USER'
                  })}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {user.store ? (
                    <span className="text-blue-600 hover:underline">{user.store.name}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button className="text-primary-600 hover:text-primary-900 text-sm font-medium">View</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No users found</td>
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
    </DashboardLayout>
  );
}