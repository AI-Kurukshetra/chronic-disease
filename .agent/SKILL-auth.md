# SKILL: Authentication, RBAC & Middleware

## HealthOS Agent Skill File

**Read this before any auth, session, or role-gating task.**

---

## Supabase Client Setup

### Browser Client (Singleton)

```typescript
// lib/supabase/client.ts
import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### Server Client (Per-Request — Reads Cookies)

```typescript
// lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function createServerClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    },
  );
}
```

---

## Middleware — Route Protection

```typescript
// middleware.ts (root)
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ROUTE_ROLE_MAP = {
  '/dashboard': 'patient',
  '/provider': 'provider',
  '/admin': 'admin',
} as const;

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Unauthenticated user accessing protected routes → redirect to login
  const isProtected = Object.keys(ROUTE_ROLE_MAP).some((r) => pathname.startsWith(r));
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Wrong role for route → redirect to their own dashboard
  if (user) {
    const userRole = user.app_metadata?.role as string;
    for (const [route, requiredRole] of Object.entries(ROUTE_ROLE_MAP)) {
      if (pathname.startsWith(route) && userRole !== requiredRole) {
        const redirectMap = { patient: '/dashboard', provider: '/provider', admin: '/admin' };
        return NextResponse.redirect(
          new URL(redirectMap[userRole as keyof typeof redirectMap] ?? '/login', request.url),
        );
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)'],
};
```

---

## Supabase Auth Hook — Inject Role into JWT

Set this up in Supabase Dashboard → Auth → Hooks → After Sign In:

```typescript
// supabase/functions/inject-role-claim/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { user } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return new Response(
    JSON.stringify({
      app_metadata: { role: profile?.role ?? 'patient' },
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
```

---

## Server Action — Session Verification Pattern

**Every Server Action must start with this pattern:**

```typescript
// Standard session guard — copy to every Server Action
async function verifySession() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('You must be signed in to perform this action');
  }

  const role = user.app_metadata?.role as string;
  return { user, role, supabase };
}

// Usage in any Server Action:
export async function someAction(input: SomeInput) {
  const { user, role, supabase } = await verifySession();

  // Role check (if action is role-specific)
  if (role !== 'provider') {
    return { success: false, error: 'Only providers can perform this action' };
  }

  // ... rest of action
}
```

---

## MFA Setup Flow

```typescript
// Server Action: enroll-mfa.actions.ts
'use server';

export async function enrollMFA() {
  const { supabase } = await verifySession();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'HealthOS',
  });

  if (error) return { success: false, error: 'Failed to start MFA setup' };

  // Return QR code URI to display in UI — never the secret
  return {
    success: true,
    qrCode: data.totp.qr_code,
    factorId: data.id,
  };
}

export async function verifyMFA(factorId: string, code: string) {
  const { supabase } = await verifySession();

  const { data: challengeData } = await supabase.auth.mfa.challenge({ factorId });
  if (!challengeData) return { success: false, error: 'Challenge failed' };

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });

  if (error) return { success: false, error: 'Invalid code. Please try again.' };
  return { success: true };
}
```

---

## withRole Server Component Guard

```typescript
// lib/utils/withRole.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/lib/constants/roles.constants';

export async function withRole(
  requiredRole: UserRole,
  children: React.ReactNode
): Promise<React.ReactNode> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== requiredRole) {
    redirect('/login');
  }

  return children;
}

// Usage in a provider-only page:
export default async function ProviderPatientsPage() {
  return withRole('provider', <PatientsList />);
}
```
