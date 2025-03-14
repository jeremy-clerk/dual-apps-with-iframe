import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/intermediary(.*)",
  "/api/cross-auth(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req, res) => {
  if (!isPublicRoute(req))
    // If the request is signed out redirect to our intermediary page
    await auth.protect({
      unauthenticatedUrl: new URL("/intermediary", req.nextUrl).toString(),
    });
});

export const config = {
  matcher: [
    // Exclude all static files and Next.js internals
    "/((?!_next|static|.*\\.(?:js|css|map|json|ico)).*)",
    // Only match API routes except the excluded ones
    "/api/:path((?!cross-auth|webhooks/).)*",
  ],
};
