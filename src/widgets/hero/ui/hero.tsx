import Image from "next/image";
import { VinForm } from "@/features/check-vin";
export function Hero() {
  return (
    <section
      id="vin-check"
      className="bg-surface px-5 py-12 md:px-8 md:py-[88px]"
    >
      <div className="mx-auto grid grid-cols-1 max-w-[1136px] items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
        <div>
          <p className="mb-6 hidden text-xs font-bold tracking-wide text-brand md:block">
            FAHRZEUGHISTORIE AUF EINEN BLICK
          </p>
          <h1 className="mb-6 text-[32px] min-[375px]:text-[38px] font-extrabold leading-[1.04] tracking-[-0.04em] md:text-[54px]">
            Fahrzeughistorie prüfen, bevor Sie kaufen
          </h1>
          <p className="mb-6 text-[17px] leading-[1.55] text-muted md:text-lg">
            Prüfen Sie wichtige Fahrzeugdaten anhand der VIN / FIN und treffen
            Sie eine bessere Kaufentscheidung.
          </p>
          <VinForm />
        </div>
        <VehicleVisual />
      </div>
    </section>
  );
}
export function VehicleVisual() {
  return (
    <div className="relative h-[300px] overflow-hidden rounded-lg border-[6px] border-white bg-[#151515] md:h-[420px]">
      <Image
        src="/images/vehicle.jpg"
        alt="Blaues Fahrzeug in Seitenansicht"
        fill
        sizes="(max-width: 767px) 100vw, 570px"
        preload
        className="object-cover"
      />
      <div className="absolute bottom-5 left-5 max-w-[250px] rounded bg-white p-4">
        <p className="mb-2 text-[11px] font-bold tracking-wide text-brand">
          FAHRZEUGDATEN
        </p>
        <p className="text-[19px] font-extrabold">Fahrzeug erkannt</p>
        <span className="mt-2 inline-block bg-accent px-2 py-1 text-xs font-semibold text-brand">
          Datenprüfung verfügbar
        </span>
      </div>
    </div>
  );
}
