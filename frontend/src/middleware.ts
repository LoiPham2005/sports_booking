import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'sb_access';

type Role = 'CUSTOMER' | 'OWNER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

/**
 * Edge-safe JWT payload decode (no signature verify — backend is source of truth).
 * Đủ để route protect: middleware chỉ chặn đi vào, không phải authoritative.
 */
function decodeJwtPayload(token: string): { sub?: string; role?: Role; exp?: number } | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // base64url → base64
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(part.length + ((4 - (part.length % 4)) % 4), '=');
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

interface Route {
  pattern: RegExp;
  /** Nếu null → chỉ cần login (mọi role). */
  allow: Role[] | null;
}

const PROTECTED: Route[] = [
  { pattern: /^\/account(\/|$)/, allow: null },
  { pattern: /^\/booking(\/|$)/, allow: null },
  { pattern: /^\/owner(\/|$)/, allow: ['OWNER', 'ADMIN', 'SUPER_ADMIN'] },
  { pattern: /^\/staff(\/|$)/, allow: ['STAFF', 'OWNER', 'ADMIN', 'SUPER_ADMIN'] },
  { pattern: /^\/admin\/system(\/|$)/, allow: ['SUPER_ADMIN'] },
  { pattern: /^\/admin(\/|$)/, allow: ['ADMIN', 'SUPER_ADMIN'] },
];

const AUTH_PAGES = /^\/(login|register|forgot-password)(\/|$)/;

// Khi USE_MOCK=true → demo chips có thể vào mọi route mà không cần login.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (USE_MOCK) return NextResponse.next();

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const isLoggedIn = !!payload?.sub && (!payload.exp || payload.exp * 1000 > Date.now());

  // Logged in → đừng cho vào /login, /register nữa.
  if (isLoggedIn && AUTH_PAGES.test(pathname)) {
    const home = homeByRole(payload!.role);
    return NextResponse.redirect(new URL(home, req.url));
  }

  // Protected route check.
  for (const route of PROTECTED) {
    if (!route.pattern.test(pathname)) continue;
    if (!isLoggedIn) {
      const url = new URL('/login', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (route.allow && !route.allow.includes(payload!.role!)) {
      // Sai role → đẩy về home của role hiện tại.
      return NextResponse.redirect(new URL(homeByRole(payload!.role), req.url));
    }
    break;
  }

  return NextResponse.next();
}

function homeByRole(role?: Role): string {
  switch (role) {
    case 'OWNER':
      return '/owner';
    case 'STAFF':
      return '/staff';
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/admin';
    default:
      return '/';
  }
}

export const config = {
  // Chỉ chạy middleware trên route đáng quan tâm (skip _next, api, static).
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
