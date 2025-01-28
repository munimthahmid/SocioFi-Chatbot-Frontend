import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("authToken")?.value
  const isLoggedIn = !!authToken
  const isAuthPage = request.nextUrl.pathname.startsWith("/sign-in") || request.nextUrl.pathname.startsWith("/sign-up")
  console.log("Inside middleware")
  console.log(isAuthPage)
  console.log(authToken)
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL("/sign-up", request.url))
  }


  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

