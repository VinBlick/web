import { Suspense } from "react";
import { PublicReportPage } from "@/views/public-report";
export const metadata = { title: "Fahrzeugreport prüfen" };
type Props = { params: Promise<{ code: string }> };
async function Content({ params }: Props) {
  const { code } = await params;
  return <PublicReportPage code={code} />;
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
