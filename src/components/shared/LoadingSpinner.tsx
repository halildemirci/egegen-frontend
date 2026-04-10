import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'size-4',
    md: 'size-7',
    lg: 'size-10',
  }[size];

  return <Loader2 className={cn('animate-spin text-primary', sizeClass)} aria-label="Yükleniyor" />;
}
