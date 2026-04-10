import type {
  AppliedDynamicField,
  ProductSpecificFieldInput,
  VariationFieldValue,
} from './variation-field';
import type { Variation, VariationGroup } from './variation';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface ProductMedia {
  id?: string;
  url: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
  remove?: boolean;
  file?: File;
}

export interface Product {
  id: string;
  productTypeId: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  baseStock: number;
  baseSku: string;
  status: ProductStatus;
  seoTitle: string;
  seoDescription: string;
  images: string[];
  media: ProductMedia[];
  dynamicFields: AppliedDynamicField[];
  variationFieldValues: VariationFieldValue[];
  variationGroups: VariationGroup[];
  variations: Variation[];
  totalStock: number;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithVariations extends Product {
  variations: Variation[];
}

export interface ProductFormData {
  productTypeId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  baseStock: number;
  baseSku: string;
  status: ProductStatus;
  seoTitle: string;
  seoDescription: string;
  productSpecificFields: ProductSpecificFieldInput[];
  variationGroups: VariationGroup[];
  variations: Variation[];
  existingMedia: ProductMedia[];
  newImages: File[];
}

export type CreateProductInput = ProductFormData;
export type UpdateProductInput = Partial<ProductFormData>;

