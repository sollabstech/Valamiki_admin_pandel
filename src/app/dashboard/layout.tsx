import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-full min-h-screen bg-[#f8f9ff]">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
