import { FREE_ACTIONS_PER_ROLE, FREE_ROLE_LIMIT, PRO_ROLE_LIMIT } from "./assessment-schema";

export type Tier = "free" | "pro";

export type Entitlement = {
  tier: Tier;
  /** Assessments allowed per rolling 30 days. null means unlimited. */
  assessmentsPerMonth: number | null;
  roleLimit: number;
  actionsPerRole: number | null;
  resources: boolean;
  progressTracking: boolean;
};

export const FREE: Entitlement = {
  tier: "free",
  assessmentsPerMonth: 1,
  roleLimit: FREE_ROLE_LIMIT,
  actionsPerRole: FREE_ACTIONS_PER_ROLE,
  resources: false,
  progressTracking: false,
};

export const PRO: Entitlement = {
  tier: "pro",
  assessmentsPerMonth: null,
  roleLimit: PRO_ROLE_LIMIT,
  actionsPerRole: null,
  resources: true,
  progressTracking: true,
};

/** Payment state is the only input. Never derived from client-held flags. */
export function entitlementFor(plan: string | null | undefined): Entitlement {
  return plan === "active" ? PRO : FREE;
}
