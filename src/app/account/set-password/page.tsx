import { Suspense } from "react";
import { redirect } from "next/navigation";
/** link target used in emails of vin-check-api (APP_URL/account/set-password?token=…) */
type Props = { searchParams: Promise<{ token?: string | string[] }> };
async function Forward({ searchParams }: Props) {
  const { token } = await searchParams;
  redirect(
    `/konto/passwort-festlegen${typeof token === "string" ? `?token=${encodeURIComponent(token)}` : ""}`,
  );
  return null;
}
export default function Page(props: Props) {
  return (
    <Suspense fallback={null}>
      <Forward {...props} />
    </Suspense>
  );
}
