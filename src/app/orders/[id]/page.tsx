import { Suspense } from "react";
import { OrderPage } from "@/views/order";
export const metadata = { title: "Ihre Bestellung" };
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    access?: string | string[];
    payment?: string | string[];
  }>;
};
const one = (v?: string | string[]) => (typeof v === "string" ? v : undefined);
async function Content({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <OrderPage
      orderId={id}
      access={one(query.access)}
      payment={one(query.payment)}
    />
  );
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" className="py-20 text-center text-muted">
          Bestellung wird geladen …
        </p>
      }
    >
      <Content {...props} />
    </Suspense>
  );
}
