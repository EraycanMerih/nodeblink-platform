import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatSol(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  return `${sol.toFixed(sol < 1 ? 4 : 2)} SOL`;
}

export function formatUsdAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
