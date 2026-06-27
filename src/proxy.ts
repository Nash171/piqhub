import { NextRequest, NextResponse } from 'next/server';
import { unsealData } from 'iron-session';
import { SESSION_COOKIE_NAME } from './lib/session';

const adminRoutes = ['/admin'];
const authRoutes = ['/events', '/matches'];
const guestRoutes = ['/login', '/register'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let user: { id: number; username: string; role: string } | undefined;
  if (cookie) {
    try {
      const session = await unsealData<{ user?: { id: number; username: string; role: string } }>(cookie, {
        password: process.env.SESSION_SECRET!,
      });
      user = session.user;
    } catch {
      user = undefined;
    }
  }

  // Redirect logged-in users away from login/register
  if (user && guestRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/events', request.url));
  }

  // Protect auth routes
  if (!user && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route)) && (!user || user.role !== 'admin')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
