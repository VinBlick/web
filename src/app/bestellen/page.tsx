import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/features/checkout";
import { Section } from "@/shared/ui/section";
export const metadata = {
  title: "Report bestellen",
  robots: { index: false, follow: false },
};
type Props = {
  searchParams: Promise<{
    paket?: string | string[];
    vin?: string | string[];
    check?: string | string[];
  }>;
};
const one = (v?: string | string[]) => (typeof v === "string" ? v : undefined);
async function CheckoutContent({ searchParams }: Props) {
  const params = await searchParams;
  const paket = one(params.paket);
  const vin = one(params.vin) ?? "";
  if (!paket)
    redirect(`/preise${vin ? `?vin=${encodeURIComponent(vin)}` : ""}`);
  return (
    <CheckoutForm
      packageCode={paket.toUpperCase()}
      initialVin={vin}
      checkId={one(params.check)}
    />
  );
}
export default function Page(props: Props) {
  return (
    <Section className="bg-surface">
      <Suspense
        fallback={
          <p role="status" className="py-10 text-center text-muted">
            Bestellung wird vorbereitet …
          </p>
        }
      >
        <CheckoutContent {...props} />
      </Suspense>
    </Section>
  );
}
