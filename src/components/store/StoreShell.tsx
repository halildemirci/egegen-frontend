'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import { Home, Mail, MapPin, Menu, Package, Phone, ShoppingBag } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/#products', label: 'Ürünler', icon: Package },
];

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith(ROUTES.yonetim);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto h-16 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-full items-center justify-between gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <ShoppingBag className="size-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">E-Mağaza</span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    buttonVariants({
                      variant: pathname === link.href ? 'secondary' : 'ghost',
                      size: 'sm',
                    })
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto md:hidden">
              <Sheet>
                <SheetTrigger
                  className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
                  aria-label="Menüyü aç"
                >
                  <Menu className="size-5" />
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-6">
                  <div className="mb-6 flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                      <ShoppingBag className="size-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold">E-Mağaza</span>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className={cn(buttonVariants({ variant: 'ghost' }), 'justify-start gap-2')}
                      >
                        <link.icon className="size-4" />
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto bg-foreground text-background">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <ShoppingBag className="size-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">E-Mağaza</span>
              </div>
              <p className="text-sm leading-relaxed text-background/60">
                Özenle seçilmiş ürün koleksiyonumuzu keşfedin. Kaliteli ürünler, uygun fiyatlarla.
              </p>
            </div>

            <div>
              <p className="mb-4 font-semibold">Hızlı Erişim</p>
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-background/60 transition hover:text-background"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 font-semibold">İletişim</p>
              <div className="flex flex-col gap-2.5 text-sm text-background/60">
                <span className="flex items-center gap-2">
                  <Mail className="size-4" /> info@emagaza.com
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="size-4" /> +90 (212) 555 00 00
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4" /> İstanbul, Türkiye
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-background/10" />

          <p className="text-center text-sm text-background/40">2026 E-Mağaza. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </>
  );
}
