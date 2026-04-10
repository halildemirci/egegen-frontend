import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/routes';

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ürün bulunamadı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            İstediğiniz ürün kaldırılmış, yayından alınmış veya bağlantı değişmiş olabilir.
          </p>
          <Button nativeButton={false} render={<Link href={ROUTES.home} />}>
            Ana Sayfaya Dön
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
