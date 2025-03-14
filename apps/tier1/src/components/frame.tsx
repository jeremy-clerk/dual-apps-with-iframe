"use client";

import { useEffect, useRef } from "react";
import { signInIframe } from "@/action/auth-helper";

export default function Frame() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== process.env.NEXT_PUBLIC_FRAME_SRC) return;

      if (event.data?.type === "SIGNIN") {
        console.log("Message from tier2:", event.data.message);
        const tokenData = await signInIframe();
        if (!tokenData || !tokenData.data) return;
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            { type: "TOKEN_DATA", data: { ...tokenData } },
            process.env.NEXT_PUBLIC_FRAME_SRC || "*",
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
