import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const user = request.cookies.get("lvaep_user")?.value;
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/tutor/:path*", "/staff/:path*", "/students/:path*"],
};
