'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    switch (user?.role) {
      case 'SYSTEM_ADMIN':
        router.push('/admin/dashboard');
        break;
      case 'STORE_OWNER':
        router.push('/owner/dashboard');
        break;
      default:
        router.push('/stores');
    }
    return null;
  }

  return (
    <div className="page-bg min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-glow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </span>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Roxiler</h1>
            </Link>
            <div className="flex gap-3">
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-5xl w-full">
          <div className="text-center max-w-3xl mx-auto">
            <p className="inline-flex items-center rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-700 mb-5">
              Store rating platform
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-5 text-balance">
              Rate & discover stores with clarity
            </h2>
            <p className="text-lg text-slate-600 mb-10 text-balance">
              Submit ratings from 1–5 for stores on the platform. Admins run the system, shoppers rate stores, and owners see how they are doing.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register" className="btn-primary text-base px-8 py-3">
                Get Started
              </Link>
              <Link href="/login" className="btn-secondary text-base px-8 py-3">
                Login
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Administrators', body: 'Manage users, stores, and see platform-wide stats.' },
              { title: 'Normal users', body: 'Browse stores, search by name or address, and leave a rating.' },
              { title: 'Store owners', body: 'View your average score and every rating submitted for your store.' }
            ].map(item => (
              <div key={item.title} className="card text-left">
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; 2026 Roxiler Store Rating Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
