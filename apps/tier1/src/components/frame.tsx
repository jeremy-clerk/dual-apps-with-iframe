"use client";

import { useEffect, useRef } from "react";
import { signInIframe } from "@/action/auth-helper";

export default function Frame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // If the request doesn't come from our child frame - ignore
      if (event.origin !== process.env.NEXT_PUBLIC_FRAME_SRC) return;

      // The SIGNIN event is sent from the child window and tells us we need to initiate a sign in for the secondary app
      if (event.data?.type === "SIGNIN") {
        console.log("Message from tier2:", event.data.message);
        // Post to the Tier 2 (child app) that we need to sign-in
        // This will return a sign-in token for our user in the secondary app
        const tokenData = await signInIframe();
        if (!tokenData) return;
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // Send the message to the iframe (Tier 2 child app) with our sign-in token
          iframeRef.current.contentWindow.postMessage(
            { type: "TOKEN_DATA", ...tokenData },
            process.env.NEXT_PUBLIC_FRAME_SRC,
          );
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={process.env.NEXT_PUBLIC_FRAME_SRC + "/dashboard"}
      className={
        "w-full max-w-lg h-[500px] border border-purple-800 border-2 rounded-md"
      }
    ></iframe>
  );
}
