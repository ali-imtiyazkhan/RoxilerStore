'use client';

import { ReactNode } from 'react';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-bg min-h-screen">
      {children}
    </div>
  );
}
