import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";

import { createCheckoutSession, createPortalSession } from "@/lib/billing.functions";

/**
 * Drives the two Stripe redirects. All authorization happens server-side; this
 * hook only forwards the chosen billing interval and follows the returned URL.
 */
export function useBilling() {
  const startCheckout = useServerFn(createCheckoutSession);
  const openPortalFn = useServerFn(createPortalSession);
  const [pending, setPending] = useState<"monthly" | "yearly" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const message = (cause: unknown) =>
    cause instanceof Error && cause.message ? cause.message : "Something went wrong. Please try again.";

  const checkout = useCallback(
    async (interval: "monthly" | "yearly") => {
      setError(null);
      setPending(interval);
      try {
        const { url } = await startCheckout({ data: { interval } });
        window.location.assign(url);
      } catch (cause) {
        setError(message(cause));
        setPending(null);
      }
    },
    [startCheckout],
  );

  const openPortal = useCallback(async () => {
    setError(null);
    setPending("portal");
    try {
      const { url } = await openPortalFn();
      window.location.assign(url);
    } catch (cause) {
      setError(message(cause));
      setPending(null);
    }
  }, [openPortalFn]);

  return { checkout, openPortal, pending, error };
}
