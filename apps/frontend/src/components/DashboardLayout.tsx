'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function DashboardLayout({ children, requiredRoles }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && user && requiredRoles && !requiredRoles.includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router, requiredRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const navigation = {
    SYSTEM_ADMIN: [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/stores', label: 'Stores' }
    ],
    STORE_OWNER: [
      { href: '/owner/dashboard', label: 'Dashboard' },
      { href: '/owner/store', label: 'My Store' }
    ],
    NORMAL_USER: [
      { href: '/stores', label: 'Stores' }
    ]
  };

  const navItems = navigation[user.role as keyof typeof navigation] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-primary-600">Roxiler</Link>
              <nav className="hidden md:flex gap-6">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <span className={cn('px-2 py-1 text-xs font-medium rounded-full', {
                'bg-purple-100 text-purple-800': user.role === 'SYSTEM_ADMIN',
                'bg-blue-100 text-blue-800': user.role === 'STORE_OWNER',
                'bg-green-100 text-green-800': user.role === 'NORMAL_USER'
              })}>
                {user.role.replace('_', ' ')}
              </span>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}