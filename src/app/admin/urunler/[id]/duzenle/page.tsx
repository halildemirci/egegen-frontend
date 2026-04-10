'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { buildAdminProductFormData } from '@/lib/admin-catalog';
import { ROUTES, apiUrunByIdRoute } from '@/lib/routes';
import type { Product, ProductFormData } from '@/types';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const productResponse = await fetch(apiUrunByIdRoute(productId), { cache: 'no-store' });
        const productPayload = await productResponse.json();

        if (!productResponse.ok || !productPayload?.success) {
          throw new Error(productPayload?.error || 'Urun yuklenemedi.');
        }

        setProduct(productPayload.data || null);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Urun yuklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, [productId]);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(apiUrunByIdRoute(productId), {
        method: 'PUT',
        body: buildAdminProductFormData(formData),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Urun guncellenemedi.');
      }

      router.push(ROUTES.yonetimUrunler);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Urun guncellenemedi.';
      setError(message);
      throw submitError;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 text-sm text-destructive">
          {error || 'Urun bulunamadi.'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Urun Duzenleme Sihirbazi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {product.name} urununun katalog ve varyasyon yapilarini adimli akisla guncelliyorsunuz.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <ProductForm product={product} onSubmit={handleSubmit} isLoading={submitting} />
    </div>
  );
}
