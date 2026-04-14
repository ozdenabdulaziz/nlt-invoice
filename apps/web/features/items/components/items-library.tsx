"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBanner } from "@/components/shared/status-banner";
import { ItemFormModal } from "@/features/items/components/item-form-modal";
import { deleteItemAction } from "@/features/items/server/actions";
import type { ItemListItem } from "@/features/items/types";
import { Button, Card, CardContent } from "@nlt-invoice/ui";

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function ItemsLibrary({
  items,
  currency,
}: {
  items: ItemListItem[];
  currency: string;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ItemListItem | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [message, setMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <PageHeader
          eyebrow="Items"
          title="Items"
          description="Save products and services you invoice often so you can reuse them faster in invoices and estimates."
          className="max-w-3xl"
        />
        <Button
          className="rounded-full px-6"
          onClick={() => {
            setMessage(undefined);
            setSuccessMessage(undefined);
            setModalMode("create");
            setActiveItem(null);
            setIsModalOpen(true);
          }}
        >
          Add item
        </Button>
      </div>

      <StatusBanner message={message} />
      <StatusBanner message={successMessage} tone="success" />

      <Card className="border-border/70 bg-card/90">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {items.length} reusable {items.length === 1 ? "item" : "items"} ready
            </p>
            <p className="text-sm text-muted-foreground">
              Saved item defaults fill line item rows instantly without locking those rows.
            </p>
          </div>
        </CardContent>
      </Card>

      {items.length ? (
        <Card className="border-border/70 bg-card/90">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border/70 bg-background/70 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Item name</th>
                    <th className="px-6 py-4 font-medium">Description</th>
                    <th className="px-6 py-4 font-medium">Rate</th>
                    <th className="px-6 py-4 font-medium">Unit</th>
                    <th className="px-6 py-4 font-medium">Tax</th>
                    <th className="px-6 py-4 font-medium">Last updated</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isDeletingRow = isDeleting && deleteItemId === item.id;

                    return (
                      <tr key={item.id} className="border-b border-border/60 last:border-b-0">
                        <td className="px-6 py-4 align-top">
                          <div className="font-medium text-foreground">{item.name}</div>
                        </td>
                        <td className="max-w-sm px-6 py-4 align-top text-muted-foreground">
                          {item.description || "No default description"}
                        </td>
                        <td className="px-6 py-4 align-top text-muted-foreground">
                          {formatCurrency(item.defaultRate, currency)}
                        </td>
                        <td className="px-6 py-4 align-top text-muted-foreground">
                          {item.unitType}
                        </td>
                        <td className="px-6 py-4 align-top text-muted-foreground">
                          {item.defaultTaxRate}%
                        </td>
                        <td className="px-6 py-4 align-top text-muted-foreground">
                          {formatDate(item.updatedAt)}
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full px-4"
                              onClick={() => {
                                setMessage(undefined);
                                setSuccessMessage(undefined);
                                setModalMode("edit");
                                setActiveItem(item);
                                setIsModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              className="rounded-full px-4 text-destructive hover:text-destructive"
                              disabled={isDeletingRow}
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    `Delete "${item.name}"? Existing invoices and estimates will keep their copied snapshot values.`,
                                  )
                                ) {
                                  return;
                                }

                                setMessage(undefined);
                                setSuccessMessage(undefined);
                                setDeleteItemId(item.id);
                                startDeleteTransition(async () => {
                                  const result = await deleteItemAction(item.id);

                                  if (!result.success) {
                                    setMessage(result.message);
                                    setDeleteItemId(null);
                                    return;
                                  }

                                  setSuccessMessage(result.message);
                                  setDeleteItemId(null);
                                  router.refresh();
                                });
                              }}
                            >
                              {isDeletingRow ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/70 bg-card/90">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Create your first item
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground">
                Save your most common products or services once, then pull them into invoices and
                estimates in a couple of clicks.
              </p>
            </div>
            <div>
              <Button
                className="rounded-full px-6"
                onClick={() => {
                  setMessage(undefined);
                  setSuccessMessage(undefined);
                  setModalMode("create");
                  setActiveItem(null);
                  setIsModalOpen(true);
                }}
              >
                Create your first item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ItemFormModal
        open={isModalOpen}
        mode={modalMode}
        item={activeItem}
        onClose={() => {
          setIsModalOpen(false);
          setModalMode("create");
          setActiveItem(null);
        }}
        onSuccess={(nextMessage) => {
          setMessage(undefined);
          setSuccessMessage(nextMessage);
        }}
      />
    </div>
  );
}
