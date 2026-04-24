"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  X,
  Settings,
  PencilLine,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Assumed imports based on the project structure
import { createEstimateAction } from "@/features/estimates/server/actions";
import type { EstimateCustomerOption, PublicEstimateRecord } from "@/features/estimates/server/queries";
import type { SavedItemOption } from "@/features/items/types";
import { PublicEstimatePrintDocument } from "@/features/estimates/components/public-estimate-print-document";

// UI Components
import { Button, Input, Label, Textarea } from "@nlt-invoice/ui";

const modernEstimateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  estimateNumber: z.number().min(1, "Estimate # is required"),
  
  issueDate: z.string(),
  expiryDate: z.string(),
  currency: z.string(),
  items: z.array(
    z.object({
      savedItemId: z.string().optional(),
      name: z.string().min(1, "Item name is required"),
      description: z.string().optional(),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      unit: z.string().optional(),
      unitPrice: z.number().min(0, "Price must be 0 or greater"),
    })
  ).min(1, "At least one item is required"),
  discountType: z.enum(["percent", "amount"]).nullable(),
  discountValue: z.number().optional(),
  discountDescription: z.string().optional(),
  notes: z.string().optional(),
});

type ModernEstimateFormInput = z.infer<typeof modernEstimateSchema>;

type SettingsMock = {
  logo: string | null;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  paymentInstructions: string;
  defaultCurrency: string;
};

