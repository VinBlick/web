"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, UserRound, ArrowRight } from "lucide-react";
import { navigation } from "@/shared/config/navigation";
import { ButtonLink } from "@/shared/ui/button";
export function Header() {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const open = openPath === pathname;
  const setOpen = (value: boolean) => setOpenPath(value ? pathname : null);
  return (
    <header
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
      className="relative z-20 border-b border-line bg-white"
    >
      <div className="mx-auto flex h-[88px] max-w-[1200px] items-center justify-between gap-5 px-5 md:px-8">
        <Link
          href="/"
          aria-label="VINblick Startseite"
          onClick={() => setOpen(false)}
          className="relative h-[58px] w-[154px] shrink-0 overflow-hidden"
        >
          <Image
            src="/images/logo.png"
            alt="VINblick Fahrzeugcheck"
            fill
            sizes="154px"
            preload
            className="scale-[1.3] object-cover"
          />
        </Link>
        <nav
          aria-label="Hauptnavigation"
          className="hidden items-center gap-5 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`text-xs font-semibold hover:text-brand ${pathname === item.href ? "text-brand" : "text-ink"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <span className="hidden text-xs font-semibold lg:block" lang="de">
            DE
          </span>
          <Link
            href="/konto"
            aria-label="Mein Konto"
            onClick={() => setOpen(false)}
            className="p-2 text-brand"
          >
            <UserRound size={23} strokeWidth={1.6} />
          </Link>
          <ButtonLink
            href="/#vin-check"
            onClick={() => setOpen(false)}
            className="hidden min-h-10 px-4 py-2 text-xs sm:inline-flex"
          >
            VIN prüfen <ArrowRight size={14} />
          </ButtonLink>
          <button
            ref={menuButton}
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            className="rounded-full border border-line p-2.5 text-brand lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="absolute inset-x-0 top-full border-b border-line bg-white p-5 shadow-lg lg:hidden"
        >
          {[...navigation, { label: "FAQ", href: "/faq" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href ? "page" : undefined}
              className="block rounded-md px-3 py-3 font-semibold text-brand hover:bg-surface"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
