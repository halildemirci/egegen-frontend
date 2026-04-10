'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_ROUTES, ROUTES } from '@/lib/routes';
import { LockKeyhole, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const response = await fetch(API_ROUTES.yonetimOturumBen, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (data?.authenticated) {
        router.replace(ROUTES.yonetim);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ROUTES.yonetimOturumGiris, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          token_name: 'nextjs-admin-panel',
        }),
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Giriş yapılamadı.');
      }

      router.replace(ROUTES.yonetim);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Giriş yapılırken beklenmeyen bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_30%),linear-gradient(to_bottom,#f8fafc,#e2e8f0)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_24%),linear-gradient(to_bottom,#020617,#0f172a)]">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="hidden overflow-hidden border-none bg-[linear-gradient(145deg,#0f172a,#1e293b)] text-white shadow-2xl lg:block">
            <CardContent className="flex h-full flex-col justify-between p-8">
              <div className="space-y-4">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10">
                  <LockKeyhole className="size-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-200/80">Admin</p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                    Ürün, varyasyon ve dinamik alan yönetimi tek panelde.
                  </h1>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-200/85">
                  Laravel API ile konuşan yönetim ekranına giriş yapın. Buradan ürün tipleri,
                  alan şablonları ve varyasyon kurgusu ile katalog akışını yönetebilirsiniz.
                </p>
              </div>
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100/85">
                <p>Güvenli oturum</p>
                <p>Cookie tabanlı admin erişimi</p>
                <p>Backend contract ile birebir çalışan katalog yönetimi</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-background/95 shadow-xl backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Yönetim Girişi</CardTitle>
              <CardDescription>
                Admin hesabınızla giriş yapıp katalog yönetimine devam edin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">
                    Girişten sonra ürün sihirbazı, varyasyon alanları ve katalog yönetimi ekranlarına yönlendirilirsiniz.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  <LogIn className="size-4" />
                  {loading ? 'Giriş yapılıyor...' : 'Panele Gir'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

