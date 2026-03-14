import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

const PATIENT_PATHS: RegExp[] = [
  /^\/dashboard(?:\/|$)/,
  /^\/vitals(?:\/|$)/,
  /^\/symptoms(?:\/|$)/,
  /^\/medications(?:\/|$)/,
  /^\/nutrition(?:\/|$)/,
  /^\/exercise(?:\/|$)/,
  /^\/coach(?:\/|$)/,
  /^\/telehealth(?:\/|$)/,
  /^\/progress(?:\/|$)/,
  /^\/assessments(?:\/|$)/,
  /^\/education(?:\/|$)/,
  /^\/community(?:\/|$)/,
  /^\/caregivers(?:\/|$)/,
  /^\/notifications(?:\/|$)/,
];

const PROVIDER_PATHS: RegExp[] = [
  /^\/patients(?:\/|$)/,
  /^\/alerts(?:\/|$)/,
  /^\/overview(?:\/|$)/,
  /^\/care-plans(?:\/|$)/,
  /^\/messages(?:\/|$)/,
  /^\/schedule(?:\/|$)/,
  /^\/reports(?:\/|$)/,
  /^\/settings(?:\/|$)/,
];

const ADMIN_PATHS: RegExp[] = [/^\/admin(?:\/|$)/];

function matchesPath(pathname: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const requiresPatient = matchesPath(pathname, PATIENT_PATHS);
  const requiresProvider = matchesPath(pathname, PROVIDER_PATHS);
  const requiresAdmin = matchesPath(pathname, ADMIN_PATHS);
  const requiresAuth = requiresPatient || requiresProvider || requiresAdmin;

  if (!requiresAuth) {
    return response;
  }

  if (error || !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const rawRole = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : '';
  const role = rawRole.toUpperCase();

  if (requiresPatient && role !== 'PATIENT') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (requiresProvider && role !== 'PROVIDER') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (requiresAdmin && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
