import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/intermediary(.*)",
  "/api/cross-auth(.*)",
]);

export default clerkMiddleware(async (auth, req, res) => {
  if (!isPublicRoute(req))
    await auth.protect({
      unauthenticatedUrl: new URL("/intermediary", req.nextUrl).toString(),
    });
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes, except cross-auth
    "/(api(?!/cross-auth))(.*)",
  ],
};
