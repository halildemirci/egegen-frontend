import type { ProductFormData } from '@/types';
import { generateSlug } from '@/lib/utils';

function appendScalar(formData: FormData, key: string, value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return;
  }

  formData.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
}

function appendFieldValue(formData: FormData, key: string, value: string | string[] | boolean) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      formData.append(`${key}[${index}]`, item);
    });

    return;
  }

  appendScalar(formData, key, value);
}

export function buildAdminProductFormData(input: ProductFormData) {
  const formData = new FormData();
  appendScalar(formData, 'name', input.name);
  appendScalar(formData, 'product_type_id', input.productTypeId);
  appendScalar(formData, 'slug', input.slug || generateSlug(input.name));
  appendScalar(formData, 'sku', input.baseSku);
  appendScalar(formData, 'short_description', input.shortDescription);
  appendScalar(formData, 'description', input.description);
  appendScalar(formData, 'base_price', input.basePrice);
  appendScalar(formData, 'base_stock', input.baseStock);
  appendScalar(formData, 'status', input.status);
  appendScalar(formData, 'seo_title', input.seoTitle);
  appendScalar(formData, 'seo_description', input.seoDescription);

  input.productSpecificFields.forEach((field, index) => {
    appendScalar(formData, `product_specific_fields[${index}][id]`, field.id);
    appendScalar(formData, `product_specific_fields[${index}][key]`, field.key);
    appendScalar(formData, `product_specific_fields[${index}][label]`, field.label);
    appendScalar(formData, `product_specific_fields[${index}][field_type]`, field.fieldType);
    appendScalar(formData, `product_specific_fields[${index}][is_required]`, field.required);
    appendScalar(formData, `product_specific_fields[${index}][is_active]`, field.active);
    appendScalar(formData, `product_specific_fields[${index}][sort_order]`, field.displayOrder);
    appendScalar(formData, `product_specific_fields[${index}][is_interactive]`, field.isInteractive ?? false);

    field.options.forEach((option, optionIndex) => {
      appendScalar(
        formData,
        `product_specific_fields[${index}][options][${optionIndex}]`,
        option
      );
    });

    appendFieldValue(formData, `product_specific_fields[${index}][value]`, field.value);
  });

  input.variationGroups.forEach((group, groupIndex) => {
    appendScalar(formData, `option_groups[${groupIndex}][name]`, group.name);
    appendScalar(formData, `option_groups[${groupIndex}][code]`, group.code);
    appendScalar(formData, `option_groups[${groupIndex}][sort_order]`, group.sortOrder);

    group.values.forEach((value, valueIndex) => {
      appendScalar(
        formData,
        `option_groups[${groupIndex}][values][${valueIndex}][label]`,
        value.label
      );
      appendScalar(
        formData,
        `option_groups[${groupIndex}][values][${valueIndex}][value]`,
        value.value
      );
      appendScalar(
        formData,
        `option_groups[${groupIndex}][values][${valueIndex}][sort_order]`,
        value.sortOrder
      );
    });
  });

  input.variations.forEach((variation, variationIndex) => {
    appendScalar(formData, `variations[${variationIndex}][sku]`, variation.sku);
    appendScalar(formData, `variations[${variationIndex}][price]`, variation.price);
    appendScalar(formData, `variations[${variationIndex}][stock]`, variation.stock);
    appendScalar(formData, `variations[${variationIndex}][is_active]`, variation.isActive);

    Object.entries(variation.attributes).forEach(([groupCode, value], combinationIndex) => {
      appendScalar(
        formData,
        `variations[${variationIndex}][combination][${combinationIndex}][group_code]`,
        groupCode
      );
      appendScalar(
        formData,
        `variations[${variationIndex}][combination][${combinationIndex}][value]`,
        value
      );
    });
  });

  input.existingMedia
    .filter((media) => media.id)
    .forEach((media, mediaIndex) => {
      appendScalar(formData, `existing_media[${mediaIndex}][id]`, media.id);
      appendScalar(formData, `existing_media[${mediaIndex}][alt_text]`, media.altText);
      appendScalar(formData, `existing_media[${mediaIndex}][sort_order]`, media.sortOrder);
      appendScalar(formData, `existing_media[${mediaIndex}][is_primary]`, media.isPrimary);
      appendScalar(formData, `existing_media[${mediaIndex}][remove]`, media.remove);
    });

  input.newImages.forEach((file) => {
    formData.append('images[]', file);
  });

  return formData;
}

