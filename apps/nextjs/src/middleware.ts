import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";

import { i18n } from "~/config/i18n-config";

const noNeedProcessRoute = [".*\\.png", ".*\\.jpg", ".*\\.opengraph-image.png"];

const noRedirectRoute = [
  "/api(.*)", 
  "/trpc(.*)", 
  "/admin",
  "/api/public-db-test"  
];

const publicRoute = [
  "/(\\w{2}/)?signin(.*)",
  "/(\\w{2}/)?terms(.*)",
  "/(\\w{2}/)?privacy(.*)",
  "/(\\w{2}/)?docs(.*)",
  "/(\\w{2}/)?blog(.*)",
  "/(\\w{2}/)?pricing(.*)",
  "^/\\w{2}$", // root with locale
  "/api/public-db-test", 
];

// Role-based access control paths with CRUD permissions
const roleProtectedRoutes = {
  BUYER: [
    "/(\\w{2}/)?dashboard/buyer(.*)",
    "/(\\w{2}/)?dashboard/community(.*)" // Buyers can access community features
  ],
  SELLER: [
    "/(\\w{2}/)?dashboard/seller(.*)",
    "/(\\w{2}/)?dashboard/marketplace(.*)", // Sellers can access marketplace management
    "/(\\w{2}/)?dashboard/community(.*)" // Sellers can access community features
  ],
  MODERATOR: [
    "/(\\w{2}/)?dashboard/moderator(.*)",
    "/(\\w{2}/)?dashboard/marketplace(.*)", // Moderators can manage marketplace
    "/(\\w{2}/)?dashboard/resources(.*)", // Moderators can manage resources
    "/(\\w{2}/)?dashboard/community(.*)" // Moderators can manage community
  ],
  ADMIN: [
    "/(\\w{2}/)?dashboard/admin(.*)",
    "/(\\w{2}/)?dashboard/marketplace(.*)",
    "/(\\w{2}/)?dashboard/resources(.*)",
    "/(\\w{2}/)?dashboard/community(.*)"
  ],
};

// Check if the path requires a specific role
function requiresRole(pathname: string, role: string): boolean {
  const routes = roleProtectedRoutes[role as keyof typeof roleProtectedRoutes] || [];
  return routes.some((route) => new RegExp(`^${route}$`).test(pathname));
}

// Check if the current user has access to the requested path
function hasPathAccess(pathname: string, userRole: string | null): boolean {
  // If no role, deny access to all protected routes
  if (!userRole) return false;
  
  // Check if path requires a specific role
  for (const [role, routes] of Object.entries(roleProtectedRoutes)) {
    if (role !== userRole && routes.some(route => new RegExp(`^${route}$`).test(pathname))) {
      return false;
    }
  }
  
  return true;
}

// Update to accept both NextRequest and the extended NextRequestWithAuth
function getLocale(request: { headers: { get: (key: string) => string | null } } & { nextUrl: { pathname: string } }): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  // Handle headers whether they come from NextRequest or NextRequestWithAuth
  if ('forEach' in request.headers) {
    (request.headers as Headers).forEach((value, key) => (negotiatorHeaders[key] = value));
  } else {
    // Fallback for NextRequestWithAuth where headers might be different
    const headerKeys = ['accept-language', 'cookie', 'user-agent'];
    headerKeys.forEach(key => {
      const value = request.headers.get(key);
      if (value) negotiatorHeaders[key] = value;
    });
  }
  
  const locales = Array.from(i18n.locales);
  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );
  return matchLocale(languages, locales, i18n.defaultLocale);
}

function isNoRedirect(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

function isPublicPage(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return publicRoute.some((route) => new RegExp(route).test(pathname));
}

function isNoNeedProcess(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

function isApiRoute(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  return pathname.startsWith('/api/');
}

/**
 * 1、 if the request is public page and don't have locale, redirect to locale page
 * 2、 if the request is not public page and don't have locale, redirect to login page
 * 3、
 * @param request
 * @returns
 */
export default async function middleware(request: NextRequest) {
  // Always bypass API routes completely
  if (isApiRoute(request)) {
    return NextResponse.next();
  }
  
  if (isNoNeedProcess(request)) {
    return null;
  }
  const isWebhooksRoute = /^\/api\/webhooks\//.test(request.nextUrl.pathname);
  if (isWebhooksRoute) {
    return NextResponse.next();
  }
  const pathname = request.nextUrl.pathname;
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  // Redirect if there is no locale
  if (!isNoRedirect(request) && pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url,
      ),
    );
  }

  if (isPublicPage(request)) {
    return null;
  }
  // @ts-ignore
  return authMiddleware(request, null);
}

const authMiddleware = withAuth(
  async function middlewares(req) {
    const token = await getToken({ req });
    const isAuth = !!token;
    const isAdmin = token?.isAdmin;
    const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(
      req.nextUrl.pathname,
    );
    const isAuthRoute = /^\/api\/trpc\//.test(req.nextUrl.pathname);
    const locale = getLocale(req);
    const userRole = token?.role as string | null;

    if (isAuthRoute && isAuth) {
      return NextResponse.next();
    }
    if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
      if (!isAuth || !isAdmin)
        return NextResponse.redirect(new URL(`/admin/login`, req.url));
      return NextResponse.next();
    }
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
      return null;
    }
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/${locale}/login?from=${encodeURIComponent(from)}`, req.url),
      );
    }
    if (!hasPathAccess(req.nextUrl.pathname, userRole)) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  },
  {
    callbacks: {
      authorized() {
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
};
