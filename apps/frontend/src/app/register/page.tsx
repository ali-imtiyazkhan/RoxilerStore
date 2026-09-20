'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@roxiler/shared-validation';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'NORMAL_USER' }
  });

  const onSubmit = async (data: SignupInput) => {
    setError('');
    try {
      await signup(data);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="page-bg min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Roxiler</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="card space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="label">Name (20-60 chars)</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name')}
                className={cn('input', errors.name && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500')}
              />
              {errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={cn('input', errors.email && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500')}
              />
              {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="address" className="label">Address (max 400 chars)</label>
              <textarea
                id="address"
                rows={3}
                {...register('address')}
                className={cn('input', errors.address && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500')}
              />
              {errors.address && <p className="mt-1 text-sm text-rose-600">{errors.address.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className={cn('input', errors.password && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500')}
              />
              {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>}
              <p className="mt-1 text-xs text-slate-500">
                8-16 chars, 1 uppercase, 1 special character
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={cn('input', errors.confirmPassword && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500')}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-rose-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
