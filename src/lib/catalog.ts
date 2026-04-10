import { cache } from 'react';
import { backendRequest } from '@/lib/backend-api';
import {
  mapBackendProductDetailToFrontend,
  mapBackendProductListToFrontend,
} from '@/lib/backend-mappers';

export const getPublicProducts = cache(async () => {
  const response = await backendRequest('/products');

  return mapBackendProductListToFrontend(response);
});

export const getPublicProductDetail = cache(async (slug: string) => {
  const response = await backendRequest(`/products/${slug}`);

  return mapBackendProductDetailToFrontend(response);
});
