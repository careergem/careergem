import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuth } from "@/hooks/useAuth";

/**
 * Sign-out with cache hygiene, in order:
 * cancel in-flight queries -> drop cached decrypted data -> clear the session
 * -> replace history so Back cannot restore a protected screen.
 */
export function useSignOut() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    await navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }, [queryClient, signOut, navigate]);
}
