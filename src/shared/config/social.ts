/**
 * Social media profiles shown in the menu and the footer.
 *
 * Insert the profile URL in `href` (e.g. "https://www.instagram.com/vinblick").
 * Icons with an empty href are shown but do not navigate until a URL is set.
 * The privacy policy (Datenschutz, section 10) lists the same networks.
 */
export type SocialNetwork =
  "instagram" | "facebook" | "x" | "youtube" | "tiktok";

export const socialLinks: {
  network: SocialNetwork;
  label: string;
  href: string;
}[] = [
  { network: "instagram", label: "Instagram", href: "" },
  { network: "facebook", label: "Facebook", href: "" },
  { network: "x", label: "X", href: "" },
  { network: "youtube", label: "YouTube", href: "" },
  { network: "tiktok", label: "TikTok", href: "" },
];
