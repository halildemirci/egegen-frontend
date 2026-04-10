import type {
  AppliedDynamicField,
  DynamicFieldTemplate,
  Product,
  ProductSpecificFieldInput,
  ProductType,
  Variation,
  VariationFieldValue,
  VariationGroup,
} from '@/types';
import { generateSlug, stripHtml } from '@/lib/utils';

type UnknownRecord = Record<string, unknown>;

function normalizeDate(input: unknown) {
  if (typeof input === 'string' || input instanceof Date) {
    const date = new Date(input);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function extractList(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  const record = asRecord(data);

  if (Array.isArray(record.data)) {
    return record.data;
  }

  if (Array.isArray(record.items)) {
    return record.items;
  }

  if (Array.isArray(record.products)) {
    return record.products;
  }

  return [];
}

function normalizeFieldValue(value: unknown): string | string[] | boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? ''));
  }

  return String(value ?? '');
}

function mapVariationGroups(productData: UnknownRecord): VariationGroup[] {
  const groups = asArray<UnknownRecord>(
    productData.variation_attributes ?? productData.option_groups
  );

  return groups.map((group, groupIndex) => ({
    code: String(group.code ?? ''),
    name: String(group.name ?? group.code ?? `Group ${groupIndex + 1}`),
    sortOrder: Number(group.sort_order ?? groupIndex),
    values: asArray<UnknownRecord>(group.values).map((value, valueIndex) => ({
      label: String(value.label ?? value.value ?? ''),
      value: String(value.value ?? value.label ?? ''),
      sortOrder: Number(value.sort_order ?? valueIndex),
    })),
  }));
}

function mapVariationAttributes(
  combination: unknown
): Record<string, string> {
  if (Array.isArray(combination)) {
    return Object.fromEntries(
      combination.map((item) => {
        const record = asRecord(item);
        return [
          String(record.group_code ?? record.code ?? ''),
          String(record.value ?? ''),
        ];
      })
    );
  }

  if (combination && typeof combination === 'object') {
    return Object.fromEntries(
      Object.entries(combination).map(([key, rawValue]) => {
        const valueRecord = asRecord(rawValue);
        return [
          key,
          String(valueRecord.value ?? valueRecord.label ?? rawValue ?? ''),
        ];
      })
    );
  }

  return {};
}

function mapVariations(productData: UnknownRecord): Variation[] {
  const variations = asArray<UnknownRecord>(productData.variations);

  return variations.map((variation) => ({
    id: String(variation.id ?? variation.sku ?? crypto.randomUUID()),
    productId: String(productData.id ?? ''),
    sku: String(variation.sku ?? ''),
    price: Number(variation.price ?? productData.base_price ?? 0),
    stock: Number(variation.stock ?? 0),
    isActive: Boolean(variation.is_active ?? true),
    attributes: mapVariationAttributes(variation.combination),
    createdAt: normalizeDate(variation.created_at),
    updatedAt: normalizeDate(variation.updated_at),
  }));
}

