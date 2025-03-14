import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/intermediary(.*)",
  "/api/cross-auth(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req, res) => {
  if (req.nextUrl.pathname.match("__px")) {
    const proxyHeaders = new Headers(req.headers);
    proxyHeaders.set(
      "Clerk-Proxy-Url",
      process.env.NEXT_PUBLIC_CLERK_PROXY_URL || "",
    );
    proxyHeaders.set("Clerk-Secret-Key", process.env.CLERK_SECRET_KEY || "");
    // @ts-ignore
    if (req.ip) {
      // @ts-ignore
      proxyHeaders.set("X-Forwarded-For", req.ip);
    } else {
      proxyHeaders.set(
        "X-Forwarded-For",
        req.headers.get("X-Forwarded-For") || "",
      );
    }

    const proxyUrl = new URL(req.url);
    proxyUrl.host = "frontend-api.clerk.dev";
    proxyUrl.port = "443";
    proxyUrl.protocol = "https";
    proxyUrl.pathname = proxyUrl.pathname.replace("/__px", "");

    if (proxyUrl.pathname.includes("npm/@clerk")) {
      return NextResponse.rewrite(proxyUrl, {
        request: {
          headers: proxyHeaders,
        },
      });
    }
    const response = await fetch(proxyUrl, {
      method: req.method,
      headers: proxyHeaders,
      body: req.body,
    });

    const newResponse = new Response(response.body, response);

    const cookies = response.headers.getSetCookie();

    const modifiedCookies = cookies.map((cookie) => {
      return (
        cookie
          .replace(/SameSite=Lax/gi, "SameSite=None")
          .replace(/SameSite=Strict/gi, "SameSite=None") + "; Secure"
      );
    });

    newResponse.headers.delete("Set-Cookie");
    modifiedCookies.forEach((cookie) => {
      newResponse.headers.append("Set-Cookie", cookie);
    });

    return newResponse;
  }

  if (!isPublicRoute(req))
    await auth.protect({
      unauthenticatedUrl: new URL("/intermediary", req.nextUrl).toString(),
    });
});

/*export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff1?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", // Always run for API routes, except cross-auth and webhooks
    "/((?!api/cross-auth|api/webhooks/).*)",
  ],
};*/

export const config = {
  matcher: [
    // Exclude all static files and Next.js internals
    "/((?!_next|static|.*\\.(?:js|css|map|json|ico)).*)",
    // Only match API routes except the excluded ones
    "/api/:path((?!cross-auth|webhooks/).)*",
  ],
};
