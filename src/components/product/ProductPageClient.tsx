'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product, Variation } from '@/types';
import type { AppliedDynamicField } from '@/types/variation-field';
import { ProductGallery } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { StockStatus } from './StockStatus';
import { VariationSelector } from './VariationSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { urunDetayRoute } from '@/lib/routes';
import { toast } from 'sonner';
import { Share2, ShoppingCart } from 'lucide-react';

interface ProductPageClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
  const hasVariations = product.variations.length > 0;
  const defaultVariation = hasVariations ? product.variations[0] : null;
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(defaultVariation);

  const interactiveFields = product.dynamicFields.filter((f) => f.isInteractive);
  const [fieldSelections, setFieldSelections] = useState<Record<string, string | string[]>>(() =>
    Object.fromEntries(
      interactiveFields.map((f) => [
        f.templateId,
        f.fieldType === 'checkbox' ? [] : (typeof f.value === 'string' ? f.value : ''),
      ])
    )
  );

  useEffect(() => {
    setSelectedVariation(defaultVariation);
  }, [defaultVariation]);

  const currentPrice = selectedVariation?.price ?? product.basePrice;
  const currentStock = selectedVariation?.stock ?? product.baseStock;
  const currentSku = selectedVariation?.sku || product.baseSku;
  const canPurchase = hasVariations ? Boolean(selectedVariation && currentStock > 0) : currentStock > 0;

  const handleShare = async () => {
    const sharePayload = {
      title: product.name,
      text: product.shortDescription || product.description,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(sharePayload);
      return;
    }

    await navigator.clipboard.writeText(sharePayload.url);
    toast.success('Ürün bağlantısı panoya kopyalandı.');
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="space-y-6">
          <ProductInfo product={product} />

          {interactiveFields.length > 0 && (
            <Card>
              <CardContent className="space-y-5 p-5">
                <p className="text-base font-medium">Seçenekler</p>
                {interactiveFields.map((field: AppliedDynamicField) => {
                  const selected = fieldSelections[field.templateId];
                  const setSelected = (val: string | string[]) =>
                    setFieldSelections((prev) => ({ ...prev, [field.templateId]: val }));

                  return (
                    <div key={field.templateId} className="space-y-2">
                      <Label className="text-sm font-medium">
                        {field.label}
                        {field.required && <span className="ml-1 text-destructive">*</span>}
                      </Label>

                      {field.fieldType === 'select' && (
                        <Select value={String(selected)} onValueChange={(v) => setSelected(v ?? '')}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seçin…" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {field.fieldType === 'radio' && (
                        <RadioGroup
                          value={String(selected)}
                          onValueChange={(v) => setSelected(v ?? '')}
                          className="flex flex-wrap gap-4"
                        >
                          {field.options.map((opt) => (
                            <div key={opt} className="flex items-center gap-2">
                              <RadioGroupItem value={opt} id={`if-${field.templateId}-${opt}`} />
                              <Label htmlFor={`if-${field.templateId}-${opt}`}>{opt}</Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {field.fieldType === 'checkbox' && (
                        <div className="flex flex-wrap gap-4">
                          {field.options.map((opt) => {
                            const checked = Array.isArray(selected) && selected.includes(opt);
                            return (
                              <div key={opt} className="flex items-center gap-2">
                                <Checkbox
                                  id={`if-${field.templateId}-${opt}`}
                                  checked={checked}
                                  onCheckedChange={(c) => {
                                    const cur = Array.isArray(selected) ? selected : [];
                                    setSelected(c ? [...cur, opt] : cur.filter((v) => v !== opt));
                                  }}
                                />
                                <Label htmlFor={`if-${field.templateId}-${opt}`}>{opt}</Label>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {field.fieldType === 'input' && (
                        <p className="text-sm text-muted-foreground">{String(selected) || '—'}</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {hasVariations ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <p className="text-base font-medium">Seçenekler</p>
                <VariationSelector
                  variations={product.variations}
                  variationGroups={product.variationGroups}
                  onVariationSelect={setSelectedVariation}
                  initialVariation={defaultVariation || undefined}
                />
              </CardContent>
            </Card>
          ) : (
            <StockStatus stock={currentStock} />
          )}

          <Card>
            <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Seçilen Fiyat</p>
                <p className="text-2xl font-semibold">₺{currentPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Seçilen SKU</p>
                <p className="font-mono text-sm">{currentSku || 'Tanımsız'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Anlık Stok</p>
                <p className={currentStock > 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-destructive'}>
                  {currentStock > 0 ? `${currentStock} adet hazır` : 'Stokta yok'}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button className="w-full" size="lg" disabled={!canPurchase}>
              <ShoppingCart className="size-4" />
              {canPurchase ? 'Sepete Ekle' : 'Stokta Yok'}
            </Button>

            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="size-4" /> Paylaş
            </Button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-14 space-y-5 border-t pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">İlgili Ürünler</h2>
            <Badge variant="outline">{relatedProducts.length} öneri</Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <Link key={relatedProduct.id} href={urunDetayRoute(relatedProduct.slug)}>
                <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
                  <div className="aspect-square bg-muted">
                    <Image
                      src={relatedProduct.images[0] || '/images/placeholder-1.jpg'}
                      alt={relatedProduct.name}
                      width={320}
                      height={320}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="line-clamp-1 text-sm font-medium">{relatedProduct.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">₺{relatedProduct.basePrice.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