function mapProductMedia(productData: UnknownRecord) {
  const media = asArray<UnknownRecord>(productData.media);

  return media
    .map((item, index) => ({
      id: item.id ? String(item.id) : undefined,
      url: String(item.url ?? ''),
      altText: String(item.alt_text ?? productData.name ?? ''),
      sortOrder: Number(item.sort_order ?? index),
      isPrimary: Boolean(item.is_primary ?? index === 0),
    }))
    .filter((item) => Boolean(item.url))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function mapDynamicFields(productData: UnknownRecord): AppliedDynamicField[] {
  const genericFields = asArray<UnknownRecord>(productData.fields);
  const productSpecificRaw = asArray<UnknownRecord>(
    (productData as UnknownRecord).product_specific_fields
  ).map((f) => ({ ...f, scope_type: 'product' }));
  const fields = [
    ...genericFields,
    ...productSpecificRaw.filter(
      (psf) => !genericFields.some((gf) => String(gf.id ?? gf.key) === String(psf.id ?? psf.key))
    ),
  ];

  return fields.map((field, index) => {
    const templateId = String(
      field.template_id ?? field.id ?? field.key ?? `field-${index}`
    );
    const label = String(field.label ?? field.name ?? field.key ?? `Field ${index + 1}`);
    const key = String(field.key ?? generateSlug(label).replace(/-/g, '_'));

    return {
      id: templateId,
      templateId,
      key,
      name: label,
      label,
      fieldType: String(field.type ?? field.field_type ?? 'input') as DynamicFieldTemplate['fieldType'],
      scopeType: String(field.scope ?? field.scope_type ?? 'global') as DynamicFieldTemplate['scopeType'],
      options: asArray<string>(field.options),
      required: Boolean(field.is_required ?? false),
      active: Boolean(field.is_active ?? true),
      displayOrder: Number(field.sort_order ?? index),
      productType: null,
      createdAt: normalizeDate(field.created_at),
      updatedAt: normalizeDate(field.updated_at),
      value: normalizeFieldValue(field.value),
      isInteractive: Boolean(field.is_interactive ?? false),
    };
  });
}

function mapVariationFieldValues(
  dynamicFields: AppliedDynamicField[]
): VariationFieldValue[] {
  return dynamicFields.map((field) => ({
    fieldId: field.templateId,
    value: field.value,
  }));
}

export function mapBackendProductToFrontend(product: unknown): Product {
  const productData = asRecord(product);
  const seoData = asRecord(productData.seo);
  const media = mapProductMedia(productData);
  const imageUrls =
    media.length > 0
      ? media.map((item) => item.url)
      : asArray<string>(productData.images);
  const dynamicFields = mapDynamicFields(productData);
  const variations = mapVariations(productData);
  const baseStock = Number(productData.base_stock ?? productData.stock ?? 0);
  const totalStock =
    variations.length > 0
      ? variations.reduce((sum, variation) => sum + variation.stock, 0)
      : Number(productData.total_stock ?? productData.stock ?? productData.base_stock ?? baseStock);

  return {
    id: String(productData.id ?? ''),
    productTypeId: String(productData.product_type_id ?? ''),
    slug: String(productData.slug ?? ''),
    name: String(productData.name ?? ''),
    shortDescription: String(
      productData.short_description ??
        stripHtml(String(productData.description ?? ''))
    ),
    description: String(
      productData.description ?? productData.short_description ?? ''
    ),
    basePrice: Number(productData.base_price ?? productData.basePrice ?? 0),
    baseStock,
    baseSku: String(productData.sku ?? productData.base_sku ?? ''),
    status: String(productData.status ?? 'active') as Product['status'],
    seoTitle: String(productData.seo_title ?? seoData.title ?? ''),
    seoDescription: String(
      productData.seo_description ?? seoData.description ?? ''
    ),
    images: imageUrls,
    media,
    dynamicFields,
    variationFieldValues: mapVariationFieldValues(dynamicFields),
    variationGroups: mapVariationGroups(productData),
    variations,
    totalStock,
    inStock:
      typeof productData.in_stock === 'boolean'
        ? Boolean(productData.in_stock)
        : totalStock > 0,
    createdAt: normalizeDate(productData.created_at),
    updatedAt: normalizeDate(productData.updated_at),
  };
}

export function mapBackendProductDetailToFrontend(product: unknown) {
  const mappedProduct = mapBackendProductToFrontend(product);

  return {
    product: mappedProduct,
    fields: mappedProduct.dynamicFields
      .filter((field) => {
        const v = field.value;
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'boolean') return true;
        return Boolean(v);
      })
      .map((field) => ({
        id: field.templateId,
        key: field.key,
        name: field.label,
        label: field.label,
        fieldType: field.fieldType,
        scopeType: field.scopeType,
        options: field.options,
        required: field.required,
        active: field.active,
        displayOrder: field.displayOrder,
        productType: field.productType,
        createdAt: field.createdAt,
        updatedAt: field.updatedAt,
        value: field.value,
      })),
  };
}

export function mapBackendFieldTemplateToFrontend(
  field: unknown,
  index = 0
): DynamicFieldTemplate {
  const fieldData = asRecord(field);
  const productType = asRecord(fieldData.product_type);
  const label = String(fieldData.label ?? fieldData.name ?? fieldData.key ?? `Field ${index + 1}`);
  const key = String(fieldData.key ?? generateSlug(label).replace(/-/g, '_'));

  return {
    id: String(fieldData.id ?? key),
    key,
    name: label,
    label,
    fieldType: String(fieldData.field_type ?? fieldData.type ?? 'input') as DynamicFieldTemplate['fieldType'],
    scopeType: String(fieldData.scope_type ?? fieldData.scope ?? 'global') as DynamicFieldTemplate['scopeType'],
    options: asArray<string>(fieldData.options),
    required: Boolean(fieldData.is_required ?? false),
    active: Boolean(fieldData.is_active ?? true),
    displayOrder: Number(fieldData.sort_order ?? index),
    productType:
      Object.keys(productType).length > 0
        ? {
            id: String(productType.id ?? ''),
            name: String(productType.name ?? ''),
            slug: String(productType.slug ?? ''),
          }
        : null,
    createdAt: normalizeDate(fieldData.created_at),
    updatedAt: normalizeDate(fieldData.updated_at),
  };
}

