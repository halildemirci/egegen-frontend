export type FieldType = 'input' | 'select' | 'checkbox' | 'radio';
export type DynamicFieldScope = 'global' | 'product_type' | 'product';

export interface ProductTypeSummary {
  id: string;
  name: string;
  slug: string;
}

export interface DynamicFieldTemplate {
  id: string;
  key: string;
  name: string;
  label: string;
  fieldType: FieldType;
  scopeType: DynamicFieldScope;
  options: string[];
  required: boolean;
  active: boolean;
  displayOrder: number;
  productType: ProductTypeSummary | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DynamicFieldValue {
  fieldId: string;
  value: string | string[] | boolean;
}

export interface AppliedDynamicField extends DynamicFieldTemplate {
  templateId: string;
  value: string | string[] | boolean;
  isInteractive?: boolean;
}

export interface ProductSpecificFieldInput {
  id?: string;
  key: string;
  label: string;
  fieldType: FieldType;
  options: string[];
  required: boolean;
  active: boolean;
  displayOrder: number;
  value: string | string[] | boolean;
  isInteractive?: boolean;
}

export type VariationField = DynamicFieldTemplate;
export type VariationFieldValue = DynamicFieldValue;
