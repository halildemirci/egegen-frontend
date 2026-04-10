'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { DynamicFieldTemplate, Product } from '@/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { API_ROUTES, ROUTES } from '@/lib/routes';
import {
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Layers,
  Plus,
  Shapes,
  Sparkles,
} from 'lucide-react';

interface Stats {
  productsCount: number;
  templatesCount: number;
  variationsCount: number;
  imagesCount: number;
  totalStock: number;
  averagePrice: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    productsCount: 0,
    templatesCount: 0,
    variationsCount: 0,
    imagesCount: 0,
    totalStock: 0,
    averagePrice: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [productsResponse, templatesResponse] = await Promise.all([
          fetch(API_ROUTES.yonetimUrunler, { cache: 'no-store' }),
          fetch(API_ROUTES.yonetimAlanSablonlari, { cache: 'no-store' }),
        ]);
        const [productsPayload, templatesPayload] = await Promise.all([
          productsResponse.json(),
          templatesResponse.json(),
        ]);

        if (!productsResponse.ok || !productsPayload?.success) {
          throw new Error(productsPayload?.error || 'Ürünler yüklenemedi.');
        }

        if (!templatesResponse.ok || !templatesPayload?.success) {
          throw new Error(templatesPayload?.error || 'Alan şablonları yüklenemedi.');
        }

        const products = (productsPayload.data || []) as Product[];
        const templates = (templatesPayload.data || []) as DynamicFieldTemplate[];

        setStats({
          productsCount: products.length,
          templatesCount: templates.length,
          variationsCount: products.reduce((sum, product) => sum + product.variations.length, 0),
          imagesCount: products.reduce((sum, product) => sum + product.media.length, 0),
          totalStock: products.reduce((sum, product) => sum + product.totalStock, 0),
          averagePrice:
            products.length > 0
              ? products.reduce((sum, product) => sum + product.basePrice, 0) / products.length
              : 0,
        });

        setRecentProducts(
          [...products]
            .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
            .slice(0, 5)
        );
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Veriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Toplam Ürün',
      value: stats.productsCount,
      icon: Boxes,
    },
    {
      label: 'Dinamik Alan',
      value: stats.templatesCount,
      icon: Shapes,
    },
    {
      label: 'Toplam Varyasyon',
      value: stats.variationsCount,
      icon: Layers,
    },
    {
      label: 'Ortalama Fiyat',
      value: `₺${stats.averagePrice.toFixed(0)}`,
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-[linear-gradient(130deg,#0b1220_0%,#152238_48%,#1d2f4f_100%)] text-white">
        <CardContent className="relative p-6">
          <Sparkles className="absolute right-6 top-6 size-5 text-white/60" />
          <h1 className="text-2xl font-semibold tracking-tight">Kontrol Paneli</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-200/90">
            Laravel API ile senkron çalışan ürün, dinamik alan ve varyasyon akışını izleyin.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" nativeButton={false} render={<Link href={ROUTES.yonetimUrunYeni} />}>
              <Plus className="size-4" /> Ürün Sihirbazını Aç
            </Button>
            <Button variant="outline" nativeButton={false} className="border-white/25 bg-white/10 text-white hover:bg-white/15" render={<Link href={ROUTES.yonetimUrunler} />}>
              Ürünlere Git <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="pb-3">
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <CardTitle className="text-3xl tracking-tight">{stat.value}</CardTitle>
                <div className="rounded-lg border bg-muted p-2">
                  <Icon className="size-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Son Eklenen Ürünler</CardTitle>
              <CardDescription>Son 5 ürünün özet görünümü</CardDescription>
            </div>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={ROUTES.yonetimUrunler} />}>
              Tümünü Gör
            </Button>
          </CardHeader>
          <CardContent>
            {recentProducts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Henüz ürün eklenmemiş.</p>
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product, index) => (
                  <div key={product.id}>
                    <div className="flex items-center gap-3">
                      <Image
                        src={product.images[0] || '/images/placeholder-1.jpg'}
                        alt={product.name}
                        width={44}
                        height={44}
                        unoptimized
                        className="size-11 rounded-md border object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.variations.length} varyasyon · {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <Badge variant="secondary">₺{product.basePrice.toFixed(2)}</Badge>
                    </div>
                    {index < recentProducts.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Yönetim akışını hızlandırın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" nativeButton={false} className="w-full justify-start" render={<Link href={ROUTES.yonetimUrunYeni} />}>
              <Plus className="size-4" /> Ürün Sihirbazı
            </Button>
            <Button variant="outline" nativeButton={false} className="w-full justify-start" render={<Link href={ROUTES.yonetimVaryasyonAtamalari} />}>
              <Shapes className="size-4" /> Dinamik Alanları Yönet
            </Button>
            <Button variant="outline" nativeButton={false} className="w-full justify-start" render={<Link href={ROUTES.yonetimUrunler} />}>
              <Boxes className="size-4" /> Tüm Ürünler
            </Button>

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-md bg-muted p-2.5">
                <p className="text-lg font-semibold">{stats.totalStock}</p>
                <p className="text-[11px] text-muted-foreground">Toplam Stok</p>
              </div>
              <div className="rounded-md bg-muted p-2.5">
                <p className="text-lg font-semibold">{stats.imagesCount}</p>
                <p className="text-[11px] text-muted-foreground">Toplam Görsel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