export function mapBackendFieldListToFrontend(data: unknown) {
  return extractList(data).map((item, index) =>
    mapBackendFieldTemplateToFrontend(item, index)
  );
}

export function mapBackendProductListToFrontend(data: unknown): Product[] {
  return extractList(data).map(mapBackendProductToFrontend);
}

export function mapBackendProductTypeToFrontend(productType: unknown): ProductType {
  const productTypeData = asRecord(productType);

  return {
    id: String(productTypeData.id ?? ''),
    name: String(productTypeData.name ?? ''),
    slug: String(productTypeData.slug ?? ''),
    description: String(productTypeData.description ?? ''),
    isActive: Boolean(productTypeData.is_active ?? true),
  };
}

export function mapBackendProductTypeListToFrontend(data: unknown): ProductType[] {
  return extractList(data).map(mapBackendProductTypeToFrontend);
}

export function mapFrontendFieldToBackendPayload(input: unknown) {
  const inputData = asRecord(input);

  return {
    scope_type: String(inputData.scopeType ?? 'global'),
    product_type_id:
      inputData.scopeType === 'product_type' && inputData.productTypeId
        ? Number(inputData.productTypeId)
        : null,
    key: String(inputData.key ?? generateSlug(String(inputData.name ?? 'field')).replace(/-/g, '_')),
    label: String(inputData.label ?? inputData.name ?? ''),
    field_type: String(inputData.fieldType ?? 'input'),
    options: asArray<string>(inputData.options),
    is_required: Boolean(inputData.required),
    is_active: Boolean(inputData.active ?? true),
    sort_order: Number(inputData.displayOrder ?? 0),
  };
}

export function mapFrontendProductToBackendPayload(input: unknown) {
  const inputData = asRecord(input);
  const variationGroups = asArray<VariationGroup>(inputData.variationGroups);
  const variations = asArray<Variation>(inputData.variations);
  const fieldValues = asRecord(inputData.fieldValues);
  const productSpecificFields = asArray<ProductSpecificFieldInput>(
    inputData.productSpecificFields
  );
  const totalStock =
    variations.length > 0
      ? variations.reduce((sum, variation) => sum + Number(variation.stock || 0), 0)
      : Number(inputData.baseStock ?? 0);

  return {
    product_type_id: Number(inputData.productTypeId || 0),
    name: String(inputData.name ?? ''),
    slug: String(inputData.slug ?? generateSlug(String(inputData.name ?? ''))),
    sku: String(inputData.baseSku ?? ''),
    short_description: String(inputData.shortDescription ?? ''),
    description: String(inputData.description ?? ''),
    base_price: Number(inputData.basePrice ?? 0),
    base_stock: totalStock,
    status: String(inputData.status ?? 'draft'),
    seo_title: String(inputData.seoTitle ?? ''),
    seo_description: String(inputData.seoDescription ?? ''),
    selected_global_template_ids: asArray<string>(
      inputData.selectedGlobalTemplateIds
    ).map((value) => Number(value)),
    selected_product_type_template_ids: asArray<string>(
      inputData.selectedProductTypeTemplateIds
    ).map((value) => Number(value)),
    field_values: fieldValues,
    product_specific_fields: productSpecificFields.map((field) => {
      const base = {
        key: field.key,
        label: field.label,
        field_type: field.fieldType,
        options: field.options,
        value: field.value,
        is_required: field.required,
        is_active: field.active ?? true,
        sort_order: field.displayOrder,
      };
      const numericId = Number(field.id);
      return Number.isFinite(numericId) && numericId > 0
        ? { id: numericId, ...base }
        : base;
    }),
    option_groups: variationGroups.map((group) => ({
      name: group.name,
      code: group.code,
      sort_order: group.sortOrder,
      values: group.values.map((value) => ({
        label: value.label,
        value: value.value,
        sort_order: value.sortOrder,
      })),
    })),
    variations: variations.map((variation) => ({
      sku: variation.sku,
      price: Number(variation.price),
      stock: Number(variation.stock),
      is_active: variation.isActive,
      combination: Object.entries(variation.attributes).map(
        ([groupCode, value]) => ({
          group_code: groupCode,
          value,
        })
      ),
    })),
  };
}
