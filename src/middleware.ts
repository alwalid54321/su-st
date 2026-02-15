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
    return null
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
    return null
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

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
