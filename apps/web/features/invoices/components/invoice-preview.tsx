import React from 'react';

export type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  lineTotal: number;
};

export type InvoiceData = {
  // Sender Details
  companyName: string;
  companyAddress: string[];
  companyPhone?: string;
  companyEmail?: string;
  
  // Customer Details
  customerCompanyName: string;
  customerName?: string;
  customerAddress: string[];
  customerPhone?: string;
  customerEmail?: string;
  
  // Invoice Details
  invoiceNumber: string | number;
  issueDate: string;
  dueDate: string;
  currency: string;
  
  // Items & Totals
  items: InvoiceItem[];
  subtotal: number;
  discountAmount?: number;
  discountPercentage?: number;
  taxTotal: number;
  total: number;
  amountDue: number;
  
  // Additional Info
  taxLabel?: string; // e.g. "HST 13% (737975169 RT0001)"
  notes?: string;
  companyLogoUrl?: string | null;
  status?: string | null; // e.g. "DRAFT", "PAID", "OVERDUE"
  documentTitle?: string; // e.g. "INVOICE", "ESTIMATE"
  themeColor?: string; // e.g. "#3b82f6"
};

export interface InvoicePreviewProps {
  data: InvoiceData;
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: data.currency || 'CAD',
    }).format(amount);
  };

  return (
    <div className="relative w-full max-w-[850px] mx-auto bg-white shadow-xl border border-gray-200 font-sans text-[13px] leading-relaxed text-gray-900 overflow-hidden">
      
      {/* Watermark for Status */}
      {data.status && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0 opacity-[0.03]">
          <span className="text-[150px] font-black uppercase tracking-widest -rotate-45 text-black">
            {data.status}
          </span>
        </div>
      )}

      <div className="relative z-10">
        {/* 1. Header Section */}
      <header className="flex justify-between items-start px-12 pt-14 pb-8">
        {/* Left Side: Logo */}
        <div className="w-48 h-48 bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
          {data.companyLogoUrl ? (
            <img 
              src={data.companyLogoUrl} 
              alt={`${data.companyName} logo`} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center text-gray-400">
              <span className="font-black text-xl block tracking-widest">LOGO</span>
              <span className="text-xs uppercase tracking-wider">Placeholder</span>
            </div>
          )}
        </div>

        {/* Right Side: Title & Sender Details */}
        <div className="text-right flex flex-col">
          <h1 className="text-[42px] leading-none tracking-tight text-black mb-5 uppercase">
            {data.documentTitle || "INVOICE"}
          </h1>
          <p className="font-bold text-black text-sm">{data.companyName}</p>
          {data.companyAddress.map((line, idx) => (
            <p key={idx} className={`text-gray-700 ${idx === data.companyAddress.length - 1 ? 'mb-3' : ''}`}>
              {line}
            </p>
          ))}
          
          {data.companyPhone && <p className="text-gray-700">{data.companyPhone}</p>}
          {data.companyEmail && <p className="text-gray-700">{data.companyEmail}</p>}
        </div>
      </header>

      <hr className="border-gray-200 mx-12" />

      {/* 2. Meta Information Section */}
      <section className="px-12 py-8">
        <div className="flex justify-between items-start">
          {/* Left Column: Bill to */}
          <div className="flex flex-col">
            <h2 className="font-bold text-black mb-1">Bill to</h2>
            <p className="font-bold text-black">{data.customerCompanyName}</p>
            {data.customerName && <p className="text-gray-700">{data.customerName}</p>}
            
            {data.customerAddress.map((line, idx) => (
              <p key={idx} className={`text-gray-700 ${idx === data.customerAddress.length - 1 ? 'mb-3' : ''}`}>
                {line}
              </p>
            ))}
            
            {data.customerPhone && <p className="text-gray-700">{data.customerPhone}</p>}
            {data.customerEmail && <p className="text-gray-700">{data.customerEmail}</p>}
          </div>

          {/* Right Column: Invoice Details */}
          <div className="w-[340px]">
            <table className="w-full text-right border-collapse">
              <tbody>
                <tr>
                  <td className="font-bold text-black py-1 pr-4 w-1/2">Invoice Number:</td>
                  <td className="text-gray-700 py-1">{data.invoiceNumber}</td>
                </tr>
                <tr>
                  <td className="font-bold text-black py-1 pr-4">Invoice Date:</td>
                  <td className="text-gray-700 py-1">{data.issueDate}</td>
                </tr>
                <tr>
                  <td className="font-bold text-black py-1 pr-4">Payment Due:</td>
                  <td className="text-gray-700 py-1 mb-1 block">{data.dueDate}</td>
                </tr>
                {/* Highlighted Amount Due Row */}
                <tr className="bg-gray-100">
                  <td className="font-bold text-black py-2 pr-4 pl-3 rounded-l">Amount Due ({data.currency}):</td>
                  <td className="font-bold text-black py-2 pr-3 rounded-r">{formatCurrency(data.amountDue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. Items Table */}
      <section className="px-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: data.themeColor || '#3b82f6' }} className="text-white">
              <th className="py-2.5 px-12 font-semibold w-[40%]">Items</th>
              <th className="py-2.5 px-4 font-semibold text-right">Quantity</th>
              <th className="py-2.5 px-4 font-semibold text-right">Price</th>
              <th className="py-2.5 px-4 font-semibold text-right">Tax</th>
              <th className="py-2.5 px-12 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-900">
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="py-4 px-12 font-bold text-black">{item.name}</td>
                <td className="py-4 px-4 text-right">{item.quantity}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 px-4 text-right">{formatCurrency(item.taxAmount)}</td>
                <td className="py-4 px-12 text-right">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr className="border-gray-300 mx-12 mt-4" />

      {/* 4. Footer (Notes & Totals) */}
      <footer className="px-12 py-8 pb-20 flex justify-between items-end">
        {/* Left Side: Notes / Terms */}
        <div className="max-w-xs mb-4">
          <h3 className="font-bold text-black mb-1">Notes / Terms</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {data.notes || "No additional notes provided."}
          </p>
        </div>

        {/* Right Side: Totals */}
        <div className="w-[340px]">
          <table className="w-full text-right border-collapse">
            <tbody>
              <tr>
                <td className="font-bold text-black py-1.5 pr-6 w-1/2">Subtotal:</td>
                <td className="text-gray-700 py-1.5">{formatCurrency(data.subtotal)}</td>
              </tr>
              
              {data.discountAmount !== undefined && data.discountAmount > 0 && (
                <tr>
                  <td className="text-green-600 py-1.5 pr-6">
                    {data.discountPercentage ? `${data.discountPercentage}% Discount:` : 'Discount:'}
                  </td>
                  <td className="text-green-600 py-1.5">({formatCurrency(data.discountAmount)})</td>
                </tr>
              )}
              
              <tr>
                <td className="text-gray-700 py-1.5 pr-6">{data.taxLabel || "Tax:"}</td>
                <td className="text-gray-700 py-1.5">{formatCurrency(data.taxTotal)}</td>
              </tr>
              
              <tr>
                <td colSpan={2} className="pt-4 pb-2">
                  <hr className="border-gray-200" />
                </td>
              </tr>
              
              <tr>
                <td className="font-bold text-black py-2 pr-6">Total:</td>
                <td className="text-gray-900 py-2">{formatCurrency(data.total)}</td>
              </tr>

              <tr>
                <td colSpan={2} className="py-2">
                  <hr className="border-gray-200" />
                </td>
              </tr>

              <tr>
                <td className="font-bold text-black pt-2 pb-1 pr-6">Amount Due ({data.currency}):</td>
                <td className="font-bold text-black pt-2 pb-1">{formatCurrency(data.amountDue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </footer>
      </div>
      
    </div>
  );
}
