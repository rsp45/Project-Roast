import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

function createHandler() {
  return NextAuth(getAuthOptions());
}

export async function GET(req: Request) {
  return createHandler()(req as NextRequest);
}

export async function POST(req: Request) {
  return createHandler()(req as NextRequest);
}
