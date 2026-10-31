import path from "node:path";
export const config = {
  port: Number(process.env.PORT || 3184),
  baseURL: process.env.APP_URL || "http://127.0.0.1:5184",
  data: path.resolve(process.env.DATA_DIR || ".local/documents"),
  production: process.env.NODE_ENV === "production",
  requireEmailVerification:
    process.env.REQUIRE_EMAIL_VERIFICATION !== undefined
      ? process.env.REQUIRE_EMAIL_VERIFICATION === "true"
      : process.env.NODE_ENV === "production",
  maxBytes: 20 * 1024 * 1024,
  maxExtracted: 300000,
  model: process.env.OPENAI_MODEL || "",
  apiKey: process.env.OPENAI_API_KEY || "",
  aiBaseURL: (
    process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
  ).replace(/\/$/, ""),
  pilotQuota: Number(process.env.PILOT_ANALYSES || 3),
  // offre Découverte : analyses IA offertes chaque mois sans abonnement
  freeQuota: Number(process.env.FREE_ANALYSES ?? 1),
  // organisation qui reçoit les dossiers à accompagner (ex. Pass PI)
  advisorOrg: process.env.ADVISOR_ORG_ID || "",
};
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL requis");
if (
  !process.env.BETTER_AUTH_SECRET ||
  process.env.BETTER_AUTH_SECRET.length < 32
)
  throw new Error("BETTER_AUTH_SECRET requis (32 caractères minimum)");

if (
  process.env.STRIPE_CONTEXT &&
  !/^acct_[A-Za-z0-9]+$/.test(process.env.STRIPE_CONTEXT)
)
  throw new Error(
    "STRIPE_CONTEXT doit identifier le compte Stripe Fundroad (acct_…)",
  );
if (
  process.env.STRIPE_SECRET_KEY?.startsWith("sk_org") &&
  !process.env.STRIPE_CONTEXT
)
  throw new Error("STRIPE_CONTEXT requis avec une clé Stripe d’organisation");
