'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type {
  DynamicFieldTemplate,
  FieldType,
  Product,
  ProductFormData,
  ProductSpecificFieldInput,
  Variation,
  VariationGroup,
} from '@/types';
import { API_ROUTES } from '@/lib/routes';
import { AdminFormFooter, AdminFormPanel } from '@/components/admin/AdminFormPanel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, generateId, generateSlug } from '@/lib/utils';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  Layers3,
  LayoutList,
  Loader2,
  Package2,
  Plus,
  Trash2,
  WandSparkles,
} from 'lucide-react';

type FieldValue = string | string[] | boolean;
type ProductFormStep = 'basics' | 'fields' | 'variations' | 'media';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

const STEP_ORDER: ProductFormStep[] = [
  'basics',
  'fields',
  'variations',
  'media',
];
const FIELD_STACK = 'flex flex-col gap-2';
const FIELD_GRID = 'grid gap-5 md:grid-cols-2';
const FULL_WIDTH_FIELD = 'md:col-span-2';

const FIELD_TYPE_LABELS: Record<string, string> = {
  input: 'Metin',
  select: 'Seçim Kutusu',
  radio: 'Radyo',
  checkbox: 'Çoklu Seçim',
};

const STEP_META: Record<
  ProductFormStep,
  { title: string; description: string; shortLabel: string; icon: typeof Package2 }
> = {
  basics: {
    title: 'Temel Bilgiler',
    description: 'Ürünün adı, tipi, fiyatı, stok yapısı ve SEO bilgilerini netleştirin.',
    shortLabel: 'Temel',
    icon: Package2,
  },
  fields: {
    title: 'Ürüne Özel Alanlar',
    description: 'Bu ürüne özgü ekstra bilgi alanları tanımlayın.',
    shortLabel: 'Alanlar',
    icon: LayoutList,
  },
  variations: {
    title: 'Varyasyonlar',
    description: 'Renk, beden ve kombinasyon bazlı fiyat-stok yapısını yönetin.',
    shortLabel: 'Varyasyon',
    icon: Layers3,
  },
  media: {
    title: 'Medya ve Son Kontrol',
    description: 'Görselleri düzenleyin ve submit öncesi ürün özetini kontrol edin.',
    shortLabel: 'Medya',
    icon: Images,
  },
};

function toSku(value: string) {
  const slug = generateSlug(value).replace(/-/g, '_').toUpperCase();
  return slug || 'URUN';
}

function parseFieldOptions(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeFieldValue(fieldType: FieldType, value: FieldValue | undefined): FieldValue {
  if (fieldType === 'checkbox') {
    return Array.isArray(value) ? value : [];
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : '';
  }
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value || '';
}

function buildVariationSignature(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('|');
}

function buildCombinations(groups: VariationGroup[]) {
  const validGroups = groups.filter((group) => group.values.length > 0);
  if (validGroups.length === 0) {
    return [] as Record<string, string>[];
  }
  return validGroups.reduce<Record<string, string>[]>(
    (accumulator, group) => {
      const next = group.values.map((value) => value.value);
      if (accumulator.length === 0) {
        return next.map((value) => ({ [group.code]: value }));
      }
      return accumulator.flatMap((current) =>
        next.map((value) => ({
          ...current,
          [group.code]: value,
        }))
      );
    },
    []
  );
}

function createVariationRecords(
  groups: VariationGroup[],
  previousVariations: Variation[],
  baseSku: string,
  basePrice: number,
  baseStock: number,
  productId: string
) {
  const previousBySignature = new Map(
    previousVariations.map((variation) => [
      buildVariationSignature(variation.attributes),
      variation,
    ])
  );

  return buildCombinations(groups).map((attributes, index) => {
    const signature = buildVariationSignature(attributes);
    const previous = previousBySignature.get(signature);
    return {
      id: previous?.id || generateId(),
      productId: previous?.productId || productId,
      sku: previous?.sku || `${baseSku || 'SKU'}-${String(index + 1).padStart(3, '0')}`,
      price: previous?.price ?? basePrice,
      stock: previous?.stock ?? baseStock,
      isActive: previous?.isActive ?? true,
      attributes,
      createdAt: previous?.createdAt || new Date(),
      updatedAt: new Date(),
    };
  });
}

function buildInitialFormData(product?: Product): ProductFormData {
  const dynamicFields = product?.dynamicFields ?? [];
  return {
    productTypeId: '',
    name: product?.name || '',
    slug: product?.slug || '',
    shortDescription: product?.shortDescription || '',
    description: product?.description || '',
    basePrice: product?.basePrice || 0,
    baseStock: product?.baseStock || 0,
    baseSku: product?.baseSku || '',
    status: product?.status || 'active',
    seoTitle: product?.seoTitle || '',
    seoDescription: product?.seoDescription || '',
    productSpecificFields: dynamicFields
      .filter((field) => field.scopeType === 'product')
      .map((field, index) => ({
        _reactKey: field.templateId || crypto.randomUUID(),
        id: field.templateId,
        key: field.key,
        label: field.label,
        fieldType: field.fieldType,
        options: field.options,
        required: field.required,
        active: field.active,
        displayOrder: field.displayOrder || index,
        value: normalizeFieldValue(field.fieldType, field.value),
        isInteractive: field.isInteractive ?? false,
      })),
    variationGroups: product?.variationGroups || [],
    variations: product?.variations || [],
    existingMedia: product?.media.map((media) => ({ ...media, remove: false })) || [],
    newImages: [],
  };
}

function StepBadge({
  index,
  step,
  active,
  complete,
  onSelect,
}: {
  index: number;
  step: ProductFormStep;
  active: boolean;
  complete: boolean;
  onSelect: () => void;
}) {
  const Icon = STEP_META[step].icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex min-w-36 flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
        active ? 'border-primary bg-primary/8 shadow-sm' : 'border-border/70 bg-background hover:border-primary/40 hover:bg-muted/50'
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold',
          active
            ? 'border-primary bg-primary text-primary-foreground'
            : complete
              ? 'border-emerald-200 bg-emerald-500 text-white'
              : 'border-border/70 bg-muted text-muted-foreground'
        )}
      >
        {complete ? <Check className="size-4" /> : index + 1}
      </span>
      <span className="min-w-0 space-y-0.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-4 text-muted-foreground" />
          {STEP_META[step].shortLabel}
        </span>
        <span className="block text-xs text-muted-foreground">{STEP_META[step].title}</span>
      </span>
    </button>
  );
}

