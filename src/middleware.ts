import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isUserAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")
  const isAdminAuthPage = req.nextUrl.pathname.startsWith("/admin/login") || req.nextUrl.pathname.startsWith("/dashboard/login")
  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard")
  const isAdminPage = req.nextUrl.pathname.startsWith("/admin")
  const isUserDashboardPage = req.nextUrl.pathname.startsWith("/user")

  // Redirect /dashboard/login to /admin/login
  if (req.nextUrl.pathname.startsWith("/dashboard/login")) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl))
  }

  // Redirect logged-in users away from login/register pages
  if (isUserAuthPage) {
    if (isLoggedIn) {
      // Check if admin to redirect to dashboard, else user dashboard
      const user = req.auth?.user as any
      if (user?.isStaff || user?.isSuperuser) {
        return NextResponse.redirect(new URL("/admin", req.nextUrl))
      }
      return NextResponse.redirect(new URL("/user", req.nextUrl))
    }
    return null
  }

  // Handle admin login page
  if (isAdminAuthPage) {
    if (isLoggedIn) {
      const user = req.auth?.user as any
      if (user?.isStaff || user?.isSuperuser) {
        return NextResponse.redirect(new URL("/admin", req.nextUrl))
      }
      // If regular user tries to access admin login, redirect to user dashboard
      return NextResponse.redirect(new URL("/user", req.nextUrl))
    }
    return null
  }

  // Redirect /dashboard routes to /admin (except login which is handled above)
  if (isDashboardPage && !isAdminAuthPage) {
    const newPath = req.nextUrl.pathname.replace("/dashboard", "/admin");
    return NextResponse.redirect(new URL(newPath, req.nextUrl));
  }

  // Protect /admin routes - admin only
  if (isAdminPage && !req.nextUrl.pathname.startsWith("/admin/login")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl))
    }

    const user = req.auth?.user as any
    if (!user?.isStaff && !user?.isSuperuser) {
      return NextResponse.redirect(new URL("/user", req.nextUrl))
    }
  }

  // Protect /user routes - authenticated users only
  if (isUserDashboardPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
