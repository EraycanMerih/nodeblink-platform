import type { ActionsJson } from "@solana/actions";
import { ACTIONS_CORS_HEADERS } from "@/lib/actions-constants";
import { NextResponse } from "next/server";
import { getRequestOriginFromRequest } from "@/lib/request-origin";

export async function GET(request: Request) {
  const origin = getRequestOriginFromRequest(request);
  const host = new URL(origin).host.replace(/^www\./, "");

    const rules = [
      {
        pathPattern: "/pay/:username/:productId",
        apiPath: "/api/v1/actions/creator/:username?productId=:productId",
      },
      {
        pathPattern: `${origin}/pay/:username/:productId`,
        apiPath: `${origin}/api/v1/actions/creator/:username?productId=:productId`,
      },
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
    ];

    const document: ActionsJson = { rules };

  return NextResponse.json(document, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}
