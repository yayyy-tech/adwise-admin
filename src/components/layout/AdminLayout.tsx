import { type ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-dark-base">
      <AdminSidebar />
      <main className="flex-1 ml-[240px] p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
