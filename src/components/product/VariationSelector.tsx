'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Variation, VariationGroup } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VariationSelectorProps {
  variations: Variation[];
  variationGroups: VariationGroup[];
  onVariationSelect: (variation: Variation | null) => void;
  initialVariation?: Variation;
}

function buildFallbackGroups(variations: Variation[]): VariationGroup[] {
  const keys = Array.from(new Set(variations.flatMap((variation) => Object.keys(variation.attributes))));

  return keys.map((key, index) => ({
    code: key,
    name: `${key.charAt(0).toUpperCase()}${key.slice(1)}`,
    sortOrder: index,
    values: Array.from(
      new Set(variations.map((variation) => variation.attributes[key]).filter(Boolean))
    ).map((value, valueIndex) => ({
      label: value,
      value,
      sortOrder: valueIndex,
    })),
  }));
}

export function VariationSelector({
  variations,
  variationGroups,
  onVariationSelect,
  initialVariation,
}: VariationSelectorProps) {
  const groups = useMemo(
    () =>
      (variationGroups.length > 0 ? variationGroups : buildFallbackGroups(variations)).sort(
        (left, right) => left.sortOrder - right.sortOrder
      ),
    [variationGroups, variations]
  );

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const baseVariation = initialVariation || variations[0];
    const nextState: Record<string, string> = {};

    groups.forEach((group) => {
      nextState[group.code] = baseVariation?.attributes[group.code] || '';
    });

    return nextState;
  });

  const selectedVariation = useMemo(
    () =>
      variations.find((variation) =>
        groups.every((group) => variation.attributes[group.code] === selectedAttributes[group.code])
      ) || null,
    [groups, selectedAttributes, variations]
  );

  useEffect(() => {
    onVariationSelect(selectedVariation);
  }, [onVariationSelect, selectedVariation]);

  if (groups.length === 0 || variations.length === 0) {
    return null;
  }

  const isOptionAvailable = (groupCode: string, optionValue: string) => {
    return variations.some((variation) => {
      if (variation.attributes[groupCode] !== optionValue) {
        return false;
      }

      return groups.every((group) => {
        if (group.code === groupCode) {
          return true;
        }

        const selectedValue = selectedAttributes[group.code];
        return !selectedValue || variation.attributes[group.code] === selectedValue;
      });
    });
  };

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.code}>
          <p className="mb-2 text-sm font-medium">{group.name}</p>
          <div className="flex flex-wrap gap-2">
            {group.values.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={selectedAttributes[group.code] === option.value ? 'default' : 'outline'}
                size="sm"
                disabled={!isOptionAvailable(group.code, option.value)}
                onClick={() =>
                  setSelectedAttributes((current) => ({
                    ...current,
                    [group.code]: option.value,
                  }))
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      ))}

      <Card>
        <CardContent className="grid grid-cols-2 gap-4 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Fiyat</p>
            <p className="text-2xl font-semibold">
              ₺{selectedVariation ? selectedVariation.price.toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Stok Durumu</p>
            <p
              className={
                selectedVariation && selectedVariation.stock > 0
                  ? 'text-2xl font-semibold text-emerald-600'
                  : 'text-2xl font-semibold text-destructive'
              }
            >
              {selectedVariation && selectedVariation.stock > 0
                ? `${selectedVariation.stock} Adet`
                : 'Tükendi'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Badge variant="outline" className="font-mono text-xs">
        SKU: {selectedVariation?.sku || 'Seçim bekleniyor'}
      </Badge>
    </div>
  );
}
