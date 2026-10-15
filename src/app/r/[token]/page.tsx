import { Suspense } from "react";
import { PublicReportPage } from "@/views/public-report";
export const metadata = { title: "Geteilter Fahrzeugreport" };
type Props = { params: Promise<{ token: string }> };
async function Content({ params }: Props) {
  const { token } = await params;
  return <PublicReportPage token={token} />;
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
