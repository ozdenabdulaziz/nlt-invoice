import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NLT Invoice",
};

export default function TermsPage() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-6 text-sm leading-6 text-muted-foreground">
        This page is coming soon. Questions? Email{" "}
        <a className="underline" href="mailto:info@nltinvoice.com">
          info@nltinvoice.com
        </a>
        .
      </p>
    </section>
  );
}
