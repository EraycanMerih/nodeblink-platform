import { ACTIONS_CORS_HEADERS } from "@/lib/actions-constants";

export function jsonWithActionsCors(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  for (const [key, value] of Object.entries(ACTIONS_CORS_HEADERS)) {
    headers.set(key, value);
  }
  return Response.json(data, { ...init, headers });
}

export function emptyOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS,
  });
}
