'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProductError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ürün yüklenirken bir sorun oluştu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sayfayı yeniden deneyebilir veya biraz sonra tekrar ziyaret edebilirsiniz.
          </p>
          <Button onClick={() => reset()}>Tekrar Dene</Button>
        </CardContent>
      </Card>
    </main>
  );
}
