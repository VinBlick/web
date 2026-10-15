import Link from "next/link";
import { UserRoundCheck } from "lucide-react";
import { PaymentMethods } from "@/shared/ui/payment-methods";

const links = [
  ["VINblick", "/"],
  ["Fahrzeugcheck", "/#vin-check"],
  ["Leistungen", "/leistungen"],
  ["Servicehistorie", "/servicehistorie"],
  ["Preise", "/preise"],
  ["Kontakt", "/kontakt"],
  ["Impressum", "/impressum"],
  ["Datenschutz", "/datenschutz"],
  ["AGB", "/agb"],
  ["FAQ", "/faq"],
];

export function Footer() {
  return (
    <footer className="bg-[#003b7a] px-6 py-5 text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 xl:flex-row xl:gap-6">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          VINblick
        </Link>
        <PaymentMethods footer />
        <nav
          aria-label="Footernavigation"
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-xs font-semibold text-white/85"
        >
          <Link
            href="/konto"
            aria-label="Mein Konto"
            className="mr-0.5 text-white"
          >
            <UserRoundCheck size={19} strokeWidth={1.5} />
          </Link>
          {!process.env.NEXT_PUBLIC_API_BASE_URL ? (
            <Link href="/seitenuebersicht" className="underline">
              Seitenübersicht
            </Link>
          ) : null}
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="hover:text-white hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
