'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useSuperAppBridge } from '@/hooks/use-super-app-bridge';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, loadFromStorage } = useAuthStore();
  const { isInWebView } = useSuperAppBridge();

  // Hide nav only on book detail pages (immersive experience)
  const shouldHideNav = pathname.startsWith('/explorar/libro/');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/callback?error=session_expired');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-app-black ${!shouldHideNav ? 'pb-20' : ''}`}>
      <main>{children}</main>
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}
