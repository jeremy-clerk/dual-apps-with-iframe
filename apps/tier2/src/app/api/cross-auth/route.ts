import { NextRequest } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Create a Clerk client using the keys from our other application.
    const tierOneClerk = await createClerkClient({
      secretKey: process.env.TIER_ONE_CLERK_SECRET_KEY,
      publishableKey: process.env.TIER_ONE_CLERK_PUBLISHABLE_KEY,
    });

    // Authenticate the request from the Tier 1 application to prove that user is signed in.
    const { isSignedIn, toAuth } = await tierOneClerk.authenticateRequest(req);

    const auth = await toAuth();

    if (!isSignedIn || !auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // The userId that we need to sign in as - it is put in the session token as 'externalId'
    // Users from the Tier 1 (other Clerk app) should have the user.external_id mapped to their userId for this application & vice versa
    const tier2UserId = auth.sessionClaims?.externalId?.toString();

    if (!tier2UserId) {
      return Response.json({ error: "Missing external id" });
    }

    // Create a Clerk client (for this application)
    const tierTwoClerk = await createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    // Create a sign in token for this application
    const res = await tierTwoClerk.signInTokens.createSignInToken({
      userId: tier2UserId,
      expiresInSeconds: 300,
    });

    // Return the sign in token back to the tier one app
    return Response.json({ ...res }, { status: 200 });
  } catch (error: any) {
    console.error("Cross-auth error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
