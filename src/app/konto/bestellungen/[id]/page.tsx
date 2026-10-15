import { Suspense } from "react";
import { OrderDetail } from "@/views/account";
export const metadata = { title: "Bestellung" };
type Props = { params: Promise<{ id: string }> };
async function Detail(props: Props) {
  const { id } = await props.params;
  return <OrderDetail id={id} />;
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <p role="status" className="py-20 text-center text-muted">
          Daten werden geladen …
        </p>
      }
    >
      <Detail {...props} />
    </Suspense>
  );
}
