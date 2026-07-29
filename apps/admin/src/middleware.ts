import { NextRequest, NextResponse } from "next/server";

const ALLOWED = process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) || ["*"];

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const origin = req.headers.get("origin") || "*";
  const allowOrigin = ALLOWED.includes("*") ? "*" : ALLOWED.includes(origin) ? origin : ALLOWED[0] || "*";

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", allowOrigin);
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
