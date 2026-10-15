import { Suspense } from "react";
import { AuthPage } from "@/views/auth";
export const metadata = {
  title: "Passwort festlegen",
  robots: { index: false, follow: false },
};
type Props = { searchParams: Promise<{ token?: string | string[] }> };
async function Content({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <AuthPage
      mode="set-password"
      token={typeof token === "string" ? token : undefined}
    />
  );
}
export default function Page(props: Props) {
  return (
    <Suspense fallback={null}>
      <Content {...props} />
    </Suspense>
  );
}
