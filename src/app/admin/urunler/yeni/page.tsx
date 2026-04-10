'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { buildAdminProductFormData } from '@/lib/admin-catalog';
import { API_ROUTES, ROUTES } from '@/lib/routes';
import type { ProductFormData } from '@/types';

export default function CreateProductPage() {
  const router = useRouter();
  const [defaultProductTypeId, setDefaultProductTypeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const typesResponse = await fetch(API_ROUTES.yonetimUrunTipleri, { cache: 'no-store' });
        const typesPayload = await typesResponse.json();
        if (typesPayload?.success && typesPayload.data?.length > 0) {
          setDefaultProductTypeId(typesPayload.data[0].id);
        }
      } catch {
        // silently ignore — product_type_id will be empty
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  const handleSubmit = async (formData: ProductFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(API_ROUTES.yonetimUrunler, {
        method: 'POST',
        body: buildAdminProductFormData({ ...formData, productTypeId: defaultProductTypeId }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Urun olusturulamadi.');
      }

      router.push(ROUTES.yonetimUrunler);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Urun olusturulamadi.';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Yeni Ürün</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ürün ve varyasyon bilgilerini 3 adımlı akışla yönetin.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <ProductForm onSubmit={handleSubmit} isLoading={submitting} />
    </div>
  );
}
