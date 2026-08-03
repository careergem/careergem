import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";

/**
 * Shown when a session exists but the encryption key is not in memory (fresh
 * tab, reload). The key is never stored, so the passphrase is needed again.
 */
export function VaultLock() {
  const { unlock, signOut, vaultMismatch } = useAuth();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await unlock(passphrase);
      setPassphrase("");
    } catch {
      setError("Could not unlock. Check your password and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-7">
          <h1 className="font-display text-xl font-semibold">Unlock your vault</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your career data is encrypted with your password. It is never stored anywhere,
            so enter it again to decrypt this session.
          </p>

          {vaultMismatch ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-foreground"
            >
              That password does not match the one your data was encrypted with. If you
              reset your password, previous assessments can no longer be decrypted — by
              anyone, including us.
            </p>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vault-passphrase">Password</Label>
              <Input
                id="vault-passphrase"
                type="password"
                autoComplete="current-password"
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
                required
                aria-describedby={error ? "vault-error" : undefined}
              />
            </div>
            {error ? (
              <p id="vault-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Unlocking…" : "Unlock"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-5 text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Sign out instead
          </button>
        </div>
      </div>
    </main>
  );
}