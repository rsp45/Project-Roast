import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function hasSessionCookie(req: NextRequest) {
  const cookie = req.headers.get("cookie") ?? "";
  return (
    cookie.includes("__Secure-next-auth.session-token=") ||
    cookie.includes("next-auth.session-token=")
  );
}

export function middleware(req: NextRequest) {
  if (!hasSessionCookie(req)) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
