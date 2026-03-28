import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // allow api endpoints and the login page to be accessed without a user, but redirect to the login page if the user tries to access a protected route without being logged in

  // ... (Your createServerClient setup remains the same)

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/login");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isOnboardingPage = request.nextUrl.pathname === "/onboarding";

  // 1. Redirect unauthenticated users to login (except for auth/api routes)
  if (!user && !isAuthPage && !isApiRoute && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // 2. Onboarding Check
  // if (user && !isApiRoute && !isAuthPage && !isOnboardingPage) {
  //   // Option A: Check Metadata (Fast, but requires manual refresh of session)
  //   const onboardingComplete = user.user_metadata?.onboarding_complete;

  //   // Option B: Database Check (Slower, but source of truth)
  //   // If metadata isn't enough, you'd query 'profiles' here, but be careful of middleware latency.

  //   if (!onboardingComplete) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = "/auth/onboarding";
  //     return NextResponse.redirect(url);
  //   }
  // }

  // 3. Prevent onboarded users from going back to the onboarding page
  if (user && isOnboardingPage && user.user_metadata?.onboarding_complete) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}
