import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export default async function LegacyProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`${ROUTES.urun}/${slug}`);
}
