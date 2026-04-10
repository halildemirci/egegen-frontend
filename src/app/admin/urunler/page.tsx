'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types';
import { ProductTable } from '@/components/admin/ProductTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { API_ROUTES, ROUTES, apiUrunByIdRoute } from '@/lib/routes';
import { Plus, RefreshCw } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: products.length,
      totalVariations: products.reduce((sum, product) => sum + product.variations.length, 0),
      totalStock: products.reduce((sum, product) => sum + product.totalStock, 0),
    };
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ROUTES.yonetimUrunler, { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Ürünler yüklenemedi.');
      }

      setProducts(payload.data || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const response = await fetch(apiUrunByIdRoute(id), { method: 'DELETE' });

    if (response.status === 204) {
      setProducts((current) => current.filter((product) => product.id !== id));
      return;
    }

    const payload = await response.json();

    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error || 'Ürün silinemedi.');
    }

    setProducts((current) => current.filter((product) => product.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ürünler</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kataloğu yönetin, ürünleri düzenleyin ve stok durumunu takip edin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className="size-4" /> Yenile
          </Button>
          <Button nativeButton={false} render={<Link href={ROUTES.yonetimUrunYeni} />}>
            <Plus className="size-4" /> Ürün Sihirbazı
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Toplam Ürün</p>
          <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Toplam Varyasyon</p>
          <p className="mt-1 text-2xl font-semibold">{stats.totalVariations}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">Toplam Stok</p>
          <p className="mt-1 text-2xl font-semibold">{stats.totalStock}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <ProductTable products={products} onDelete={handleDelete} isLoading={loading} />
      )}
    </div>
  );
}
