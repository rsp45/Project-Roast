import { getAuthOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getApiBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
}

export async function GET() {
  const session = await getServerSession(getAuthOptions());
  const idToken = session?.idToken;

  if (!idToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return NextResponse.json({ error: "Missing API base URL" }, { status: 500 });
  }

  const res = await fetch(`${baseUrl}/v1/auth/exchange`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      session: { provider: "google", idToken },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 502 });
  }

  const data = (await res.json()) as { accessToken: string; expiresIn: number };
  return NextResponse.json(data);
}
