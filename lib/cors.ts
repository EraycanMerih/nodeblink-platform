import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import { NextResponse } from "next/server";

export function jsonWithActionsCors<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...ACTIONS_CORS_HEADERS,
      ...(init?.headers ?? {}),
    },
  });
}

export function emptyOptionsResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS,
  });
}
