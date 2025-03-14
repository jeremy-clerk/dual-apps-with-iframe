"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

export const signInIframe = async () => {
  const { getToken } = await auth();
  const user = await currentUser();

  const url = process.env.NEXT_PUBLIC_FRAME_SRC + "/api/cross-auth";

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
    return await res.json();
  }
};
