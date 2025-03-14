"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FrameHelper() {
  const router = useRouter();

  useEffect(() => {
    try {
      if (window && window.self === window.top) {
        router.push("/sign-in");
      }
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
      if (event.origin !== process.env.NEXT_PUBLIC_TIER_ONE_ORIGIN) return;

      if (event.data?.type === "TOKEN_DATA") {
        const token = event.data.data.data.token;
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
