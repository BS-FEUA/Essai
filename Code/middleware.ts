import { NextRequest, NextResponse } from "next/server";

const portalSections = new Set([
  "communiques",
  "inscription",
  "bureau",
  "revendications",
  "cotisations",
  "evenements",
  "bibliotheque",
]);

export function middleware(request: NextRequest) {
  const section = request.nextUrl.pathname.slice(1);
  if (portalSections.has(section)) {
    return NextResponse.rewrite(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/communiques", "/inscription", "/bureau", "/revendications", "/cotisations", "/evenements", "/bibliotheque"],
};
