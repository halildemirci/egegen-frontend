import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StockStatusProps {
  stock: number;
  variant?: 'large' | 'small';
}

export function StockStatus({ stock, variant = 'large' }: StockStatusProps) {
  const inStock = stock > 0;
  const lowStock = stock > 0 && stock <= 5;

  const statusText = inStock ? (lowStock ? `Son ${stock} adet` : 'Stokta') : 'Tükendi';

  if (variant === 'small') {
    return (
      <Badge variant={inStock ? 'secondary' : 'destructive'} className="text-[11px]">
        {statusText}
      </Badge>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 text-center text-sm font-medium',
        inStock
          ? lowStock
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-800'
      )}
    >
      {inStock ? (lowStock ? `Son ${stock} Adet Kaldı` : 'Stokta Mevcut') : 'Stokta Yok'}
    </div>
  );
}
