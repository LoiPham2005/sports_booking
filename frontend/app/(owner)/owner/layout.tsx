import { OwnerSidebar } from '@/components/owner/sidebar';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <OwnerSidebar />
      <main className="flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
          <h1 className="text-lg font-semibold">Owner Portal</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden md:inline">Đăng xuất</span>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
