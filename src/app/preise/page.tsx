import { Suspense } from "react";
import { Pricing } from "@/widgets/pricing";
export const metadata = { title: "Preise" };
type Props = { searchParams: Promise<{ vin?: string | string[] }> };
async function PricingContent({ searchParams }: Props) {
  const { vin } = await searchParams;
  return <Pricing purchase initialVin={typeof vin === "string" ? vin : ""} />;
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-12 text-center">
          Preise werden geladen …
        </p>
      }
    >
      <PricingContent {...props} />
    </Suspense>
  );
}
