import { createServerFn } from "@tanstack/react-start";

/**
 * Test-only fixture account. Credentials are intentionally fixed so repeated
 * test runs reuse one account instead of creating real users. The server
 * function refuses to run in production builds.
 */
export const TEST_ACCOUNT = {
  email: "test-user@careergem.test",
  password: "careergem-test-passphrase",
  displayName: "Test Pilot",
} as const;

function devEnabled(): boolean {
  return process.env["NODE_ENV"] !== "production";
}

/** Creates (or confirms) the fixture account so sign-in always succeeds. */
export const ensureTestAccount = createServerFn({ method: "POST" }).handler(async () => {
  if (!devEnabled()) {
    throw new Error("Test sign-in is disabled in production.");
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email: TEST_ACCOUNT.email,
    password: TEST_ACCOUNT.password,
    email_confirm: true,
    user_metadata: { display_name: TEST_ACCOUNT.displayName },
  });

  if (!error && created.user) {
    return { ok: true as const, created: true as const };
  }

  // Already exists: reset the password so the fixture credentials always work.
  const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) throw listError;

  const existing = list.users.find((user) => user.email === TEST_ACCOUNT.email);
  if (!existing) throw error ?? new Error("Could not provision the test account.");

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
    password: TEST_ACCOUNT.password,
    email_confirm: true,
  });
  if (updateError) throw updateError;

  return { ok: true as const, created: false as const };
});
