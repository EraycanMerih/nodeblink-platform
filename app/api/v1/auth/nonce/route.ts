import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const nonce = crypto.randomBytes(32).toString("base64");
  return NextResponse.json({ nonce });
}
