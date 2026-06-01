import type { ActionsJson } from "@solana/actions";
import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import { NextResponse } from "next/server";

export async function GET() {
  const document: ActionsJson = {
    rules: [
      {
        pathPattern: "/creator/:username",
        apiPath: "/api/v1/actions/creator/:username",
      },
    ],
  };

  return NextResponse.json(document, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: ACTIONS_CORS_HEADERS });
}
