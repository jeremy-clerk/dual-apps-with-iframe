"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * This is our intermediary page that determines the action to perform when redirected from middleware
 * We need to know if we're in an iframe or not - so we have to run this client side
 * @constructor
 */
export default function FrameHelper() {
  const router = useRouter();

  useEffect(() => {
    try {
      // Are we in an iframe or top window context
      if (window && window.self === window.top) {
        // If we're not in an iframe - assume we're the top level context and redirect to sign-in
        router.push("/sign-in");
      }
      // Otherwise - we're in an iframe context and we need to sign-in - send request to the parent iframe to sign-in
      window.parent.postMessage(
        {
          type: "SIGNIN",
          message: "Not logged in",
        },
        process.env.NEXT_PUBLIC_TIER_ONE_ORIGIN!,
      );
    } catch (e) {
      console.error(e);
    }

    const handleMessage = (event: MessageEvent) => {
      // If the message does not come from the origin of our other app - ignore
      if (event.origin !== process.env.NEXT_PUBLIC_TIER_ONE_ORIGIN) return;

      if (event.data?.type === "TOKEN_DATA") {
        console.log("Received token", event.data);
        // This request should have the token
        const token = event.data.token;
        // push to our sign-in page with the __clerk_ticket parameter in the url
        router.push("/sign-in?__clerk_ticket=" + token);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return <div></div>;
}
