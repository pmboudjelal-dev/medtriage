import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = ['/dashboard', '/patient', '/scan'].some(
    (path) => pathname.startsWith(path)
  );

  const isAuthPage = pathname.startsWith('/login');

  // تحقق من وجود session cookie
  const hasSession =
    request.cookies.get('sb-access-token') ||
    request.cookies.get('sb-refresh-token') ||
    [...request.cookies.getAll()].some((c) => c.name.includes('auth-token'));

  if (!hasSession && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};