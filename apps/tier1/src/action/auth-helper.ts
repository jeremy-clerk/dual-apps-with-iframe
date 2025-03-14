"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

export const signInIframe = async () => {
  const { getToken } = await auth();
  // The current user from the top level (Tier 1) application
  const user = await currentUser();

  const url = process.env.NEXT_PUBLIC_FRAME_SRC + "/api/cross-auth";

  // Make the request to the 'cross-auth' api endpoint to retrieve our sign-in token.
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + (await getToken()),
    },
    body: JSON.stringify({
      test: "Test value",
      externalId: user?.externalId,
    }),
  });

  if (!res.ok) {
    return { error: "Error occurred creating sign-in" };
  } else {
    // Return our sign-in token for the child (Tier 2) app.
    return await res.json();
  }
};
