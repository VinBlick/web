import { Reveal } from "@/shared/ui/reveal";
import { Hero } from "@/widgets/hero";
import { Benefits, ReportFeatures } from "@/widgets/report-sections";
import { Pricing } from "@/widgets/pricing";
export function HomePage() {
  return (
    <div className="home-motion">
      <Hero />
      <Reveal>
        <Benefits />
      </Reveal>
      <Reveal>
        <ReportFeatures />
      </Reveal>
      <Reveal>
        <Pricing />
      </Reveal>
    </div>
  );
}
