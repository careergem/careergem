import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

/**
 * Route-level gate for every signed-in screen.
 *
 * `ssr: false` because the Supabase session lives in localStorage, which the
 * server cannot read — gating server-side would loop on hard refresh. The
 * check runs before any child component renders, so protected UI can never
 * flash for a signed-out visitor. Row Level Security remains the real
 * authority on data access; this gate is a navigation concern only.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    return { user: data.user };
  },
  component: () => <Outlet />,
});
