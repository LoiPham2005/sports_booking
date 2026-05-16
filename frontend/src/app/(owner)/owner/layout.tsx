'use client';

import { OwnerSidebar } from '@/components/owner/sidebar';
import { LogoutButton } from '@/components/shared/logout-button';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <OwnerSidebar />
      <main className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background px-6">
          <h1 className="text-lg font-semibold">Owner Portal</h1>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Owner · owner@sportsbooking.local
            </span>
            <LogoutButton />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
