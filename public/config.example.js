/**
 * GitHub Pages sets window.NODEBLINK_CONFIG at deploy time (see .github/workflows/pages.yml).
 * Local: copy to config.js or rely on dashboard.html localhost detection.
 */
window.NODEBLINK_CONFIG = {
  apiUrl: "https://api.nodeblink.dev",
  siteUrl: "https://nodeblink.dev",
  appUrl: "https://api.nodeblink.dev",
};
