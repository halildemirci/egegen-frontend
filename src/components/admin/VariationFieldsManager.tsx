'use client';

import { useState } from 'react';
import type { DynamicFieldTemplate, FieldType } from '@/types';
import { AdminFormFooter, AdminFormPanel } from '@/components/admin/AdminFormPanel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { generateId, generateSlug } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface VariationFieldsManagerProps {
  fields: DynamicFieldTemplate[];
  onFieldsChange: (fields: DynamicFieldTemplate[]) => void;
  isLoading?: boolean;
}

const FIELD_TYPES: FieldType[] = ['input', 'select', 'checkbox', 'radio'];
const FIELD_STACK = 'flex flex-col gap-2';
const FIELD_GRID = 'grid gap-5 md:grid-cols-2';

function parseOptions(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function VariationFieldsManager({
  fields,
  onFieldsChange,
  isLoading = false,
}: VariationFieldsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    label: '',
    fieldType: 'input' as FieldType,
    optionsText: '',
    required: false,
    active: true,
    displayOrder: 0,
  });

  const resetForm = () => {
    setFormData({
      key: '',
      label: '',
      fieldType: 'input',
      optionsText: '',
      required: false,
      active: true,
      displayOrder: fields.length,
    });
    setEditingId(null);
    setError(null);
  };

  const openForm = (field?: DynamicFieldTemplate) => {
    if (field) {
      setFormData({
        key: field.key,
        label: field.label,
        
        fieldType: field.fieldType,
        optionsText: field.options.join('\n'),
        required: field.required,
        active: field.active,
        displayOrder: field.displayOrder,
      });
      setEditingId(field.id);
      setError(null);
      setShowForm(true);
      return;
    }

    resetForm();
    setShowForm(true);
  };

  const handleSave = () => {
    const key = formData.key || generateSlug(formData.label).replace(/-/g, '_');
    const options = parseOptions(formData.optionsText);

    if (!formData.label.trim()) {
      setError('Alan etiketi zorunludur.');
      return;
    }

    if (!key.trim()) {
      setError('Alan anahtarı zorunludur.');
      return;
    }


    if (formData.fieldType !== 'input' && options.length === 0) {
      setError('Bu alan tipi için en az bir seçenek gereklidir.');
      return;
    }


    const payload: DynamicFieldTemplate = {
      id: editingId || generateId(),
      key,
      name: formData.label,
      label: formData.label,
      fieldType: formData.fieldType,
      scopeType: 'global',
      options,
      required: formData.required,
      active: formData.active,
      displayOrder: formData.displayOrder,
      productType: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingId) {
      onFieldsChange(fields.map((field) => (field.id === editingId ? payload : field)));
    } else {
      onFieldsChange([...fields, payload]);
    }

    setShowForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <AdminFormPanel
          title={editingId ? 'Alan Şablonunu Düzenle' : 'Yeni Alan Şablonu Oluştur'}
          description="Alan kimliği, kapsamı, seçenekleri ve davranış ayarlarını tek panelden yönetin."
          action={
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Kapat
            </Button>
          }
          contentClassName="space-y-6"
        >
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className={FIELD_GRID}>
            <div className={FIELD_STACK}>
              <Label>Alan Etiketi</Label>
              <Input
                value={formData.label}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    label: event.target.value,
                    key:
                      !current.key || current.key === generateSlug(current.label).replace(/-/g, '_')
                        ? generateSlug(event.target.value).replace(/-/g, '_')
                        : current.key,
                  }))
                }
              />
            </div>

            <div className={FIELD_STACK}>
              <Label>Alan Anahtarı</Label>
              <Input
                value={formData.key}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    key: generateSlug(event.target.value).replace(/-/g, '_'),
                  }))
                }
              />
            </div>

            <div className={FIELD_STACK}>
              <Label>Alan Tipi</Label>
              <Select
                value={formData.fieldType}
                onValueChange={(value) => {
                  const nextFieldType = FIELD_TYPES.includes(value as FieldType)
                    ? (value as FieldType)
                    : 'input';

                  setFormData((current) => ({
                    ...current,
                    fieldType: nextFieldType,
                    optionsText: nextFieldType === 'input' ? '' : current.optionsText,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          {formData.fieldType !== 'input' ? (
            <div className={FIELD_STACK}>
              <Label>Seçenekler</Label>
              <Textarea
                value={formData.optionsText}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    optionsText: event.target.value,
                  }))
                }
                className="min-h-28"
                placeholder="Her satıra bir seçenek yazın"
              />
            </div>
          ) : null}

          <div className={FIELD_GRID}>
            <div className={FIELD_STACK}>
              <Label>Sıra</Label>
              <Input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    displayOrder: Number(event.target.value),
                  }))
                }
              />
            </div>

            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border/70 px-4 py-3 text-sm">
              <Checkbox
                checked={formData.required}
                onCheckedChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    required: Boolean(value),
                  }))
                }
              />
              <span>Zorunlu alan</span>
            </label>

            <label className="flex min-h-11 items-center gap-3 rounded-xl border border-border/70 px-4 py-3 text-sm md:col-span-2">
              <Checkbox
                checked={formData.active}
                onCheckedChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    active: Boolean(value),
                  }))
                }
              />
              <span>Aktif alan</span>
            </label>
          </div>

          <AdminFormFooter>
            <p className="text-sm text-muted-foreground">
              Kaydetmeden önce kapsam ve seçenekleri son kez gözden geçirin.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                İptal
              </Button>
              <Button type="button" onClick={handleSave} disabled={isLoading}>
                {editingId ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </AdminFormFooter>
        </AdminFormPanel>
      ) : null}

      {!showForm && fields.length > 0 ? (
        <AdminFormPanel
          title="Alan şablonları"
          description="Mevcut alan şablonlarını kapsam ve tipe göre gözden geçirin."
          contentClassName="p-0"
        >
          <table className="w-full">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kapsam</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tip</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Seçenekler</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {fields.map((field) => (
                <tr key={field.id} className="transition hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">{field.label}</p>
                      <p className="text-xs text-muted-foreground">{field.key}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm">
                    Global
                  </td>
                  <td className="px-5 py-3 text-sm">{field.fieldType}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {field.options.length > 0 ? field.options.join(', ') : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => openForm(field)}>
                        Düzenle
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onFieldsChange(fields.filter((item) => item.id !== field.id))}
                      >
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminFormPanel>
      ) : null}

      {!showForm ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => openForm()}>
          <Plus className="size-4" /> Yeni Alan Şablonu Oluştur
        </Button>
      ) : null}
    </div>
  );
}