type Props = {
  customers: EstimateCustomerOption[];
  recentCustomers: EstimateCustomerOption[];
  savedItems: SavedItemOption[];
  defaultValues?: Partial<ModernEstimateFormInput>;
  settings: SettingsMock;
  nextEstimateNumber: number;
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(date: Date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

const COMMON_UNITS = [
  "hrs",
  "pcs",
  "days",
  "svc",
  "kg",
  "month",
];

// Click outside hook
function useOnClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function ModernEstimateForm({
  customers,
  recentCustomers,
  savedItems,
  defaultValues,
  settings,
  nextEstimateNumber,
}: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Business Details Card Toggle
  const [isBusinessDetailsOpen, setIsBusinessDetailsOpen] = useState(false);

  // Dropdown states
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [activeItemDropdown, setActiveItemDropdown] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const itemDropdownRef = useRef<HTMLDivElement>(null);
  const [activeUnitDropdown, setActiveUnitDropdown] = useState<number | null>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(customerDropdownRef, () => setIsCustomerDropdownOpen(false));
  useOnClickOutside(itemDropdownRef, () => setActiveItemDropdown(null));
  useOnClickOutside(unitDropdownRef, () => setActiveUnitDropdown(null));

  // Form setup
  const form = useForm<ModernEstimateFormInput>({
    resolver: zodResolver(modernEstimateSchema),
    defaultValues: {
      title: "Estimate",
      summary: "",
      customerId: "",
      estimateNumber: nextEstimateNumber,
      
      issueDate: formatDate(new Date()),
      expiryDate: formatDate(new Date()),
      currency: "CAD",
      items: [{ name: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0 }],
      discountType: null,
      discountValue: 0,
      discountDescription: "",
      notes: "",
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watched values for calculations and UI
  const watchedItems = useWatch({ control: form.control, name: "items" }) || [];
  const watchedCurrency = useWatch({ control: form.control, name: "currency" }) || "CAD";
  const watchedCustomerId = useWatch({ control: form.control, name: "customerId" });
  const watchedDueDate = useWatch({ control: form.control, name: "expiryDate" });
  const watchedDiscountType = useWatch({ control: form.control, name: "discountType" });
  const watchedDiscountValue = useWatch({ control: form.control, name: "discountValue" });

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === watchedCustomerId),
    [customers, watchedCustomerId]
  );

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return recentCustomers;
    const lower = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email?.toLowerCase().includes(lower) ||
        c.companyName?.toLowerCase().includes(lower) ||
        c.phone?.toLowerCase().includes(lower)
    );
  }, [customers, recentCustomers, customerSearch]);

  const filteredItems = useMemo(() => {
    if (!itemSearch) return savedItems;
    const lower = itemSearch.toLowerCase();
    return savedItems.filter(
      (i) =>
        i.name.toLowerCase().includes(lower) ||
        i.description?.toLowerCase().includes(lower)
    );
  }, [savedItems, itemSearch]);

  // Calculations
  const subtotal = useMemo(() => {
    return watchedItems.reduce((acc, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return acc + q * p;
    }, 0);
  }, [watchedItems]);

  const discountAmount = useMemo(() => {
    if (!watchedDiscountType) return 0;
    const v = Number(watchedDiscountValue) || 0;
    return watchedDiscountType === "percent" ? subtotal * (v / 100) : v;
  }, [subtotal, watchedDiscountType, watchedDiscountValue]);

  const amountDue = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // Due Date Pills Logic
  const setDueDatePill = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    form.setValue("expiryDate", formatDate(date), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const getActivePill = () => {
    const today = formatDate(new Date());
    const d7 = formatDate(new Date(Date.now() + 7 * 86400000));
    const d15 = formatDate(new Date(Date.now() + 15 * 86400000));
    const d30 = formatDate(new Date(Date.now() + 30 * 86400000));

    if (watchedDueDate === today) return 0;
    if (watchedDueDate === d7) return 7;
    if (watchedDueDate === d15) return 15;
    return null;
  };

  const activePill = getActivePill();

  // Submission
  const onSubmit = async (values: ModernEstimateFormInput) => {
    setIsPending(true);
    try {
      // Map back to the expected schema format for the server action if necessary.
      // Assuming createEstimateAction works with standard values. We map custom fields to it.
      const payload = {
        customerId: values.customerId,
        issueDate: values.issueDate,
        expiryDate: values.expiryDate,
        status: "DRAFT", // Or SENT based on user action
        currency: values.currency,
        items: values.items.map((i) => ({
          savedItemId: i.savedItemId,
          name: i.name,
          description: i.description || "",
          quantity: i.quantity,
          unitType: "each",
          unitPrice: i.unitPrice,
          taxRate: 0, // Ignoring tax for this custom build as it wasn't specified
        })),
        notes: values.notes,
        terms: "",
        discountType: values.discountType === "percent" ? "PERCENTAGE" : values.discountType === "amount" ? "FIXED" : null,
        discountValue: values.discountValue,
        amountPaid: 0,
      };

      // @ts-ignore - bypassing strict type for mock submission
      const result = await createEstimateAction(payload);
      if (result?.success) {
        router.push("/dashboard/estimates");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  const safeDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const getPreviewEstimate = (): PublicEstimateRecord => {
    const values = form.getValues();
    
    return {
      id: "preview",
      publicId: "preview",
      companyId: "preview",
      customerId: values.customerId,
      companyName: settings.businessName || "Your Company",
      companyEmail: settings.businessEmail || null,
      companyPhone: settings.businessPhone || null,
      companyWebsite: null,
      companyTaxNumber: null,
      companyAddressLine1: settings.businessAddress || null,
      companyAddressLine2: null,
      companyCity: null,
      companyProvince: null,
      companyPostalCode: null,
      companyCountry: null,
      customerName: selectedCustomer?.name || "Customer Name",
      customerCompanyName: selectedCustomer?.companyName || null,
      customerEmail: selectedCustomer?.email || null,
      customerPhone: selectedCustomer?.phone || null,
      customerBillingAddressLine1: selectedCustomer?.billingAddressLine1 || null,
      customerBillingAddressLine2: selectedCustomer?.billingAddressLine2 || null,
      customerBillingCity: selectedCustomer?.billingCity || null,
      customerBillingProvince: selectedCustomer?.billingProvince || null,
      customerBillingPostalCode: selectedCustomer?.billingPostalCode || null,
      customerBillingCountry: selectedCustomer?.billingCountry || null,
      customerShippingSameAsBilling: true,
      customerShippingAddressLine1: null,
      customerShippingAddressLine2: null,
      customerShippingCity: null,
      customerShippingProvince: null,
      customerShippingPostalCode: null,
      customerShippingCountry: null,
      status: "DRAFT",
      currency: values.currency,
      estimateNumber: String(values.estimateNumber),
      
      issueDate: safeDate(values.issueDate),
      expiryDate: safeDate(values.expiryDate),
      subtotal: subtotal,
      discountType: values.discountType === "percent" ? "PERCENTAGE" : values.discountType === "amount" ? "FIXED" : null,
      discountValue: values.discountValue || null,
      discountTotal: discountAmount,
      taxType: null,
      taxRate: null,
      taxTotal: 0,
      total: amountDue,
      amountPaid: 0,
      balanceDue: amountDue,
      notes: values.notes || null,
      terms: null,
      paymentMethod: null,
      paymentNote: null,
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewedAt: null,
      sentAt: null,
      estimateId: null,
      estimate: null,
      items: values.items.map((i, index) => ({
        id: `preview-item-${index}`,
        estimateId: "preview",
        savedItemId: i.savedItemId || null,
        name: i.name || "Item name",
        description: i.description || null,
        quantity: i.quantity || 1,
        unitType: i.unit || "pcs",
        unitPrice: i.unitPrice || 0,
        taxRate: 0,
        lineTotal: (i.quantity || 1) * (i.unitPrice || 0),
        sortOrder: index,
      })),
    } as unknown as PublicEstimateRecord;
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="font-sans text-[14px] text-slate-900 bg-[#F9FAFB] min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between shadow-sm transition-all">
        <div className="max-w-[1024px] w-full mx-auto flex items-center justify-between">
          <h1 className="text-[20px] font-medium tracking-tight">New Estimate</h1>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewOpen(true)}
              className="rounded-lg h-9 px-4 border-[#E5E7EB] text-slate-700 hover:bg-slate-50 font-medium transition-all duration-150"
            >
              Preview
            </Button>
            <div className="flex">
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-l-lg rounded-r-none h-9 px-4 bg-[#1A56DB] hover:bg-[#1e4eb5] text-white font-medium transition-all duration-150"
              >
                {isPending ? "Saving..." : "Save and continue"}
              </Button>
              <Button
                type="button"
                className="rounded-r-lg rounded-l-none border-l border-white/20 h-9 px-2 bg-[#1A56DB] hover:bg-[#1e4eb5] text-white transition-all duration-150"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1024px] mx-auto px-4 pt-6 pb-20 space-y-[12px]">
        {/* Section 1 — Business details card */}
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-150">
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50"
            onClick={() => setIsBusinessDetailsOpen(!isBusinessDetailsOpen)}
          >
            <span className="text-[13px] font-medium text-slate-500 uppercase tracking-wide">Business Details</span>
            {isBusinessDetailsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>

          {isBusinessDetailsOpen && (
            <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-8 items-start">
              <div className="flex flex-col items-center sm:items-start gap-3 shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border border-[#E5E7EB] bg-slate-50 shadow-inner">
                  {settings.logo ? (
                    <img src={settings.logo} alt="Business logo" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400 font-medium bg-slate-50">
                      No Logo
                    </div>
                  )}
                </div>
                <Link href="/dashboard/settings" className="text-[11px] text-slate-400 hover:text-[#1A56DB] transition-colors font-medium">
                  Manage in Settings
                </Link>
              </div>

              <div className="flex-1 w-full flex flex-col sm:items-end gap-3">
                <div className="w-full sm:max-w-[400px]">
                  <input
                    type="text"
                    {...form.register("title")}
                    className="w-full sm:text-right text-[24px] font-semibold text-slate-900 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[8px] px-3 py-1 transition-all duration-150 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Summary (e.g. project name or description of estimate)"
                    {...form.register("summary")}
                    className="w-full sm:text-right text-[13px] text-slate-600 placeholder-slate-400 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[8px] px-3 py-1.5 transition-all duration-150 outline-none"
                  />
                </div>

                <div className="text-[13px] text-slate-500 sm:text-right flex flex-col gap-0.5 mt-2">
                  <div className="font-semibold text-slate-800 text-[14px] mb-0.5">{settings.businessName}</div>
                  <div className="whitespace-pre-line leading-relaxed">{settings.businessAddress}</div>
                  {settings.businessPhone && <div>{settings.businessPhone}</div>}
                  {settings.businessEmail && <div className="text-[#1A56DB]">{settings.businessEmail}</div>}
                </div>

                <Link href="/dashboard/settings" className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-slate-400 hover:text-[#1A56DB] transition-colors group">
                  <PencilLine className="w-3.5 h-3.5" />
                  <span>Edit business details</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 2 — Customer + estimate meta card */}
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left column — Customer selector */}
            <div className="relative" ref={customerDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                className={`w-full min-h-[130px] rounded-[10px] border transition-all duration-150 flex flex-col p-5 text-left outline-none ${isCustomerDropdownOpen ? "border-[#1A56DB] ring-[3px] ring-[#1A56DB]/15" : "border-[#E5E7EB] hover:border-slate-300"
                  } ${!selectedCustomer ? "items-center justify-center" : "items-start justify-between"}`}
              >
                {!selectedCustomer ? (
                  <div className="flex items-center gap-2 text-[#1A56DB] font-medium text-[14px]">
                    <div className="w-6 h-6 rounded-full bg-[#1A56DB]/10 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    Add a customer
                  </div>
                ) : (
                  <div className="w-full flex flex-col h-full text-[13px]">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">BILL TO</span>
                    <span className="text-[15px] font-bold text-slate-900">{selectedCustomer.name}</span>
                    {selectedCustomer.companyName && (
                      <span className="text-slate-600 font-medium">{selectedCustomer.companyName}</span>
                    )}

                    <div className="mt-2 text-slate-500 flex flex-col gap-0.5">
                      <div className="whitespace-pre-line leading-snug">
                        {[
                          selectedCustomer.billingAddressLine1,
                          selectedCustomer.billingAddressLine2,
                          [selectedCustomer.billingCity, selectedCustomer.billingProvince, selectedCustomer.billingPostalCode].filter(Boolean).join(", "),
                          selectedCustomer.billingCountry,
                        ].filter(Boolean).join("\n")}
                      </div>

                      {!selectedCustomer.shippingSameAsBilling && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">SHIP TO</span>
                          <div className="whitespace-pre-line leading-snug">
                            {[
                              selectedCustomer.shippingAddressLine1,
                              selectedCustomer.shippingAddressLine2,
                              [selectedCustomer.shippingCity, selectedCustomer.shippingProvince, selectedCustomer.shippingPostalCode].filter(Boolean).join(", "),
                              selectedCustomer.shippingCountry,
                            ].filter(Boolean).join("\n")}
                          </div>
                        </div>
                      )}

                      <div className="mt-2 space-y-0.5">
                        {selectedCustomer.email && <div>{selectedCustomer.email}</div>}
                        {selectedCustomer.phone && <div>{selectedCustomer.phone}</div>}
                      </div>
                    </div>

                    <div className="mt-auto pt-4 flex justify-end w-full">
                      <span className="text-[12px] text-[#1A56DB] font-medium hover:underline">Change</span>
                    </div>
                  </div>
                )}
              </button>

              {/* Customer Dropdown */}
              {isCustomerDropdownOpen && (
                <div className="absolute top-0 left-0 w-full bg-white rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#1A56DB] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 min-h-[130px] flex flex-col">
                  <div className="p-2 border-b border-[#E5E7EB]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-50 border border-transparent focus:bg-white focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[8px] outline-none transition-all duration-150"
                        autoFocus
                      />
                    </div>
                  </div>
                  {!customerSearch && recentCustomers.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#E5E7EB]">
                      Recent Customers
                    </div>
                  )}
                  <div className="max-h-[300px] overflow-y-auto py-1 flex-1">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-4 py-3 text-[13px] text-slate-500 text-center">No customers found.</div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            form.setValue("customerId", c.id, { shouldValidate: true });
                            setIsCustomerDropdownOpen(false);
                            setCustomerSearch("");
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center text-[11px] font-medium shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[13px] font-bold text-slate-900 truncate">{c.name}</span>
                            <span className="text-[12px] text-slate-600 truncate font-medium">
                              {c.companyName}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate">
                              {c.email} {c.phone ? `• ${c.phone}` : ""}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-[#E5E7EB] bg-slate-50 sticky bottom-0">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start text-[13px] text-[#1A56DB] font-medium hover:bg-[#1A56DB]/5 h-9"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add new customer
                    </Button>
                  </div>
                </div>
              )}
              {form.formState.errors.customerId && (
                <p className="text-red-500 text-[12px] mt-1 ml-1">{form.formState.errors.customerId.message}</p>
              )}
            </div>

            {/* Right column — Estimate fields */}
            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Estimate #",
                  name: "estimateNumber",
                  type: "number",
                },
                
                {
                  label: "Estimate date",
                  name: "issueDate",
                  type: "date",
                  placeholder: "",
                },
              ].map((field) => (
                <div key={field.name} className="flex items-center">
                  <Label className="text-[13px] text-slate-500 font-normal min-w-[110px] shrink-0">
                    {field.label}
                  </Label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    {...form.register(field.name as any, { valueAsNumber: field.type === "number" })}
                    className="w-[160px] text-[13px] border border-[#E5E7EB] rounded-[8px] px-3 py-1.5 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 outline-none transition-all duration-150"
                  />
                </div>
              ))}

              <div className="flex items-center">
                <Label className="text-[13px] text-slate-500 font-normal min-w-[110px] shrink-0">
                  Currency
                </Label>
                <div className="relative">
                  <select
                    {...form.register("currency")}
                    className="w-[160px] text-[13px] bg-white border border-[#E5E7EB] rounded-[8px] pl-3 pr-8 py-1.5 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 outline-none appearance-none transition-all duration-150 cursor-pointer"
                  >
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-start">
                <Label className="text-[13px] text-slate-500 font-normal min-w-[110px] shrink-0 mt-2">
                  Valid until
                </Label>
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    {...form.register("expiryDate")}
                    className="w-[160px] text-[13px] border border-[#E5E7EB] rounded-[8px] px-3 py-1.5 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 outline-none transition-all duration-150"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "On receipt", days: 0 },
                      { label: "7 days", days: 7 },
                      { label: "15 days", days: 15 },
                    ].map((pill) => (
                      <button
                        key={pill.days}
                        type="button"
                        onClick={() => setDueDatePill(pill.days)}
                        className={`text-[11px] px-2.5 py-1 rounded-full transition-colors duration-150 border ${activePill === pill.days
                            ? "bg-[#1A56DB]/10 text-[#1A56DB] border-[#1A56DB]/20 font-medium"
                            : "bg-white text-slate-500 border-[#E5E7EB] hover:bg-slate-50"
                          }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 & 4 — Line items & Totals card */}
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">

          <div className="p-5 md:p-6">
            {/* Toolbar row */}
            <div className="flex justify-end mb-4">
              <button type="button" className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-900 transition-colors">
                <Settings className="w-3.5 h-3.5" />
                Edit columns
              </button>
            </div>

            {/* Table */}
            <div className="w-full mb-2">
              <div className="flex text-[11px] text-slate-400 uppercase tracking-widest font-bold pb-3 border-b border-slate-100 px-4">
                <div className="w-[50%]">Item Description</div>
                <div className="w-[15%] text-center">Qty / Unit</div>
                <div className="w-[17%] text-right">Unit Price</div>
                <div className="w-[18%] text-right">Amount</div>
              </div>

              {fields.map((field, index) => {
                const itemQty = watchedItems[index]?.quantity || 0;
                const itemPrice = watchedItems[index]?.unitPrice || 0;
                const itemAmount = itemQty * itemPrice;

                return (
                  <div key={field.id} className="group flex items-start py-5 px-4 relative transition-all duration-200 hover:bg-slate-50/50 rounded-xl">
                    {/* Item Details */}
                    <div className="w-[50%] pr-4 relative" ref={activeItemDropdown === index ? itemDropdownRef : null}>
                      <div className="flex flex-row items-start gap-2">
                        <input
                          {...form.register(`items.${index}.name`)}
                          placeholder="Item name (e.g. Logo Design)"
                          onFocus={() => setActiveItemDropdown(index)}
                          className="flex-1 min-w-[40%] text-[14px] font-bold text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[8px] px-2 py-1.5 transition-all outline-none placeholder-slate-300"
                        />
                        <textarea
                          {...form.register(`items.${index}.description`)}
                          placeholder="Add more details..."
                          rows={1}
                          className="flex-1 text-[12px] text-slate-500 bg-transparent border border-transparent hover:border-slate-200 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[8px] px-2 py-1.5 transition-all outline-none resize-none overflow-hidden min-h-[1.5em] placeholder-slate-300"
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                          }}
                        />
                      </div>

                      {/* Item Dropdown */}
                      {activeItemDropdown === index && (
                        <div 
                          className="absolute top-[100%] left-0 w-[300px] bg-white rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.10)] border border-[#E5E7EB] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 mt-1"
                        >
                          <div className="p-2 border-b border-[#E5E7EB]">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search saved items..."
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-[13px] bg-slate-50 border border-transparent focus:bg-white focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[8px] outline-none transition-all duration-150"
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="max-h-[240px] overflow-y-auto py-1">
                            {filteredItems.length === 0 ? (
                              <div className="px-4 py-3 text-[13px] text-slate-500 text-center">No items found.</div>
                            ) : (
                              filteredItems.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    form.setValue(`items.${index}.name`, item.name);
                                    form.setValue(`items.${index}.description`, item.description || "");
                                    form.setValue(`items.${index}.unitPrice`, Number(item.defaultRate));
                                    if (item.unitType) {
                                      form.setValue(`items.${index}.unit`, item.unitType);
                                    }
                                    setActiveItemDropdown(null);
                                    setItemSearch("");
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex flex-col gap-0.5 border-b last:border-0 border-[#F3F4F6] transition-colors"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className="text-[13px] font-medium text-slate-900">{item.name}</span>
                                    <span className="text-[13px] font-bold text-slate-900">{formatCurrency(Number(item.defaultRate), watchedCurrency)}</span>
                                  </div>
                                  {item.description && (
                                    <span className="text-[12px] text-slate-500 line-clamp-1">{item.description}</span>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                          <div className="p-2 border-t border-[#E5E7EB] bg-slate-50 sticky bottom-0">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-start text-[13px] text-[#1A56DB] font-medium hover:bg-[#1A56DB]/5 h-9"
                              onClick={() => {
                                setActiveItemDropdown(null);
                                setItemSearch("");
                              }}
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Qty & Unit */}
                    <div className="w-[15%] flex flex-col gap-1 pr-2 pt-1">
                      <div className="relative flex items-center bg-white border border-slate-200 rounded-[8px] shadow-sm hover:border-slate-300 transition-all focus-within:border-[#1A56DB] focus-within:ring-[3px] focus-within:ring-[#1A56DB]/15">
                        <input
                          type="number"
                          step="any"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          className="w-full text-center text-[13px] font-bold bg-transparent border-none py-2 focus:ring-0 outline-none"
                        />
                        <div className="h-4 w-px bg-slate-200" />
                        <button
                          type="button"
                          onClick={() => setActiveUnitDropdown(activeUnitDropdown === index ? null : index)}
                          className="px-2 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tight flex items-center gap-1 min-w-[45px] justify-center"
                        >
                          {watchedItems[index]?.unit || "pcs"}
                          <ChevronDown className="w-2.5 h-2.5" />
                        </button>

                        {/* Unit Dropdown */}
                        {activeUnitDropdown === index && (
                          <div 
                            ref={unitDropdownRef}
                            className="absolute top-[105%] right-0 w-[110px] bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 py-1"
                          >
                            {COMMON_UNITS.map((u) => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => {
                                  form.setValue(`items.${index}.unit`, u);
                                  setActiveUnitDropdown(null);
                                }}
                                className="w-full text-left px-3 py-2 text-[12px] hover:bg-slate-50 font-medium text-slate-600 uppercase transition-colors"
                              >
                                {u}
                              </button>
                            ))}
                            <div className="border-t border-slate-100 mt-1 px-2 py-2">
                              <input
                                type="text"
                                placeholder="Custom..."
                                className="w-full text-[11px] border border-slate-200 rounded px-1.5 py-1 focus:border-[#1A56DB] outline-none uppercase"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    form.setValue(`items.${index}.unit`, (e.target as HTMLInputElement).value.toLowerCase());
                                    setActiveUnitDropdown(null);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="w-[17%] flex justify-end pt-1">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] font-bold pointer-events-none">$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                          className="w-full text-right text-[13px] font-bold bg-white border border-slate-200 rounded-[8px] pl-7 pr-3 py-2 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 shadow-sm outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="w-[18%] flex justify-end items-center pt-3 pr-8 text-[14px] font-bold text-slate-900 tabular-nums">
                      {formatCurrency(itemAmount, watchedCurrency)}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove row"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add item row */}
            <div className="pt-2 relative">
              <button
                type="button"
                onClick={() => append({ name: "", description: "", quantity: 1, unit: "pcs", unitPrice: 0 })}
                className="text-[13px] text-[#1A56DB] font-medium flex items-center gap-1.5 hover:bg-[#1A56DB]/5 px-2 py-1.5 rounded-[6px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add line item
              </button>
            </div>

            {form.formState.errors.items?.root && (
              <p className="text-red-500 text-[12px] mt-2">{form.formState.errors.items.root.message}</p>
            )}
          </div>

          <hr className="border-[#E5E7EB] m-0" />

          {/* Section 4 — Totals block */}
          <div className="p-6 md:p-8 bg-white flex flex-col items-end gap-6">
            <div className="w-full md:w-[350px] space-y-4">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-bold tabular-nums">{formatCurrency(subtotal, watchedCurrency)}</span>
              </div>

              {!watchedDiscountType ? (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => form.setValue("discountType", "percent")}
                    className="text-[13px] text-[#1A56DB] font-bold hover:underline flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Discount
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue("discountType", null);
                      form.setValue("discountValue", 0);
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => form.setValue("discountType", "percent")}
                          className={`text-[11px] px-3 py-1.5 rounded-md font-bold transition-all uppercase tracking-wider ${watchedDiscountType === "percent" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                          %
                        </button>
                        <button
                          type="button"
                          onClick={() => form.setValue("discountType", "amount")}
                          className={`text-[11px] px-3 py-1.5 rounded-md font-bold transition-all uppercase tracking-wider ${watchedDiscountType === "amount" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                          $
                        </button>
                      </div>
                      <div className="relative flex-1">
                        {watchedDiscountType === "amount" && (
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[14px] font-bold pointer-events-none">$</span>
                        )}
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("discountValue", { valueAsNumber: true })}
                          className="w-full text-[14px] font-bold bg-white border border-slate-200 rounded-lg py-2 focus:ring-2 focus:ring-[#1A56DB]/10 focus:border-[#1A56DB] transition-all outline-none pl-8 pr-3"
                        />
                        {watchedDiscountType === "percent" && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[14px] font-bold pointer-events-none">%</span>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Discount description"
                      {...form.register("discountDescription")}
                      className="w-full text-[12px] bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-[#1A56DB]/10 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {watchedDiscountType && discountAmount > 0 && (
                <div className="flex items-center justify-between text-[14px] text-green-600 font-bold">
                  <span>Discount {watchedDiscountValue && watchedDiscountType === "percent" ? `(${watchedDiscountValue}%)` : ""}</span>
                  <span>-{formatCurrency(discountAmount, watchedCurrency)}</span>
                </div>
              )}
            </div>
            
            <div className="w-full border-t border-slate-100 pt-6 flex flex-col items-end gap-1">
              <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">Total</span>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-black text-slate-900 tracking-tighter tabular-nums">
                  {formatCurrency(amountDue, watchedCurrency)}
                </span>
                <span className="text-[16px] font-bold text-slate-400">{watchedCurrency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 — Notes, Terms & Payment Instructions card */}
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 md:p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label className="text-[12px] text-slate-500 font-medium uppercase tracking-wide">Notes / Terms</Label>
            <textarea
              {...form.register("notes")}
              placeholder="Enter notes or terms of service visible to your customer..."
              className="w-full min-h-[60px] text-[13px] text-slate-900 placeholder-slate-400 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[8px] px-3 py-2 transition-all outline-none resize-y"
            />
          </div>

          <hr className="border-[#E5E7EB] m-0" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-[12px] text-slate-500 font-medium uppercase tracking-wide">Payment instructions</Label>
              <div className="bg-slate-100 text-slate-500 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full tracking-wide">
                Auto from Settings
              </div>
            </div>

            <div className="bg-[#F9FAFB] border border-[#E5E7EB]/50 rounded-[8px] p-3 text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">
              {settings.paymentInstructions}
            </div>

            <Link href="/dashboard/settings" className="text-[12px] text-[#1A56DB] font-medium hover:underline inline-flex items-center w-fit">
              Edit in Settings <span className="ml-1">→</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Preview Slide-over */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsPreviewOpen(false)} />
          <div className="relative w-full max-w-4xl h-full bg-slate-100 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
              <h2 className="text-lg font-semibold text-slate-900">Estimate Preview</h2>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex justify-center">
              <div className="bg-white shadow-sm border border-slate-200 w-full max-w-3xl">
                <PublicEstimatePrintDocument estimate={getPreviewEstimate()} previewMode={true} />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
