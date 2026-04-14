"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { StatusBanner } from "@/components/shared/status-banner";
import {
  getEmptyItemFormValues,
  mapItemToFormValues,
} from "@/features/items/form-values";
import {
  createItemAction,
  updateItemAction,
} from "@/features/items/server/actions";
import type { ItemListItem } from "@/features/items/types";
import { itemSchema, type ItemFormInput } from "@/lib/validations/item";
import { Button, Input, Label, Textarea } from "@nlt-invoice/ui";

type ItemFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  item?: ItemListItem | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

function toRequiredNumber(value: string) {
  return value === "" ? Number.NaN : Number(value);
}

export function ItemFormModal({
  open,
  mode,
  item,
  onClose,
  onSuccess,
}: ItemFormModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ItemFormInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: getEmptyItemFormValues(),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setMessage(undefined);
    form.reset(item ? mapItemToFormValues(item) : getEmptyItemFormValues());
  }, [form, item, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPending, onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        onClick={() => {
          if (!isPending) {
            onClose();
          }
        }}
      />
      <div
        aria-modal="true"
        role="dialog"
        className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_44px_120px_-55px_rgba(15,23,42,0.7)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary/80">
              {mode === "create" ? "Add item" : "Edit item"}
            </p>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {mode === "create" ? "Save a reusable item" : "Update saved item"}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Saved items prefill invoice and estimate rows, but every document row stays fully
                editable after selection.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close item form"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition hover:text-foreground"
            disabled={isPending}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-6 px-6 py-6"
          onSubmit={form.handleSubmit((values) =>
            startTransition(async () => {
              setMessage(undefined);

              const result =
                mode === "create"
                  ? await createItemAction(values)
                  : await updateItemAction(item?.id ?? "", values);

              if (!result.success) {
                setMessage(result.message);

                if (result.fieldErrors) {
                  Object.entries(result.fieldErrors).forEach(([fieldName, errors]) => {
                    if (!errors?.length) {
                      return;
                    }

                    form.setError(fieldName as keyof ItemFormInput, {
                      type: "server",
                      message: errors[0],
                    });
                  });
                }

                return;
              }

              onSuccess(result.message);
              onClose();
              router.refresh();
            }),
          )}
        >
          <StatusBanner message={message} />

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="item-name">Item name</Label>
              <Input id="item-name" placeholder="Monthly bookkeeping" {...form.register("name")} />
              <p className="text-sm text-destructive">{form.formState.errors.name?.message}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder="Add short details customers usually need to see."
                rows={4}
                {...form.register("description")}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.description?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-default-rate">Default rate</Label>
              <Input
                id="item-default-rate"
                type="number"
                step="0.01"
                placeholder="0"
                {...form.register("defaultRate", {
                  setValueAs: toRequiredNumber,
                })}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.defaultRate?.message}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-unit-type">Unit type</Label>
              <Input
                id="item-unit-type"
                placeholder="each"
                {...form.register("unitType")}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.unitType?.message}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="item-default-tax-rate">Default tax rate (%)</Label>
              <Input
                id="item-default-tax-rate"
                type="number"
                step="0.01"
                placeholder="0"
                {...form.register("defaultTaxRate", {
                  setValueAs: toRequiredNumber,
                })}
              />
              <p className="text-sm text-destructive">
                {form.formState.errors.defaultTaxRate?.message}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-full px-6" disabled={isPending}>
              {isPending
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : mode === "create"
                  ? "Save item"
                  : "Update item"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-6"
              disabled={isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
