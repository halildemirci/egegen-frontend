'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');

  if (images.length === 0) {
    return (
      <Card className="flex aspect-square items-center justify-center rounded-xl bg-muted">
        <p className="text-sm text-muted-foreground">Görsel bulunamadı</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="aspect-square overflow-hidden rounded-xl">
        <div className="relative h-full w-full">
          <Image src={selectedImage} alt={productName} fill unoptimized className="object-cover" />
        </div>
      </Card>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setSelectedImage(image)}
              className={cn(
                'aspect-square overflow-hidden rounded-md border-2 transition',
                selectedImage === image ? 'border-primary' : 'border-border hover:border-primary/40'
              )}
              aria-label={`${productName} görsel ${index + 1}`}
            >
              <div className="relative h-full w-full">
                <Image src={image} alt={`${productName} ${index + 1}`} fill unoptimized className="object-cover" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
