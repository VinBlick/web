/**
 * Social media icons in the menu and the footer.
 *
 * The links are managed in the admin panel (Settings → Social media) and
 * loaded from GET /v1/site. This list is the fallback (order, labels) while
 * loading or when the API is unreachable: all icons shown, no links.
 * The privacy policy (Datenschutz, section 10) lists the same networks.
 */
export type SocialNetwork =
  "instagram" | "facebook" | "x" | "youtube" | "tiktok";

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
  tiktok: "TikTok",
};

export type SocialLink = { network: SocialNetwork; url: string };

export const defaultSocialLinks: SocialLink[] = (
  Object.keys(SOCIAL_LABELS) as SocialNetwork[]
).map((network) => ({ network, url: "" }));
