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
import { createInvoiceAction } from "@/features/invoices/server/actions";
import type { InvoiceCustomerOption } from "@/features/invoices/server/queries";
import type { SavedItemOption } from "@/features/items/types";

// UI Components
import { Button, Input, Label, Textarea } from "@nlt-invoice/ui";

const modernInvoiceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  invoiceNumber: z.number().min(1, "Invoice # is required"),
  poNumber: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string(),
  items: z.array(
    z.object({
      savedItemId: z.string().optional(),
      name: z.string().min(1, "Item name is required"),
      description: z.string().optional(),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      unitPrice: z.number().min(0, "Price must be 0 or greater"),
    })
  ).min(1, "At least one item is required"),
  discountType: z.enum(["percent", "amount"]).nullable(),
  discountValue: z.number().optional(),
  discountDescription: z.string().optional(),
  notes: z.string().optional(),
});

type ModernInvoiceFormInput = z.infer<typeof modernInvoiceSchema>;

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
  customers: InvoiceCustomerOption[];
  recentCustomers: InvoiceCustomerOption[];
  savedItems: SavedItemOption[];
  defaultValues?: Partial<ModernInvoiceFormInput>;
  settings: SettingsMock;
  nextInvoiceNumber: number;
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

export function ModernInvoiceForm({
  customers,
  recentCustomers,
  savedItems,
  defaultValues,
  settings,
  nextInvoiceNumber,
}: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Business Details Card Toggle
  const [isBusinessDetailsOpen, setIsBusinessDetailsOpen] = useState(true);

  // Dropdown states
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const itemDropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(customerDropdownRef, () => setIsCustomerDropdownOpen(false));
  useOnClickOutside(itemDropdownRef, () => setIsItemDropdownOpen(false));

  // Form setup
  const form = useForm<ModernInvoiceFormInput>({
    resolver: zodResolver(modernInvoiceSchema),
    defaultValues: {
      title: "Invoice",
      summary: "",
      customerId: "",
      invoiceNumber: nextInvoiceNumber,
      poNumber: "",
      issueDate: formatDate(new Date()),
      dueDate: formatDate(new Date()),
      currency: settings.defaultCurrency,
      items: [{ name: "", description: "", quantity: 1, unitPrice: 0 }],
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
  const watchedDueDate = useWatch({ control: form.control, name: "dueDate" });
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
        c.companyName?.toLowerCase().includes(lower)
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
    form.setValue("dueDate", formatDate(date), {
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
  const onSubmit = async (values: ModernInvoiceFormInput) => {
    setIsPending(true);
    try {
      // Map back to the expected schema format for the server action if necessary.
      // Assuming createInvoiceAction works with standard values. We map custom fields to it.
      const payload = {
        customerId: values.customerId,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
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
      const result = await createInvoiceAction(payload);
      if (result?.success) {
        router.push("/dashboard/invoices");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="font-sans text-[14px] text-slate-900 bg-[#F9FAFB] min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between shadow-sm transition-all">
        <div className="max-w-[800px] w-full mx-auto flex items-center justify-between">
          <h1 className="text-[20px] font-medium tracking-tight">New Invoice</h1>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
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

      <div className="max-w-[800px] mx-auto px-4 pt-6 pb-20 space-y-[12px]">
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
                    placeholder="Summary (e.g. project name or description of invoice)"
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

        {/* Section 2 — Customer + invoice meta card */}
        <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left column — Customer selector */}
            <div className="relative" ref={customerDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                className={`w-full min-h-[130px] rounded-[10px] border transition-all duration-150 flex flex-col p-5 text-left outline-none ${
                  isCustomerDropdownOpen ? "border-[#1A56DB] ring-[3px] ring-[#1A56DB]/15" : "border-[#E5E7EB] hover:border-slate-300"
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

            {/* Right column — Invoice fields */}
            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Invoice #",
                  name: "invoiceNumber",
                  type: "number",
                },
                {
                  label: "P.O. / S.O. #",
                  name: "poNumber",
                  type: "text",
                  placeholder: "Optional",
                },
                {
                  label: "Invoice date",
                  name: "issueDate",
                  type: "date",
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

              <div className="flex items-start">
                <Label className="text-[13px] text-slate-500 font-normal min-w-[110px] shrink-0 mt-2">
                  Payment due
                </Label>
                <div className="flex flex-col gap-2">
                  <input
                    type="date"
                    {...form.register("dueDate")}
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
                        className={`text-[11px] px-2.5 py-1 rounded-full transition-colors duration-150 border ${
                          activePill === pill.days
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
              <div className="flex text-[12px] text-slate-400 uppercase tracking-wider font-medium pb-2 border-b border-[#E5E7EB] px-2">
                <div className="w-[50%]">Items</div>
                <div className="w-[12%] text-center">Qty</div>
                <div className="w-[18%] text-right">Price</div>
                <div className="w-[20%] text-right">Amount</div>
              </div>

              {fields.map((field, index) => {
                const itemQty = watchedItems[index]?.quantity || 0;
                const itemPrice = watchedItems[index]?.unitPrice || 0;
                const itemAmount = itemQty * itemPrice;

                return (
                  <div key={field.id} className="group flex items-start py-3 border-b border-[#F3F4F6] px-2 relative transition-colors hover:bg-slate-50/50">
                    <div className="w-[50%] pr-4 flex flex-col gap-1">
                      <input
                        {...form.register(`items.${index}.name`)}
                        placeholder="Item name"
                        className="w-full text-[13px] font-medium text-slate-900 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[6px] px-2 py-1 transition-all outline-none"
                      />
                      <input
                        {...form.register(`items.${index}.description`)}
                        placeholder="Description (optional)"
                        className="w-full text-[11px] text-slate-500 bg-transparent border border-transparent hover:border-[#E5E7EB] focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 rounded-[6px] px-2 py-1 transition-all outline-none"
                      />
                    </div>
                    
                    <div className="w-[12%] flex justify-center pt-1">
                      <input
                        type="number"
                        step="1"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-[52px] text-center text-[13px] border border-[#E5E7EB] rounded-[6px] px-1 py-1 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="w-[18%] flex justify-end pt-1">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none">$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                          className="w-[80px] text-right text-[13px] border border-[#E5E7EB] rounded-[6px] pl-5 pr-2 py-1 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="w-[20%] flex justify-end items-center pt-2 pr-6 text-[13px] text-slate-600">
                      {formatCurrency(itemAmount, watchedCurrency)}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Add item row */}
            <div className="pt-2 relative" ref={itemDropdownRef}>
              <button
                type="button"
                onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
                className="text-[13px] text-[#1A56DB] font-medium flex items-center gap-1.5 hover:bg-[#1A56DB]/5 px-2 py-1.5 rounded-[6px] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add an item
              </button>

              {isItemDropdownOpen && (
                <div className="absolute top-[100%] left-0 w-[300px] bg-white rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.10)] border border-[#E5E7EB] z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 mt-1">
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
                            append({
                              savedItemId: item.id,
                              name: item.name,
                              description: item.description || "",
                              quantity: 1,
                              unitPrice: Number(item.defaultRate),
                            });
                            setIsItemDropdownOpen(false);
                            setItemSearch("");
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors border-b last:border-0 border-[#F3F4F6]"
                        >
                          <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-[13px] font-medium text-slate-900 truncate">{item.name}</span>
                            {item.description && (
                              <span className="text-[11px] text-slate-500 truncate">{item.description}</span>
                            )}
                          </div>
                          <span className="text-[12px] text-slate-500 whitespace-nowrap shrink-0">
                            {formatCurrency(Number(item.defaultRate), watchedCurrency)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-[#E5E7EB] bg-slate-50 sticky bottom-0">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        append({ name: itemSearch || "New item", description: "", quantity: 1, unitPrice: 0 });
                        setIsItemDropdownOpen(false);
                        setItemSearch("");
                      }}
                      className="w-full justify-start text-[13px] text-[#1A56DB] font-medium hover:bg-[#1A56DB]/5 h-9"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Create new item
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {form.formState.errors.items?.root && (
              <p className="text-red-500 text-[12px] mt-2">{form.formState.errors.items.root.message}</p>
            )}
          </div>

          <hr className="border-[#E5E7EB] m-0" />

          {/* Section 4 — Totals block */}
          <div className="p-5 md:p-6 bg-white flex justify-end">
            <div className="w-full md:w-[320px] flex flex-col gap-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900 font-medium">{formatCurrency(subtotal, watchedCurrency)}</span>
              </div>

              {!watchedDiscountType ? (
                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => form.setValue("discountType", "percent")}
                    className="text-[13px] text-[#1A56DB] hover:underline"
                  >
                    + Add a discount
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-[8px] border border-[#E5E7EB] relative animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue("discountType", null);
                      form.setValue("discountValue", 0);
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 rounded-md p-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  
                  <div className="flex flex-col gap-3 pr-6">
                    <div className="flex items-center gap-2">
                      <div className="flex bg-white rounded-[6px] border border-[#E5E7EB] overflow-hidden p-0.5">
                        <button
                          type="button"
                          onClick={() => form.setValue("discountType", "percent")}
                          className={`text-[12px] px-2 py-1 rounded-[4px] font-medium transition-colors ${
                            watchedDiscountType === "percent" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          % Percent
                        </button>
                        <button
                          type="button"
                          onClick={() => form.setValue("discountType", "amount")}
                          className={`text-[12px] px-2 py-1 rounded-[4px] font-medium transition-colors ${
                            watchedDiscountType === "amount" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          $ Amount
                        </button>
                      </div>
                      <div className="relative">
                        {watchedDiscountType === "amount" && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none">$</span>
                        )}
                        <input
                          type="number"
                          step="0.01"
                          {...form.register("discountValue", { valueAsNumber: true })}
                          className={`w-[80px] text-[13px] border border-[#E5E7EB] rounded-[6px] py-1 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 outline-none transition-all ${
                            watchedDiscountType === "amount" ? "pl-5 pr-2 text-right" : "px-2 text-center"
                          }`}
                        />
                        {watchedDiscountType === "percent" && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none">%</span>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      {...form.register("discountDescription")}
                      className="w-full text-[12px] bg-white border border-[#E5E7EB] rounded-[6px] px-2.5 py-1.5 focus:border-[#1A56DB] focus:ring-[3px] focus:ring-[#1A56DB]/15 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {watchedDiscountType && discountAmount > 0 && (
                <div className="flex items-center justify-between text-[13px] text-green-600">
                  <span>Discount {watchedDiscountValue && watchedDiscountType === "percent" ? `(${watchedDiscountValue}%)` : ""}</span>
                  <span>-{formatCurrency(discountAmount, watchedCurrency)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex justify-end bg-[#F9FAFB] px-5 py-[14px] border-t border-[#E5E7EB]">
            <div className="w-full md:w-[320px] flex items-center justify-between">
              <span className="text-[16px] font-semibold text-slate-900">Amount Due</span>
              <span className="text-[16px] font-semibold text-slate-900">{formatCurrency(amountDue, watchedCurrency)}</span>
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
    </form>
  );
}
