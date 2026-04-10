'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function AdminThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = theme === 'system' ? resolvedTheme : theme;
  const isDark = current === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Aydınlık moda geç' : 'Koyu moda geç'}
      aria-label={isDark ? 'Aydınlık moda geç' : 'Koyu moda geç'}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
