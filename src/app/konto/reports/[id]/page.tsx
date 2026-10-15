import { Suspense } from "react";
import { ReportDetail } from "@/views/account";
export const metadata = { title: "Fahrzeugreport" };
type Props = { params: Promise<{ id: string }> };
async function Detail(props: Props) {
  const { id } = await props.params;
  return <ReportDetail id={id} />;
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
