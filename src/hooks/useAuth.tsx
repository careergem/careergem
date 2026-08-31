import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { checkVerifier, createVerifier, deriveKey, generateSalt } from "@/lib/crypto";
import { PUBLIC_BETA } from "@/lib/launch";

export type Profile = {
  id: string;
  display_name: string | null;
  plan: string;
  trial_ends_at: string;
  kdf_salt: string | null;
  verifier_ciphertext: string | null;
  verifier_iv: string | null;
  onboarding_complete: boolean;
  target_role: string | null;
  target_roles: string[];
  experience_level: string | null;
  known_gaps: string[];
  field: string | null;
  timeline: string | null;
  personal_details_ciphertext: string | null;
  personal_details_iv: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
};

type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  /** In-memory AES key. Null means the vault is locked for this tab. */
  vaultKey: CryptoKey | null;
  vaultMismatch: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
};

const AuthContext = createContext<AuthValue | null>(null);

async function loadProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, plan, trial_ends_at, kdf_salt, verifier_ciphertext, verifier_iv, onboarding_complete, target_role, target_roles, experience_level, known_gaps, field, timeline, personal_details_ciphertext, personal_details_iv, subscription_status, current_period_end, cancel_at_period_end, stripe_customer_id",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [vaultMismatch, setVaultMismatch] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      if (!next) {
        setProfile(null);
        setVaultKey(null);
        setVaultMismatch(false);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        try {
          setProfile(await loadProfile(data.session.user.id));
        } catch {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) return null;
    const next = await loadProfile(userId);
    setProfile(next);
    return next;
  }, []);

  /** Derives the vault key from a passphrase, creating the salt on first use. */
  const establishVault = useCallback(async (userId: string, passphrase: string) => {
    let current = await loadProfile(userId);

    // The signup trigger may not have committed yet on very fast signups.
    for (let attempt = 0; attempt < 5 && !current; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      current = await loadProfile(userId);
    }

    if (current?.kdf_salt && current.verifier_ciphertext && current.verifier_iv) {
      const key = await deriveKey(passphrase, current.kdf_salt);
      const ok = await checkVerifier(key, {
        ciphertext: current.verifier_ciphertext,
        iv: current.verifier_iv,
      });
      if (!ok) {
        setVaultMismatch(true);
        setProfile(current);
        return;
      }
      setVaultKey(key);
      setVaultMismatch(false);
      setProfile(current);
      return;
    }

    const salt = generateSalt();
    const key = await deriveKey(passphrase, salt);
    const verifier = await createVerifier(key);
    const { error } = await supabase
      .from("profiles")
      .update({
        kdf_salt: salt,
        verifier_ciphertext: verifier.ciphertext,
        verifier_iv: verifier.iv,
      })
      .eq("id", userId);
    if (error) throw error;
    setVaultKey(key);
    setVaultMismatch(false);
    setProfile(await loadProfile(userId));
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
      if (data.session?.user) {
        await establishVault(data.session.user.id, password);
      }
    },
    [establishVault],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.session?.user) {
        await establishVault(data.session.user.id, password);
      }
    },
    [establishVault],
  );

  const unlock = useCallback(
    async (passphrase: string) => {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) throw new Error("You are signed out.");
      await establishVault(userId, passphrase);
    },
    [establishVault],
  );

  const signOut = useCallback(async () => {
    setVaultKey(null);
    setVaultMismatch(false);
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile,
      loading,
      vaultKey,
      vaultMismatch,
      signUp,
      signIn,
      signOut,
      unlock,
      refreshProfile,
    }),
    [
      session,
      profile,
      loading,
      vaultKey,
      vaultMismatch,
      signUp,
      signIn,
      signOut,
      unlock,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function trialDaysLeft(profile: Profile | null): number {
  if (!profile) return 0;
  const ms = new Date(profile.trial_ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function hasAccess(profile: Profile | null): boolean {
  if (!profile) return false;
  if (PUBLIC_BETA) return true;
  if (profile.plan === "active") return true;
  return trialDaysLeft(profile) > 0;
}
