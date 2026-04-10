'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import type { Product } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROUTES, yonetimUrunDuzenleRoute } from '@/lib/routes';
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function ProductTable({ products, onDelete, isLoading = false }: ProductTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.baseSku.toLowerCase().includes(term) ||
      product.slug.toLowerCase().includes(term)
    );
  });

  const totalStock = (product: Product) => product.variations.reduce((sum, v) => sum + v.stock, 0);

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <p className="text-base font-medium">Henüz ürün bulunmuyor</p>
          <p className="mt-1 text-sm text-muted-foreground">İlk ürününüzü ekleyerek başlayın.</p>
          <Button className="mt-5" nativeButton={false} render={<Link href={ROUTES.yonetimUrunYeni} />}>
            <Plus className="size-4" /> Ürün Sihirbazı
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Ürün adı, SKU veya slug ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
        {searchTerm && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {filteredProducts.length} sonuç
          </span>
        )}
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Varyasyon</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stock = totalStock(product);
                const inStock = stock > 0;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.images[0] || '/images/placeholder-1.jpg'}
                          alt={product.name}
                          width={44}
                          height={44}
                          unoptimized
                          className="size-11 rounded-md border object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="truncate text-xs text-muted-foreground">/{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{product.baseSku}</TableCell>
                    <TableCell className="font-medium">₺{product.basePrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={inStock ? 'secondary' : 'destructive'}>
                        {inStock ? 'Aktif' : 'Tükendi'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.variations.length} adet</Badge>
                    </TableCell>
                    <TableCell>{new Date(product.createdAt).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link href={yonetimUrunDuzenleRoute(product.id)} />}>
                          <Pencil className="size-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                            <Trash2 className="size-4" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Ürün Silinsin mi?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. {product.name} ürünü kalıcı olarak silinecek.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDelete(product.id)}
                                disabled={deleting === product.id || isLoading}
                              >
                                {deleting === product.id ? (
                                  <>
                                    <Loader2 className="size-4 animate-spin" /> Siliniyor
                                  </>
                                ) : (
                                  'Sil'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && searchTerm && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              &quot;{searchTerm}&quot; ile eşleşen ürün bulunamadı.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
