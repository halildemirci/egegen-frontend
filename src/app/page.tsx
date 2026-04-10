'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';
import { stripHtml } from '@/lib/utils';
import { API_ROUTES, ROUTES, urunDetayRoute } from '@/lib/routes';
import { ArrowDown, BadgeCheck, RefreshCcw, ShieldCheck, Truck } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_ROUTES.urunler);
        const data = await response.json();

        if (data.success) setProducts(data.data);
        else setError(data.error || 'Ürünler yüklenemedi');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ürünler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.2),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.16),transparent_30%),linear-gradient(to_bottom,#f8fafc,#eef2ff)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(to_bottom,#0f172a,#111827)]">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="space-y-6">
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 px-3 py-1">
              Yeni sezon ürünleri yayında
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Tarzınızı yansıtan
              <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent"> modern koleksiyon</span>
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Özenle seçilmiş ürünler, hızlı teslimat ve güvenli alışveriş deneyimi tek bir yerde.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<a href="#products" title="Ürünleri İncele" />}>
                Ürünleri İncele <ArrowDown className="size-4" />
              </Button>
              <Button variant="outline" size="lg" nativeButton={false} render={<Link href={ROUTES.yonetim} />}>
                Yönetim Paneli
              </Button>
            </div>
          </div>

          <Card className="border-border/70 bg-card/80 shadow-lg backdrop-blur">
            <CardContent className="grid gap-4 p-6">
              <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
                <Truck className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Ücretsiz Kargo</p>
                  <p className="text-xs text-muted-foreground">Belirli tutar üzerindeki siparişlerde geçerli</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
                <ShieldCheck className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Güvenli Ödeme</p>
                  <p className="text-xs text-muted-foreground">3D Secure altyapısı ile korunur</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-background p-4">
                <RefreshCcw className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Kolay İade</p>
                  <p className="text-xs text-muted-foreground">14 gün içinde hızlı iade imkanı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="products" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Öne Çıkan Ürünler</h2>
            <p className="mt-1 text-sm text-muted-foreground">Koleksiyondan seçilmiş ürünler</p>
          </div>
          {!loading && !error && <Badge variant="secondary">{products.length} ürün</Badge>}
        </div>

        {loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoadingSpinner size="sm" /> Ürünler hazırlanıyor...
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Card key={item}>
                  <Skeleton className="aspect-square w-full rounded-b-none" />
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-5 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && products.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg font-medium">Henüz ürün eklenmemiş</p>
              <p className="mt-1 text-sm text-muted-foreground">Yakında burada harika ürünler olacak.</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const inStock = product.variations.length > 0
                ? product.variations.some((v) => v.stock > 0)
                : product.inStock;
              return (
                <Link key={product.id} href={urunDetayRoute(product.slug)} className="group">
                  <Card className="h-full overflow-hidden transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={product.images[0] || '/images/placeholder-1.jpg'}
                        alt={product.name}
                        fill
                        unoptimized
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <Badge
                        variant={inStock ? 'secondary' : 'destructive'}
                        className="absolute left-3 top-3"
                      >
                        {inStock ? (
                          <span className="inline-flex items-center gap-1">
                            <BadgeCheck className="size-3.5" /> Stokta
                          </span>
                        ) : (
                          'Tükendi'
                        )}
                      </Badge>
                    </div>
                    <CardContent className="space-y-3 p-4">
                      <div>
                        <h3 className="line-clamp-1 text-base font-semibold">{product.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{stripHtml(product.description)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-semibold">₺{product.basePrice.toFixed(2)}</p>
                        <Button size="sm" variant="outline">
                          İncele
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
