"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import type { SavedItemOption } from "@/features/items/types";
import { cn } from "@/lib/utils";
import { Button, Input } from "@nlt-invoice/ui";

type ItemSelectorProps = {
  savedItems: SavedItemOption[];
  selectedItemId?: string;
  currency?: string;
  onSelect: (item: SavedItemOption) => void;
  onClear: () => void;
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(value);
}

export function ItemSelector({
  savedItems,
  selectedItemId,
  currency = "CAD",
  onSelect,
  onClear,
}: ItemSelectorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedItem = savedItems.find((item) => item.id === selectedItemId);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return savedItems;
    }

    return savedItems.filter((item) => {
      const haystack = [
        item.name,
        item.description,
        item.unitType,
        item.defaultRate.toString(),
        item.defaultTaxRate.toString(),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [query, savedItems]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="outline"
        className="h-auto w-full justify-between rounded-2xl border-border/70 px-4 py-3 text-left"
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className="min-w-0 space-y-1">
          <div
            className={cn(
              "truncate text-sm font-medium",
              selectedItem ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selectedItem ? selectedItem.name : "Select saved item"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {selectedItem
              ? `${formatCurrency(selectedItem.defaultRate, currency)} / ${selectedItem.unitType} · ${selectedItem.defaultTaxRate}% tax`
              : savedItems.length
                ? "Search the library or keep this row custom."
                : "No saved items yet. You can still enter a custom row."}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-[0_30px_90px_-48px_rgba(15,23,42,0.55)]">
          <div className="border-b border-border/70 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search saved items"
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            <button
              type="button"
              className="flex w-full items-start justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-muted/55"
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
            >
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground">Use custom item</div>
                <div className="text-xs text-muted-foreground">
                  Keep the current row editable without pulling new defaults from the library.
                </div>
              </div>
            </button>

            {filteredItems.length ? (
              filteredItems.map((item) => {
                const isSelected = item.id === selectedItemId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-start justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-muted/55"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {item.description || "No default description"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(item.defaultRate, currency)} / {item.unitType} ·{" "}
                        {item.defaultTaxRate}% tax
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-5 text-sm text-muted-foreground">
                No saved items match your search.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
