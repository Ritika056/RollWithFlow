import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rwf_token")?.value;
  if (pathname === "/login" && request.nextUrl.searchParams.get("reauth") === "1") {
    const response = NextResponse.next();
    response.cookies.delete("rwf_token");
    return response;
  }
  if (pathname === "/login") {
    return token ? NextResponse.redirect(new URL("/dashboard", request.url)) : NextResponse.next();
  }
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/|favicon.ico|images/).*)"] };