export function ProductForm({
  product,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(() => buildInitialFormData(product));
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<ProductFormStep>('basics');
  const [rawGroupValues, setRawGroupValues] = useState<Record<number, string>>({});
  const [rawFieldOptions, setRawFieldOptions] = useState<Record<number, string>>({});
  const [globalGroups, setGlobalGroups] = useState<VariationGroup[]>([]);

  useEffect(() => {
    fetch(API_ROUTES.yonetimVaryasyonGruplari, { cache: 'no-store' })
      .then((res) => res.json())
      .then((payload) => {
        const raw = payload?.data;
        const list: VariationGroup[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.items)
              ? raw.items
              : [];
        setGlobalGroups(list);
      })
      .catch(() => {/* sessizce geç */});
  }, []);

  const visibleStepIndex = STEP_ORDER.indexOf(currentStep);

  const handleBasicChange = <Key extends keyof ProductFormData>(key: Key, value: ProductFormData[Key]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleVariationGroupChange = (index: number, patch: Partial<VariationGroup>) => {
    setFormData((current) => ({
      ...current,
      variationGroups: current.variationGroups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, ...patch } : group
      ),
    }));
  };

  const handleGenerateVariations = () => {
    handleBasicChange(
      'variations',
      createVariationRecords(
        formData.variationGroups,
        formData.variations,
        formData.baseSku || toSku(formData.name),
        formData.basePrice,
        formData.baseStock,
        product?.id || 'new'
      )
    );
  };

  const handlePrimaryMediaChange = (index: number) => {
    setFormData((current) => ({
      ...current,
      existingMedia: current.existingMedia.map((media, mediaIndex) => ({
        ...media,
        isPrimary: mediaIndex === index,
      })),
    }));
  };

  const validateBasics = () => {
    if (!formData.name.trim()) {
      return 'Ürün adı zorunludur.';
    }
    if (!formData.baseSku.trim()) {
      return 'SKU zorunludur.';
    }
    if (formData.basePrice < 0 || Number.isNaN(formData.basePrice)) {
      return 'Fiyat geçerli bir sayı olmalıdır.';
    }
    if (formData.baseStock < 0 || Number.isNaN(formData.baseStock)) {
      return 'Stok geçerli bir sayı olmalıdır.';
    }
    return null;
  };

  const validateVariations = () => {
    return null;
  };

  const validateStep = (step: ProductFormStep) => {
    if (step === 'basics') return validateBasics();
    if (step === 'variations') return validateVariations();
    return null;
  };

  const goToStep = (nextStep: ProductFormStep) => {
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const targetIndex = STEP_ORDER.indexOf(nextStep);

    if (targetIndex <= currentIndex) {
      setError(null);
      setCurrentStep(nextStep);
      return true;
    }

    for (let index = currentIndex; index < targetIndex; index += 1) {
      const stepError = validateStep(STEP_ORDER[index]);

      if (stepError) {
        setError(stepError);
        setCurrentStep(STEP_ORDER[index]);
        return false;
      }
    }

    setError(null);
    setCurrentStep(nextStep);
    return true;
  };

  const handleNext = () => {
    const nextStep = STEP_ORDER[visibleStepIndex + 1];
    if (nextStep) {
      goToStep(nextStep);
    }
  };

  const handleBack = () => {
    const previousStep = STEP_ORDER[visibleStepIndex - 1];
    if (previousStep) {
      setError(null);
      setCurrentStep(previousStep);
    }
  };

  const handleSubmit = async () => {
    const slug = formData.slug || generateSlug(formData.name);

    for (const step of STEP_ORDER) {
      const stepError = validateStep(step);
      if (stepError) {
        setError(stepError);
        setCurrentStep(step);
        return;
      }
    }

    const variations =
      formData.variationGroups.length > 0 && formData.variations.length === 0
        ? createVariationRecords(
            formData.variationGroups,
            [],
            formData.baseSku || toSku(formData.name),
            formData.basePrice,
            formData.baseStock,
            product?.id || 'new'
          )
        : formData.variations;

    setError(null);

    try {
      await onSubmit({
        ...formData,
        slug,
        variationGroups: formData.variationGroups.map((group, groupIndex) => ({
          ...group,
          sortOrder: groupIndex,
          code: group.code || generateSlug(group.name).replace(/-/g, '_'),
          values: group.values.map((value, valueIndex) => ({
            ...value,
            sortOrder: valueIndex,
            value: value.value || generateSlug(value.label).replace(/-/g, '_'),
          })),
        })),
        variations,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ürün kaydedilemedi.');
      throw submitError;
    }
  };

  const summaryItems = [
    { label: 'Grup', value: formData.variationGroups.length },
    { label: 'Varyasyon', value: formData.variations.filter((variation) => variation.isActive).length },
  ];

  const renderBasicsStep = () => (
    <div className="space-y-5">
      {/* Kimlik */}
      <AdminFormPanel
        title="Ürün Kimliği"
        description="Adı, URL ve stok takip kodunu belirleyin."
        contentClassName="space-y-5"
      >
        <div className={FIELD_STACK}>
          <Label htmlFor="product-name">Ürün Adı</Label>
          <Input
            id="product-name"
            placeholder="ör. Pamuklu Basic T-Shirt"
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => {
                const nextName = event.target.value;
                const autoSlug =
                  !current.slug || current.slug === generateSlug(current.name)
                    ? generateSlug(nextName)
                    : current.slug;
                const autoSku =
                  !current.baseSku || current.baseSku === toSku(current.name)
                    ? toSku(nextName)
                    : current.baseSku;
                return { ...current, name: nextName, slug: autoSlug, baseSku: autoSku };
              })
            }
          />
        </div>

        <div className={FIELD_GRID}>
          <div className={FIELD_STACK}>
            <div className="flex items-center justify-between">
              <Label htmlFor="product-slug">Slug</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => handleBasicChange('slug', generateSlug(formData.name))}
              >
                Otomatik üret
              </button>
            </div>
            <Input
              id="product-slug"
              placeholder="pamuklu-basic-t-shirt"
              value={formData.slug}
              onChange={(event) => handleBasicChange('slug', generateSlug(event.target.value))}
            />
          </div>

          <div className={FIELD_STACK}>
            <div className="flex items-center justify-between">
              <Label htmlFor="product-sku">SKU</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => handleBasicChange('baseSku', toSku(formData.name))}
              >
                Otomatik üret
              </button>
            </div>
            <Input
              id="product-sku"
              placeholder="PAMUKLU_BASIC_T_SHIRT"
              value={formData.baseSku}
              onChange={(event) => handleBasicChange('baseSku', event.target.value.toUpperCase())}
            />
          </div>
        </div>
      </AdminFormPanel>

      {/* Fiyat & Stok & Durum */}
      <AdminFormPanel
        title="Fiyat, Stok ve Durum"
        description="Temel fiyat ve stok miktarı; ürünün yayın durumu."
        contentClassName="space-y-5"
      >
        <div className={FIELD_GRID}>
          <div className={FIELD_STACK}>
            <Label htmlFor="product-price">Temel Fiyat (₺)</Label>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.basePrice}
              onChange={(event) => handleBasicChange('basePrice', Number(event.target.value))}
            />
          </div>

          <div className={FIELD_STACK}>
            <Label htmlFor="product-stock">Temel Stok</Label>
            <Input
              id="product-stock"
              type="number"
              min="0"
              placeholder="0"
              value={formData.baseStock}
              onChange={(event) => handleBasicChange('baseStock', Number(event.target.value))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Yayın Durumu</p>
            <p className="text-xs text-muted-foreground">
              {formData.status === 'active'
                ? 'Ürün mağazada görünür.'
                : 'Ürün henüz yayınlanmadı.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn('text-sm', formData.status === 'active' ? 'text-emerald-600 font-medium' : 'text-muted-foreground')}>
              {formData.status === 'active' ? 'Aktif' : 'Pasif'}
            </span>
            <Switch
              id="product-status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) =>
                handleBasicChange('status', checked ? 'active' : 'draft')
              }
            />
          </div>
        </div>
      </AdminFormPanel>

      {/* Açıklamalar */}
      <AdminFormPanel
        title="Açıklamalar"
        description="Kısa açıklama liste sayfalarında, uzun açıklama ürün detayında görünür."
        contentClassName="space-y-5"
      >
        <div className={FIELD_STACK}>
          <Label htmlFor="product-short-description">Kısa Açıklama</Label>
          <Textarea
            id="product-short-description"
            placeholder="Ürünü kısaca tanımlayın (max. 160 karakter önerilir)"
            value={formData.shortDescription}
            onChange={(event) => handleBasicChange('shortDescription', event.target.value)}
            className="min-h-24"
          />
        </div>

        <div className={FIELD_STACK}>
          <Label htmlFor="product-description">Detaylı Açıklama</Label>
          <Textarea
            id="product-description"
            placeholder="Ürünün özellikleri, kullanım alanları ve diğer detayları..."
            value={formData.description}
            onChange={(event) => handleBasicChange('description', event.target.value)}
            className="min-h-40"
          />
        </div>
      </AdminFormPanel>

      {/* SEO */}
      <AdminFormPanel
        title="SEO"
        description="Arama motoru sonuçlarında görünecek başlık ve açıklama metni."
        contentClassName="space-y-5"
      >
        <div className={FIELD_STACK}>
          <Label htmlFor="seo-title">Sayfa Başlığı</Label>
          <Input
            id="seo-title"
            placeholder="ör. Pamuklu Basic T-Shirt | Marka Adı"
            value={formData.seoTitle}
            onChange={(event) => handleBasicChange('seoTitle', event.target.value)}
          />
        </div>

        <div className={FIELD_STACK}>
          <Label htmlFor="seo-description">Meta Açıklaması</Label>
          <Textarea
            id="seo-description"
            placeholder="Arama sonuçlarında görünecek kısa metin (max. 160 karakter)"
            value={formData.seoDescription}
            onChange={(event) => handleBasicChange('seoDescription', event.target.value)}
            className="min-h-24"
          />
        </div>
      </AdminFormPanel>

    </div>
  );

  const renderFieldsStep = () => (
    <div className="space-y-6">
      <AdminFormPanel
        title="Ürüne Özel Alanlar"
        description="Bu ürüne özgü ekstra bilgi alanları tanımlayın."
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormData((current) => ({
                ...current,
                productSpecificFields: [
                  ...current.productSpecificFields,
                  {
                    _reactKey: crypto.randomUUID(),
                    key: '',
                    label: '',
                    fieldType: 'input',
                    options: [],
                    required: false,
                    active: true,
                    isInteractive: false,
                    displayOrder: current.productSpecificFields.length,
                    value: '',
                  },
                ],
              }))
            }
          >
            <Plus className="size-4" /> Alan Ekle
          </Button>
        }
        contentClassName="space-y-4"
      >
        {formData.productSpecificFields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
            Henüz ürüne özel alan tanımlanmadı.
          </div>
        ) : (
          formData.productSpecificFields.map((field, index) => (
            <div key={field._reactKey ?? field.id ?? index} className="space-y-4 rounded-2xl border border-border/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-sm">Alan #{index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      productSpecificFields: current.productSpecificFields.filter((_, i) => i !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
                <div className={FIELD_STACK}>
                  <Label>Alan Etiketi</Label>
                  <Input
                    placeholder="ör. Malzeme"
                    value={field.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setFormData((current) => ({
                        ...current,
                        productSpecificFields: current.productSpecificFields.map((f, i) =>
                          i === index
                            ? {
                                ...f,
                                label,
                                key: !f.key || f.key === generateSlug(f.label).replace(/-/g, '_')
                                  ? generateSlug(label).replace(/-/g, '_')
                                  : f.key,
                              }
                            : f
                        ),
                      }));
                    }}
                  />
                </div>

                <div className={FIELD_STACK}>
                  <Label>Alan Tipi</Label>
                  <Select
                    value={field.fieldType}
                    onValueChange={(v) =>
                      setFormData((current) => ({
                        ...current,
                        productSpecificFields: current.productSpecificFields.map((f, i) =>
                          i === index
                            ? { ...f, fieldType: v as FieldType, value: v === 'checkbox' ? [] : '' }
                            : f
                        ),
                      }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {FIELD_TYPE_LABELS[field.fieldType] ?? field.fieldType}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="input">Metin</SelectItem>
                      <SelectItem value="select">Seçim Kutusu</SelectItem>
                      <SelectItem value="radio">Radyo</SelectItem>
                      <SelectItem value="checkbox">Çoklu Seçim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(field.fieldType === 'select' || field.fieldType === 'radio' || field.fieldType === 'checkbox') && (
                  <div className={cn(FIELD_STACK, 'md:col-span-3')}>
                    <Label>Seçenekler <span className="text-muted-foreground text-xs">(her satıra bir)</span></Label>
                    <Textarea
                      className="min-h-24"
                      placeholder="Kırmızı&#10;Mavi&#10;Yeşil"
                      value={rawFieldOptions[index] ?? field.options.join('\n')}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setRawFieldOptions((prev) => ({ ...prev, [index]: raw }));
                        setFormData((current) => ({
                          ...current,
                          productSpecificFields: current.productSpecificFields.map((f, i) =>
                            i === index
                              ? { ...f, options: parseFieldOptions(raw) }
                              : f
                          ),
                        }));
                      }}
                    />
                  </div>
                )}

                <div className={cn(FIELD_STACK, 'md:col-span-3')}>
                  <Label>
                    Değer
                    {field.required && <span className="ml-1 text-destructive">*</span>}
                  </Label>
                  {field.fieldType === 'input' && (
                    <Input
                      value={String(field.value)}
                      placeholder={field.label}
                      onChange={(e) =>
                        setFormData((current) => ({
                          ...current,
                          productSpecificFields: current.productSpecificFields.map((f, i) =>
                            i === index ? { ...f, value: e.target.value } as ProductSpecificFieldInput : f
                          ),
                        }))
                      }
                    />
                  )}
                  {field.fieldType === 'select' && (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) =>
                        setFormData((current) => ({
                          ...current,
                          productSpecificFields: current.productSpecificFields.map((f, i) =>
                            i === index ? { ...f, value: v } as ProductSpecificFieldInput : f
                          ),
                        }))
                      }
                    >
                      <SelectTrigger className="w-full"><SelectValue placeholder="Seçin…" /></SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.fieldType === 'radio' && (
                    <RadioGroup
                      value={String(field.value)}
                      onValueChange={(v) =>
                        setFormData((current) => ({
                          ...current,
                          productSpecificFields: current.productSpecificFields.map((f, i) =>
                            i === index ? { ...f, value: v } as ProductSpecificFieldInput : f
                          ),
                        }))
                      }
                      className="flex flex-wrap gap-4"
                    >
                      {field.options.map((opt) => (
                        <div key={opt} className="flex items-center gap-2">
                          <RadioGroupItem value={opt} id={`psf-${index}-${opt}`} />
                          <Label htmlFor={`psf-${index}-${opt}`}>{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  {field.fieldType === 'checkbox' && (
                    <div className="flex flex-wrap gap-4">
                      {field.options.map((opt) => {
                        const checked = Array.isArray(field.value) && field.value.includes(opt);
                        return (
                          <div key={opt} className="flex items-center gap-2">
                            <Checkbox
                              id={`psf-${index}-${opt}`}
                              checked={checked}
                              onCheckedChange={(checkedState) => {
                                const cur = Array.isArray(field.value) ? field.value : [];
                                const next = checkedState ? [...cur, opt] : cur.filter((v) => v !== opt);
                                setFormData((current) => ({
                                  ...current,
                                  productSpecificFields: current.productSpecificFields.map((f, i) =>
                                    i === index ? { ...f, value: next } as ProductSpecificFieldInput : f
                                  ),
                                }));
                              }}
                            />
                            <Label htmlFor={`psf-${index}-${opt}`}>{opt}</Label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', 'md:col-span-3')}>
                  <div className="flex items-center gap-3">
                    <Switch
                      id={`psf-interactive-${index}`}
                      checked={field.isInteractive ?? false}
                      onCheckedChange={(v) =>
                        setFormData((current) => ({
                          ...current,
                          productSpecificFields: current.productSpecificFields.map((f, i) =>
                            i === index ? { ...f, isInteractive: v } : f
                          ),
                        }))
                      }
                    />
                    <div>
                      <Label htmlFor={`psf-interactive-${index}`}>Müşteri seçebilir</Label>
                      <p className="text-xs text-muted-foreground">{field.isInteractive ? 'Müşteri ürün sayfasında seçim yapabilir' : 'Sadece bilgi olarak gösterilir'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id={`psf-required-${index}`}
                      checked={field.required}
                      onCheckedChange={(v) =>
                        setFormData((current) => ({
                          ...current,
                          productSpecificFields: current.productSpecificFields.map((f, i) =>
                            i === index ? { ...f, required: v } : f
                          ),
                        }))
                      }
                    />
                    <Label htmlFor={`psf-required-${index}`}>Zorunlu alan</Label>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </AdminFormPanel>
    </div>
  );

  const renderVariationsStep = () => (
    <div className="space-y-6">
      <AdminFormPanel
        title="Varyasyon grupları"
        description="Renk, beden gibi eksenleri ekleyin ve değer kümelerini tanımlayın."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {globalGroups.length > 0 && (
              <Select
                value=""
                onValueChange={(code) => {
                  const template = globalGroups.find((g) => g.code === code);
                  if (!template) return;
                  const alreadyExists = formData.variationGroups.some((g) => g.code === template.code);
                  if (alreadyExists) return;
                  setFormData((current) => ({
                    ...current,
                    variationGroups: [
                      ...current.variationGroups,
                      { ...template, sortOrder: current.variationGroups.length },
                    ],
                  }));
                }}
              >
                <SelectTrigger className="h-9 w-auto gap-2 text-sm">
                  <SelectValue placeholder="Şablondan Ekle" />
                </SelectTrigger>
                <SelectContent>
                  {globalGroups.map((g) => (
                    <SelectItem
                      key={g.code}
                      value={g.code}
                      disabled={formData.variationGroups.some((fg) => fg.code === g.code)}
                    >
                      {g.name}
                      {formData.variationGroups.some((fg) => fg.code === g.code) && (
                        <span className="ml-2 text-muted-foreground">✓</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData((current) => ({
                  ...current,
                  variationGroups: [
                    ...current.variationGroups,
                    { code: '', name: '', sortOrder: current.variationGroups.length, values: [] },
                  ],
                }))
              }
            >
              <Plus className="size-4" /> Grup Ekle
            </Button>
          </div>
        }
        contentClassName="space-y-4"
      >
        {formData.variationGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
            Henüz varyasyon grubu tanımlanmadı.
          </div>
        ) : (
          formData.variationGroups.map((group, index) => (
            <div key={index} className="space-y-5 rounded-2xl border border-border/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Grup #{index + 1}</p>
                  <p className="text-sm text-muted-foreground">Kod ve seçenek kümesini burada yönetin.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      variationGroups: current.variationGroups.filter((_, groupIndex) => groupIndex !== index),
                      variations: current.variations.filter((variation) => !(group.code in variation.attributes)),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className={FIELD_GRID}>
                <div className={FIELD_STACK}>
                  <Label>Grup Adı</Label>
                  <Input
                    value={group.name}
                    onChange={(event) =>
                      handleVariationGroupChange(index, {
                        name: event.target.value,
                        code:
                          !group.code || group.code === generateSlug(group.name).replace(/-/g, '_')
                            ? generateSlug(event.target.value).replace(/-/g, '_')
                            : group.code,
                      })
                    }
                  />
                </div>
                <div className={FIELD_STACK}>
                  <Label>Grup Kodu</Label>
                  <Input
                    value={group.code}
                    onChange={(event) =>
                      handleVariationGroupChange(index, {
                        code: generateSlug(event.target.value).replace(/-/g, '_'),
                      })
                    }
                  />
                </div>
                <div className={cn(FIELD_STACK, FULL_WIDTH_FIELD)}>
                  <Label>Grup Değerleri</Label>
                  <Textarea
                    value={rawGroupValues[index] ?? group.values.map((v) => v.label).join('\n')}
                    onChange={(event) => {
                      const raw = event.target.value;
                      setRawGroupValues((prev) => ({ ...prev, [index]: raw }));
                      handleVariationGroupChange(index, {
                        values: parseFieldOptions(raw).map((value, valueIndex) => ({
                          label: value,
                          value: generateSlug(value).replace(/-/g, '_'),
                          sortOrder: valueIndex,
                        })),
                      });
                    }}
                    className="min-h-28"
                    placeholder="Her satıra bir değer yazın"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </AdminFormPanel>

      <AdminFormPanel
        title="Varyasyon kayıtları"
        description="Kombinasyonları üretin, ardından varyasyon bazlı fiyat ve stokları düzenleyin."
        action={
          <Button type="button" variant="outline" onClick={handleGenerateVariations}>
            <WandSparkles className="size-4" /> Kombinasyonları Üret
          </Button>
        }
        contentClassName="space-y-4"
      >
        {formData.variations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
            Önce varyasyon gruplarını tanımlayıp kombinasyon oluşturun.
          </div>
        ) : (
          formData.variations.map((variation, index) => {
            const groupNameByCode = Object.fromEntries(
              formData.variationGroups.map((g) => [g.code, g.name])
            );
            return (
            <div key={variation.id} className="space-y-5 rounded-2xl border border-border/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(variation.attributes).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="gap-1.5 px-3 py-1 text-xs">
                      <span className="text-muted-foreground">{groupNameByCode[key] ?? key}</span>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="font-mono text-[11px] text-muted-foreground/70">{key}</span>
                      <span className="mx-0.5 text-muted-foreground/40">:</span>
                      <span className="font-semibold">{value}</span>
                    </Badge>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    setFormData((current) => ({
                      ...current,
                      variations: current.variations.filter((_, variationIndex) => variationIndex !== index),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div className={FIELD_STACK}>
                  <Label>SKU</Label>
                  <Input
                    value={variation.sku}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        variations: current.variations.map((item, variationIndex) =>
                          variationIndex === index ? { ...item, sku: event.target.value, updatedAt: new Date() } : item
                        ),
                      }))
                    }
                  />
                </div>
                <div className={FIELD_STACK}>
                  <Label>Fiyat</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={variation.price}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        variations: current.variations.map((item, variationIndex) =>
                          variationIndex === index ? { ...item, price: Number(event.target.value), updatedAt: new Date() } : item
                        ),
                      }))
                    }
                  />
                </div>
                <div className={FIELD_STACK}>
                  <Label>Stok</Label>
                  <Input
                    type="number"
                    min="0"
                    value={variation.stock}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        variations: current.variations.map((item, variationIndex) =>
                          variationIndex === index ? { ...item, stock: Number(event.target.value), updatedAt: new Date() } : item
                        ),
                      }))
                    }
                  />
                </div>
                <div className={cn(FIELD_STACK, 'justify-end')}>
                  <Label>Durum</Label>
                  <div className="flex h-10 items-center justify-between gap-3 rounded-xl border border-border/70 px-4">
                    <span className={cn('text-sm', variation.isActive ? 'font-medium text-emerald-600' : 'text-muted-foreground')}>
                      {variation.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                    <Switch
                      checked={variation.isActive}
                      onCheckedChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          variations: current.variations.map((item, variationIndex) =>
                            variationIndex === index ? { ...item, isActive: value, updatedAt: new Date() } : item
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            );
          })
        )}
      </AdminFormPanel>
    </div>
  );

  const renderMediaStep = () => (
    <div className="space-y-6">
      <AdminFormPanel
        title="Medya yönetimi"
        description="Kapak görselini, sıralamayı ve yeni dosya eklemelerini bu adımdan yönetin."
        contentClassName="space-y-6"
      >
        {formData.existingMedia.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {formData.existingMedia.map((media, index) => (
              <div
                key={media.id || media.url}
                className={cn('space-y-4 rounded-2xl border border-border/70 p-4', media.remove && 'opacity-55')}
              >
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  <Image src={media.url} alt={media.altText || formData.name} fill unoptimized className="object-cover" />
                </div>

                <div className="space-y-3">
                  <div className={FIELD_STACK}>
                    <Label>Alt Metin</Label>
                    <Input
                      value={media.altText}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          existingMedia: current.existingMedia.map((item, mediaIndex) =>
                            mediaIndex === index ? { ...item, altText: event.target.value } : item
                          ),
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className={cn(FIELD_STACK, 'w-28 shrink-0')}>
                      <Label>Sıra</Label>
                      <Input
                        type="number"
                        min="0"
                        value={media.sortOrder}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            existingMedia: current.existingMedia.map((item, mediaIndex) =>
                              mediaIndex === index ? { ...item, sortOrder: Number(event.target.value) } : item
                            ),
                          }))
                        }
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex h-10 items-center justify-between rounded-xl border border-border/70 px-4">
                        <span className={cn('text-sm', media.isPrimary && 'font-medium text-emerald-600')}>Kapak görsel</span>
                        <Switch checked={media.isPrimary} onCheckedChange={() => handlePrimaryMediaChange(index)} />
                      </div>
                      <div className={cn('flex h-10 items-center justify-between rounded-xl border px-4', media.remove ? 'border-destructive/40 bg-destructive/5' : 'border-border/70')}>
                        <span className={cn('text-sm', media.remove && 'font-medium text-destructive')}>Kaldır</span>
                        <Switch
                          checked={Boolean(media.remove)}
                          onCheckedChange={(value) =>
                            setFormData((current) => ({
                              ...current,
                              existingMedia: current.existingMedia.map((item, mediaIndex) =>
                                mediaIndex === index ? { ...item, remove: value } : item
                              ),
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
            Bu ürün için kayıtlı medya bulunmuyor.
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className={FIELD_STACK}>
            <Label htmlFor="new-images">Yeni Görseller</Label>
            <Input
              id="new-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                if (files.length === 0) return;
                setFormData((current) => ({ ...current, newImages: [...current.newImages, ...files] }));
                event.target.value = '';
              }}
            />
          </div>

          {formData.newImages.length > 0 ? (
            <div className="space-y-3">
              {formData.newImages.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <span className="truncate text-sm">{file.name} ({Math.round(file.size / 1024)} KB)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFormData((current) => ({
                        ...current,
                        newImages: current.newImages.filter((_, fileIndex) => fileIndex !== index),
                      }))
                    }
                  >
                    Kaldır
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </AdminFormPanel>

      <AdminFormPanel
        title="Son kontrol"
        description="Submit öncesi ürünün ana özetini gözden geçirin."
        contentClassName="space-y-5"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 p-5">
            <p className="text-sm font-medium text-muted-foreground">Katalog Özeti</p>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Ürün:</span> {formData.name || 'Henüz girilmedi'}</p>
              <p><span className="text-muted-foreground">Slug:</span> {formData.slug || generateSlug(formData.name) || '-'}</p>
              <p><span className="text-muted-foreground">Durum:</span> {formData.status}</p>
              <p><span className="text-muted-foreground">Baz Fiyat:</span> ₺{formData.basePrice.toFixed(2)}</p>
              <p><span className="text-muted-foreground">Baz Stok:</span> {formData.baseStock}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 p-5">
            <p className="text-sm font-medium text-muted-foreground">Yayın Hazırlığı</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{formData.variationGroups.length} varyasyon grubu</Badge>
              <Badge variant="outline">{formData.existingMedia.length + formData.newImages.length} medya</Badge>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Son adımdan sonra submit edildiğinde mevcut backend payload yapısı korunur.
            </p>
          </div>
        </div>
      </AdminFormPanel>
    </div>
  );

  return (
    <div className="space-y-6">
      {error ? (
        <AdminFormPanel
          title="Dikkat gerekli"
          description="Devam etmeden önce aşağıdaki uyarıyı çözün."
          className="border-destructive/30 bg-destructive/5"
          contentClassName="pt-0"
        >
          <p className="text-sm text-destructive">{error}</p>
        </AdminFormPanel>
      ) : null}

      <AdminFormPanel
        title={STEP_META[currentStep].title}
        description={STEP_META[currentStep].description}
        action={
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {visibleStepIndex + 1} / {STEP_ORDER.length}
          </span>
        }
        contentClassName="space-y-3"
      >
        <div className="grid gap-3 lg:grid-cols-5">
          {STEP_ORDER.map((step, index) => (
            <StepBadge
              key={step}
              index={index}
              step={step}
              active={currentStep === step}
              complete={index < visibleStepIndex}
              onSelect={() => {
                void goToStep(step);
              }}
            />
          ))}
        </div>
      </AdminFormPanel>

      {currentStep === 'basics' ? renderBasicsStep() : null}
      {currentStep === 'fields' ? renderFieldsStep() : null}
      {currentStep === 'variations' ? renderVariationsStep() : null}
      {currentStep === 'media' ? renderMediaStep() : null}

      <AdminFormFooter>
        <div className="flex flex-wrap gap-2">
          {summaryItems.map((item) => (
            <Badge key={item.label} variant="secondary">
              {item.label}: {item.value}
            </Badge>
          ))}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" onClick={handleBack} disabled={visibleStepIndex === 0 || isLoading}>
            <ChevronLeft className="size-4" />
            Geri
          </Button>
          {currentStep === 'media' ? (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Kaydediliyor
                </>
              ) : (
                <>{product ? 'Ürünü Güncelle' : 'Ürünü Oluştur'}</>
              )}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} disabled={isLoading}>
              İleri
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      </AdminFormFooter>
    </div>
  );
}




