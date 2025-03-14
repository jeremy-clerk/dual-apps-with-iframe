import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Create a Clerk client using the Tier One secret key
    const tierOneClerk = await createClerkClient({
      secretKey: process.env.TIER_ONE_CLERK_SECRET_KEY,
      publishableKey: process.env.TIER_ONE_CLERK_PUBLISHABLE_KEY,
    });

    const { isSignedIn, toAuth } = await tierOneClerk.authenticateRequest(req);

    const auth = await toAuth();

    if (!isSignedIn || !auth) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tier2UserId = auth.sessionClaims?.externalId?.toString();

    console.log(tier2UserId);

    if (!tier2UserId) {
      return Response.json({ error: "Missing external id" });
    }

    const tierTwoClerk = await createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    const res = await tierTwoClerk.signInTokens.createSignInToken({
      userId: tier2UserId,
      expiresInSeconds: 300,
    });

    return Response.json({ status: 200, data: res });
  } catch (error: any) {
    console.error("Cross-auth error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
