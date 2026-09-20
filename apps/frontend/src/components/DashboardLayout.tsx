'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow">
        <svg className="h-4.5 w-4.5" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">Roxiler</span>
    </Link>
  );
}

export function DashboardLayout({ children, requiredRoles }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && user && requiredRoles && !requiredRoles.includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router, requiredRoles]);

  if (isLoading) {
    return (
      <div className="page-bg min-h-screen flex items-center justify-center">
        <div className="h-11 w-11 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
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
    <div className="page-bg min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Logo />
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="hidden sm:flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 hover:border-primary-200 hover:bg-primary-50/40 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">{user.name}</span>
                <span className={cn('px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full', {
                  'bg-violet-100 text-violet-800': user.role === 'SYSTEM_ADMIN',
                  'bg-sky-100 text-sky-800': user.role === 'STORE_OWNER',
                  'bg-emerald-100 text-emerald-800': user.role === 'NORMAL_USER'
                })}>
                  {user.role.replace('_', ' ')}
                </span>
              </Link>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="btn-secondary text-sm py-2"
              >
                Logout
              </button>
              <button
                type="button"
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                onClick={() => setMenuOpen(o => !o)}
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
          {menuOpen && (
            <nav className="md:hidden pb-4 flex flex-col gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium',
                    pathname === item.href ? 'bg-primary-50 text-primary-700' : 'text-slate-600'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600">
                Profile
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
