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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Roxiler Store Ratings</h1>
            <div className="flex gap-4">
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Sign Up</Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Rate & Discover Stores
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            A platform for users to submit ratings (1-5) for stores registered on the platform.
            Different roles provide different functionalities - Administrators manage the platform,
            Normal Users rate stores, and Store Owners view their store's ratings.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">
              Login
            </Link>
          </div>
        </div>
      </main>
      <footer className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; 2024 Roxiler Store Rating Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}