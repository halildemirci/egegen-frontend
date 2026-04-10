import type { Product } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { sanitizeRichHtml, stripHtml } from '@/lib/utils';

interface ProductInfoProps {
  product: Product;
}

function formatFieldValue(value: string | string[] | boolean) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'Belirtilmedi';
  }

  if (typeof value === 'boolean') {
    return value ? 'Evet' : 'Hayır';
  }

  return value || 'Belirtilmedi';
}

export function ProductInfo({ product }: ProductInfoProps) {
  const summaryItems = [
    {
      label: 'Başlangıç Fiyatı',
      value: `₺${product.basePrice.toFixed(2)}`,
      valueClassName: 'text-3xl font-semibold',
    },
    {
      label: 'Ürün Kodu',
      value: product.baseSku || 'Tanımsız',
      valueClassName: 'font-mono text-base',
    },
    {
      label: 'Durum',
      value: product.inStock ? 'Stokta' : 'Stokta Yok',
      valueClassName: product.inStock ? 'font-semibold text-emerald-600' : 'font-semibold text-destructive',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <Badge variant="outline" className="mb-3">
          Ürün Detayı
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
        {product.shortDescription && (
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            {product.shortDescription}
          </p>
        )}
        <div
          className="mt-4 text-base leading-relaxed text-muted-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichHtml(product.description || `<p>${stripHtml(product.description)}</p>`),
          }}
        />
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          {summaryItems.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className={item.valueClassName}>{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {product.dynamicFields.filter((field) => {
        if (field.isInteractive) return false;
        const v = field.value;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'boolean') return true;
        return Boolean(v);
      }).length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-medium">Ürün Özellikleri</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.dynamicFields
                .filter((field) => {
                  if (field.isInteractive) return false;
                  const v = field.value;
                  if (Array.isArray(v)) return v.length > 0;
                  if (typeof v === 'boolean') return true;
                  return Boolean(v);
                })
                .map((field) => (
                <div key={field.templateId} className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  {Array.isArray(field.value) ? (
                    field.value.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {field.value.map((item) => (
                          <Badge key={item} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm font-medium text-muted-foreground">Belirtilmedi</p>
                    )
                  ) : (
                    <p className="mt-1 text-sm font-medium">{formatFieldValue(field.value)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
