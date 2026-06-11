import type { ActionsJson } from "@solana/actions";
import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import { NextResponse } from "next/server";
import { getRequestOriginFromRequest } from "@/lib/request-origin";

export async function GET(request: Request) {
  const origin = getRequestOriginFromRequest(request);
  const host = new URL(origin).host.replace(/^www\./, "");

  const document: ActionsJson = {
    rules: [
      {
        pathPattern: "/pay/*",
        apiPath: "/api/v1/actions/creator/*",
      },
      {
        pathPattern: `${origin}/pay/*`,
        apiPath: `${origin}/api/v1/actions/creator/*`,
      },
      {
        pathPattern: `https://www.${host}/pay/*`,
        apiPath: `${origin}/api/v1/actions/creator/*`,
      },
      {
        pathPattern: "https://nodeblink.dev/pay/*",
        apiPath: `${origin}/api/v1/actions/creator/*`,
      },
      {
        pathPattern: "https://api.nodeblink.dev/pay/*",
        apiPath: `${origin}/api/v1/actions/creator/*`,
      },
    ],
  };

  return NextResponse.json(document, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}
