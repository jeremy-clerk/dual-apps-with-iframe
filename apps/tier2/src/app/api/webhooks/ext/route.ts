import { Webhook } from "svix";
import { headers } from "next/headers";
import { createClerkClient, WebhookEvent } from "@clerk/nextjs/server";

/**
 * This is to receive an event from the Tier 1 App (meaning that we need to create the user in the Tier 2 App)
 * @param req
 * @constructor
 */
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env",
    );
  }

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = evt.type;
  if (eventType === "user.created") {
    // Get the relevant user data
    const { id, email_addresses, primary_email_address_id } = evt.data;
    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id,
    );
    // Create the Clerk client for tier 2
    const tierTwoClerkClient = await createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    });

    if (!primaryEmail || !id) {
      console.error("No email or id.");
      return new Response("No email or id.", { status: 200 });
    }

    const newUserResp = await tierTwoClerkClient.users.createUser({
      emailAddress: [primaryEmail?.email_address],
      externalId: id,
      skipPasswordRequirement: true,
    });

    const tierOneClerkClient = await createClerkClient({
      secretKey: process.env.TIER_ONE_CLERK_SECRET_KEY,
      publishableKey: process.env.TIER_ONE_CLERK_PUBLISHABLE_KEY,
    });

    await tierOneClerkClient.users.updateUser(id, {
      externalId: newUserResp.id,
    });
  }
  return new Response("Webhook received", { status: 200 });
}
