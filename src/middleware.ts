import { NextRequest, NextResponse } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});

// Combine the middleware logic
export default async function middleware(req: NextRequest) {
  // Run the intl middleware first
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    return intlResponse;
  }

  // Run the Clerk middleware next
  const clerkResponse = clerkMiddleware(req as any);
  if (clerkResponse) {
    return clerkResponse;
  }

  // Default to NextResponse if no other middleware returns a response
  return NextResponse.next();
}

// Merge the config matchers
export const config = {
  matcher: [
    // Match paths for next-intl
    '/',
    '/(ar|en)/:path*',
    // Match paths for Clerk
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
