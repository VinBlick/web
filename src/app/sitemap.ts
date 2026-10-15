import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const pages = [
  "",
  "/leistungen",
  "/servicehistorie",
  "/preise",
  "/beispielreport",
  "/faq",
  "/kontakt",
  "/impressum",
  "/datenschutz",
  "/agb",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({
    url: `${site}${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.6 : 1,
  }));
}
