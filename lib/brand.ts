export const BRAND_GRADIENT =
  "linear-gradient(135deg, #635BFF 0%, #7A5CFF 50%, #9A7BFF 100%)";

export const BRAND_GRADIENT_SOFT =
  "linear-gradient(135deg, rgba(99, 91, 255, 0.16) 0%, rgba(154, 123, 255, 0.12) 100%)";

export const BRAND_COLORS = {
  start: "#635BFF",
  mid: "#7A5CFF",
  end: "#9A7BFF",
  ink: "#ffffff",
  muted: "rgba(10, 37, 64, 0.7)",
} as const;

export const SUPPORT_EMAIL = "support@nodeblink.dev";

const OG_PROMPT =
  "ultra high end SaaS product hero image for NodeBlink, Solana creator checkout platform, clean premium tech aesthetic, deep navy background with indigo to violet gradient accents, subtle glow lines suggesting transactions flowing from buyers to creators, minimal wallet and link motifs, photoreal studio lighting, no logos, no text, marketing banner";

const OG_PROMPT_ENCODED = encodeURIComponent(OG_PROMPT);

export const OG_IMAGE_16_9_URL = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${OG_PROMPT_ENCODED}&image_size=landscape_16_9`;

export const OG_IMAGE_SQUARE_URL = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${OG_PROMPT_ENCODED}&image_size=square_hd`;
