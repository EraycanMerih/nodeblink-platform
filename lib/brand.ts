/** NodeBlink brand gradient — #0EEDB5 → #07EBD5 → #02E8EF */
export const BRAND_GRADIENT =
  "linear-gradient(135deg, #0EEDB5 0%, #07EBD5 50%, #02E8EF 100%)";

export const BRAND_GRADIENT_SOFT =
  "linear-gradient(135deg, rgba(14, 237, 181, 0.18) 0%, rgba(2, 232, 239, 0.12) 100%)";

export const BRAND_COLORS = {
  start: "#0EEDB5",
  mid: "#07EBD5",
  end: "#02E8EF",
  ink: "#0a1628",
  muted: "#5b6b7f",
} as const;

export const SUPPORT_EMAIL = "support@nodeblink.dev";

const OG_PROMPT =
  "ultra high end SaaS product hero image for NodeBlink, Solana creator checkout platform, clean premium tech aesthetic, dark navy background with teal to aqua gradient accents, subtle glow lines suggesting transactions flowing from buyers to creators, minimal wallet and link motifs, photoreal studio lighting, no logos, no text, marketing banner";

const OG_PROMPT_ENCODED = encodeURIComponent(OG_PROMPT);

export const OG_IMAGE_16_9_URL = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${OG_PROMPT_ENCODED}&image_size=landscape_16_9`;

export const OG_IMAGE_SQUARE_URL = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${OG_PROMPT_ENCODED}&image_size=square_hd`;
