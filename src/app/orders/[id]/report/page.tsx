import { Suspense } from "react";
import { OrderReportPage } from "@/views/order";
export const metadata = { title: "Fahrzeugreport" };
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ access?: string | string[] }>;
};
async function Content({ params, searchParams }: Props) {
  const [{ id }, { access }] = await Promise.all([params, searchParams]);
  return (
    <OrderReportPage
      orderId={id}
      access={typeof access === "string" ? access : undefined}
    />
  );
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" className="py-20 text-center text-muted">
          Report wird geladen …
        </p>
      }
    >
      <Content {...props} />
    </Suspense>
  );
}
