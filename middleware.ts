// Refresh the Supabase session cookie on every dynamic request.
// IMPORTANT: do not put any logic between createServerClient() and supabase.auth.getUser()
// otherwise refresh tokens may not propagate correctly.

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Touching getUser() refreshes the session if needed.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on everything EXCEPT static assets and Next internals.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|html|ico|woff|woff2|ttf|map)$).*)",
  ],
};
