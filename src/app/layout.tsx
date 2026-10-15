import { Suspense } from "react";
import type { Metadata } from "next";
import { QueryProvider } from "./providers/query-provider";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "VINblick – Fahrzeughistorie prüfen",
    template: "%s – VINblick",
  },
  description:
    "Prüfen Sie wichtige Fahrzeugdaten anhand der VIN / FIN und treffen Sie eine bessere Kaufentscheidung.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" data-scroll-behavior="smooth">
      <body className="flex min-h-dvh flex-col antialiased">
        <QueryProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-accent focus:p-4"
          >
            Zum Inhalt springen
          </a>
          <Suspense
            fallback={
              <div className="h-[88px] border-b border-line bg-white" />
            }
          >
            <Header />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
