'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { SidebarProvider } from '@/components/ui/sidebar';
import { API_ROUTES, ROUTES } from '@/lib/routes';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const isLoginRoute = pathname === ROUTES.yonetimGiris;

  useEffect(() => {
    if (isLoginRoute) {
      setAuthChecked(true);
      setAuthorized(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(API_ROUTES.yonetimOturumBen, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (data?.authenticated) {
          setAuthorized(true);
        } else {
          router.replace(ROUTES.yonetimGiris);
        }
      } catch {
        router.replace(ROUTES.yonetimGiris);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [isLoginRoute, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Yükleniyor...
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminShell>{children}</AdminShell>
    </SidebarProvider>
  );
}
