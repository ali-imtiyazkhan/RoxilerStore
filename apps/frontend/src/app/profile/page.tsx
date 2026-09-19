'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordSchema, type UpdatePasswordInput } from '@roxiler/shared-validation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { updatePassword, user, isLoading: authLoading } = useAuthStore();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema)
  });

  const onSubmit = async (data: UpdatePasswordInput) => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      await updatePassword(data.currentPassword, data.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully' });
      reset();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  const requiredRoles = user.role === 'SYSTEM_ADMIN' ? ['SYSTEM_ADMIN'] :
                        user.role === 'STORE_OWNER' ? ['STORE_OWNER'] : ['NORMAL_USER'];

  return (
    <DashboardLayout requiredRoles={requiredRoles}>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600 mb-8">Update your password</p>

        <div className="card">
          <h2 className="text-lg font-semibold mb-6">Change Password</h2>

          {message && (
            <div className={cn('mb-4 p-3 rounded-lg text-sm', {
              'bg-green-50 text-green-700 border border-green-200': message.type === 'success',
              'bg-red-50 text-red-700 border border-red-200': message.type === 'error'
            })}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="label">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...register('currentPassword')}
                className={cn('input', errors.currentPassword && 'border-red-500 focus:ring-red-500 focus:border-red-500')}
              />
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="label">New Password</label>
              <input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register('newPassword')}
                className={cn('input', errors.newPassword && 'border-red-500 focus:ring-red-500 focus:border-red-500')}
              />
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
              <p className="mt-1 text-xs text-gray-500">8-16 chars, 1 uppercase, 1 special character</p>
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="label">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmNewPassword')}
                className={cn('input', errors.confirmNewPassword && 'border-red-500 focus:ring-red-500 focus:border-red-500')}
              />
              {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 mt-2">
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="mt-6 card">
          <h2 className="text-lg font-semibold mb-4">Account Info</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Role</dt>
              <dd className={cn('font-medium px-2 py-1 rounded-full text-xs', {
                'bg-purple-100 text-purple-800': user.role === 'SYSTEM_ADMIN',
                'bg-blue-100 text-blue-800': user.role === 'STORE_OWNER',
                'bg-green-100 text-green-800': user.role === 'NORMAL_USER'
              })}>
                {user.role.replace('_', ' ')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Address</dt>
              <dd className="font-medium text-gray-900 text-right max-w-xs truncate">{user.address}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Member since</dt>
              <dd className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardLayout>
  );
}