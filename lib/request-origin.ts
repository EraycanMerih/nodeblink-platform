import { headers } from "next/headers";
import { PUBLIC_BASE_URL } from "@/lib/env";

export function getRequestOriginFromRequest(request: Request): string {
  const origin = new URL(request.url).origin;
  if (PUBLIC_BASE_URL && !PUBLIC_BASE_URL.includes("localhost")) {
    return PUBLIC_BASE_URL;
  }
  return origin;
}

export async function getRequestOrigin() {
  if (PUBLIC_BASE_URL && !PUBLIC_BASE_URL.includes("localhost")) {
    return PUBLIC_BASE_URL;
  }

  const headerList = await headers();
  const proto =
    headerList.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    process.env.VERCEL_URL ??
    "localhost:3000";

  return `${proto}://${host}`;
}
