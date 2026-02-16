import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isUserAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")
  const isAdminAuthPage = req.nextUrl.pathname.startsWith("/admin/login") || req.nextUrl.pathname.startsWith("/dashboard/login")
  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard")
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin")
  const isUserDashboardPage = req.nextUrl.pathname.startsWith("/user")

  // Redirect /dashboard/login to /admin/login
  if (req.nextUrl.pathname.startsWith("/dashboard/login")) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  // Redirect logged-in users away from login/register pages
  if (isUserAuthPage) {
    if (isLoggedIn) {
      // Check if admin to redirect to dashboard, else user dashboard
      const user = req.auth?.user as any
      if (user?.isStaff || user?.isSuperuser) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      return NextResponse.redirect(new URL("/user", req.url))
    }
    return NextResponse.next()
  }

  // Handle admin login page
  if (isAdminAuthPage) {
    if (isLoggedIn) {
      const user = req.auth?.user as any
      if (user?.isStaff || user?.isSuperuser) {
        return NextResponse.redirect(new URL("/admin", req.url))
      }
      // If regular user tries to access admin login, redirect to user dashboard
      return NextResponse.redirect(new URL("/user", req.url))
    }
    return NextResponse.next()
  }

  // Redirect /dashboard routes to /admin (except login which is handled above)
  if (isDashboardPage && !isAdminAuthPage) {
    const newPath = req.nextUrl.pathname.replace("/dashboard", "/admin");
    return NextResponse.redirect(new URL(newPath, req.url));
  }

  // Protect /admin routes - admin only
  if (isAdminPage && !req.nextUrl.pathname.startsWith("/admin/login")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    const user = req.auth?.user as any
    if (!user?.isStaff && !user?.isSuperuser) {
      return NextResponse.redirect(new URL("/user", req.url))
    }
  }

  // Protect /user routes - authenticated users only
  if (isUserDashboardPage) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    img-src 'self' blob: data: https://picsum.photos https://flagcdn.com https://fastly.picsum.photos;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`
  // Replace newline characters and extra spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim()

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  return response
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)"],
}
