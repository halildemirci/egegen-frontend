'use client';

import { useEffect, useState } from 'react';
import { AdminFormPanel } from '@/components/admin/AdminFormPanel';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API_ROUTES, yonetimVaryasyonGrubuByIdRoute } from '@/lib/routes';
import { cn, generateId, generateSlug } from '@/lib/utils';
import { Plus, RefreshCw, Save, Trash2 } from 'lucide-react';

interface VariationValue {
  label: string;
  value: string;
  sortOrder: number;
}

interface VariationGroup {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  values: VariationValue[];
}

function parseGroupValues(raw: string): VariationValue[] {
  return raw
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label, index) => ({
      label,
      value: generateSlug(label).replace(/-/g, '_'),
      sortOrder: index,
    }));
}

function formatGroupValues(values: VariationValue[]): string {
  return values.map((v) => v.label).join('\n');
}

function createGroup(): VariationGroup {
  return { id: generateId(), name: '', code: '', sortOrder: 0, values: [] };
}

export default function VaryasyonlarPage() {
  const [groups, setGroups] = useState<VariationGroup[]>([]);
  const [savedGroupIds, setSavedGroupIds] = useState<Set<string>>(new Set());
  const [rawValues, setRawValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_ROUTES.yonetimVaryasyonGruplari, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error || 'Varyasyon grupları yüklenemedi.');
      }
      const data: VariationGroup[] = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.data)
          ? payload.data.data
          : Array.isArray(payload.data?.items)
            ? payload.data.items
            : [];
      setGroups(data);
      setSavedGroupIds(new Set(data.map((g) => g.id)));
      setRawValues({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const updateGroup = (id: string, patch: Partial<VariationGroup>) => {
    setGroups((current) =>
      current.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
    setSuccess(null);
  };

  const deleteGroup = async (group: VariationGroup) => {
    if (savedGroupIds.has(group.id)) {
      try {
        setSaving(true);
        setError(null);
        const response = await fetch(yonetimVaryasyonGrubuByIdRoute(group.id), { method: 'DELETE' });
        if (!response.ok && response.status !== 204) {
          const payload = await response.json();
          throw new Error(payload?.error || 'Grup silinemedi.');
        }
        await fetchGroups();
        setSuccess('Grup silindi.');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Silme sırasında hata oluştu.');
      } finally {
        setSaving(false);
      }
    } else {
      setGroups((current) => current.filter((g) => g.id !== group.id));
      setRawValues((prev) => {
        const next = { ...prev };
        delete next[group.id];
        return next;
      });
    }
  };

  const saveChanges = async () => {
    const invalid = groups.find((g) => !g.name.trim() || !g.code.trim());
    if (invalid) {
      setError('Her grubun adı ve kodu zorunludur.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const toCreate = groups.filter((g) => !savedGroupIds.has(g.id));
      const toUpdate = groups.filter((g) => savedGroupIds.has(g.id));

      for (const group of toCreate) {
        const response = await fetch(API_ROUTES.yonetimVaryasyonGruplari, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(group),
        });
        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Grup oluşturulamadı.');
        }
      }

      for (const group of toUpdate) {
        const response = await fetch(yonetimVaryasyonGrubuByIdRoute(group.id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(group),
        });
        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || 'Grup güncellenemedi.');
        }
      }

      await fetchGroups();
      setSuccess('Değişiklikler kaydedildi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme sırasında hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const hasUnsaved = groups.some((g) => !savedGroupIds.has(g.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Varyasyon Grupları</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Renk, beden gibi global varyasyon eksenlerini ve değer kümelerini yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchGroups} disabled={loading || saving}>
            <RefreshCw className="size-4" /> Yenile
          </Button>
          <Button onClick={saveChanges} disabled={!hasUnsaved || loading || saving}>
            <Save className="size-4" /> {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-300/40 bg-emerald-50/70 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          {success}
        </div>
      ) : null}

      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <AdminFormPanel
          title="Gruplar"
          description="Her grup bir varyasyon eksenini (ör. Renk, Beden) ve olası değerlerini tanımlar."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => setGroups((current) => [...current, createGroup()])}
            >
              <Plus className="size-4" /> Grup Ekle
            </Button>
          }
          contentClassName="space-y-4"
        >
          {groups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 py-10 text-center text-sm text-muted-foreground">
              Henüz varyasyon grubu tanımlanmamış.
            </div>
          ) : (
            groups.map((group, index) => {
              const isNew = !savedGroupIds.has(group.id);
              return (
                <div
                  key={group.id}
                  className={cn(
                    'space-y-4 rounded-2xl border p-5',
                    isNew ? 'border-primary/30 bg-primary/3' : 'border-border/70'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Grup #{index + 1}</p>
                      {isNew ? (
                        <Badge variant="outline" className="text-xs text-primary border-primary/40">
                          Yeni
                        </Badge>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteGroup(group)}
                      disabled={saving}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label>Grup Adı</Label>
                      <Input
                        placeholder="ör. Renk"
                        value={group.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          updateGroup(group.id, {
                            name,
                            code:
                              !group.code || group.code === generateSlug(group.name).replace(/-/g, '_')
                                ? generateSlug(name).replace(/-/g, '_')
                                : group.code,
                          });
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Grup Kodu</Label>
                      <Input
                        placeholder="ör. renk"
                        value={group.code}
                        onChange={(e) =>
                          updateGroup(group.id, {
                            code: generateSlug(e.target.value).replace(/-/g, '_'),
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <Label>Değerler</Label>
                      <Textarea
                        placeholder="Her satıra bir değer yazın&#10;ör. Kırmızı&#10;ör. Mavi"
                        className="min-h-28"
                        value={rawValues[group.id] ?? formatGroupValues(group.values)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setRawValues((prev) => ({ ...prev, [group.id]: raw }));
                          updateGroup(group.id, { values: parseGroupValues(raw) });
                        }}
                      />
                      {group.values.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {group.values.map((v) => (
                            <Badge key={v.value} variant="secondary" className="text-xs">
                              {v.label}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </AdminFormPanel>
      )}
    </div>
  );
}
