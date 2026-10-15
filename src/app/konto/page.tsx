import { Suspense } from "react";
import { AuthPage } from "@/views/auth";
export const metadata = { title: "Mein Konto" };
type Props = { searchParams: Promise<{ next?: string | string[] }> };
async function Content({ searchParams }: Props) {
  const { next } = await searchParams;
  return <AuthPage next={typeof next === "string" ? next : undefined} />;
}
export default function Page(props: Props) {
  return (
    <Suspense fallback={<AuthPage />}>
      <Content {...props} />
    </Suspense>
  );
}
