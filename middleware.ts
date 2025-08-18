import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;
  
  const publicPaths = ["/"];
  const isPublic = publicPaths.includes(req.nextUrl.pathname);
  
  if (token && req.nextUrl.pathname !== "/webhook") {
    const webhookUrl = new URL("/webhook", req.url);
    return NextResponse.redirect(webhookUrl);
  }
  
  if (!token && !isPublic) {
    const loginUrl = new URL("/", req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
