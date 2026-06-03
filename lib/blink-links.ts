export function buildSolanaActionDeepLink(actionApiUrl: string) {
  return `solana-action:${actionApiUrl}`;
}

export function buildDialectBlinkUrl(actionApiUrl: string) {
  const deepLink = buildSolanaActionDeepLink(actionApiUrl);
  return `https://dial.to/?action=${encodeURIComponent(deepLink)}`;
}

