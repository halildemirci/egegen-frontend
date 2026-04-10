import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/product/ProductPageClient';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getPublicProductDetail, getPublicProducts } from '@/lib/catalog';
import { ROUTES, urunDetayRoute } from '@/lib/routes';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { product } = await getPublicProductDetail(slug);

    return {
      title: product.seoTitle || `${product.name} | E-Mağaza`,
      description: product.seoDescription || product.shortDescription || product.description,
      alternates: {
        canonical: urunDetayRoute(product.slug),
      },
      openGraph: {
        title: product.seoTitle || product.name,
        description: product.seoDescription || product.shortDescription || product.description,
        type: 'website',
        locale: 'tr_TR',
        images: product.images[0]
          ? [
              {
                url: product.images[0],
                width: 1200,
                height: 630,
                alt: product.name,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.seoTitle || product.name,
        description: product.seoDescription || product.shortDescription || product.description,
        images: product.images[0] ? [product.images[0]] : [],
      },
    };
  } catch {
    return {
      title: 'Ürün Bulunamadı | E-Mağaza',
      description: 'Aradığınız ürün bulunamadı.',
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let detail;

  try {
    detail = await getPublicProductDetail(slug);
  } catch {
    notFound();
  }

  const relatedProducts = (await getPublicProducts())
    .filter((candidate) => candidate.id !== detail.product.id)
    .slice(0, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: detail.product.name,
    description:
      detail.product.shortDescription || detail.product.description || detail.product.name,
    image: detail.product.images,
    sku: detail.product.baseSku,
    offers: {
      '@type': 'Offer',
      price: detail.product.basePrice,
      priceCurrency: 'TRY',
      availability: detail.product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: urunDetayRoute(detail.product.slug),
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={ROUTES.home} />}>Ana Sayfa</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{detail.product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <ProductPageClient product={detail.product} relatedProducts={relatedProducts} />
    </main>
  );
}
