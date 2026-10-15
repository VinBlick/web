import { redirect } from "next/navigation";
/** link target used in emails of vin-check-api */
export default function Page() {
  redirect("/konto/rechnungen");
}
