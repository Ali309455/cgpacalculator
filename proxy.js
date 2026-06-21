import { NextResponse } from "next/server";
export function proxy(request) {
  const token = request.cookies.get("token");


  const protectedRoutes = ["/Dashboard", "/Calculator", "/AISuggestions", "/FormulaSettings","/AccoutSettings", ""];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Dashboard/:path*", "/Calculator/:path*", "/AISuggestions/:path*", "/FormulaSettings/:path*", "/AccoutSettings/:path*", "/:path*"],
};