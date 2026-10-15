import { AuthPage } from "@/views/auth";
export const metadata = { title: "Passwort vergessen" };
export default function Page() {
  return <AuthPage mode="reset" />;
}
