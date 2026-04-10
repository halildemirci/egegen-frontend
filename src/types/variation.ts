export interface VariationOption {
  label: string;
  value: string;
  sortOrder: number;
}

export interface VariationGroup {
  code: string;
  name: string;
  values: VariationOption[];
  sortOrder: number;
}

export interface Variation {
  id: string;
  productId: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  attributes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface VariationAttribute {
  fieldId: string;
  value: string;
}

export interface CreateVariationInput {
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}
