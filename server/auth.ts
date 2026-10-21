import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { db } from "./db.ts";
import { config } from "./config.ts";
import { mail, mailReady } from "./mail.ts";
export const auth = betterAuth({
  database: db,
  baseURL: config.baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [config.baseURL],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    requireEmailVerification: config.production,
    sendResetPassword: async ({ user, url }) => {
      await mail(user.email, "Réinitialiser votre mot de passe Fundroad", url);
    },
  },
  emailVerification: {
    sendOnSignUp: mailReady(),
    sendVerificationEmail: async ({ user, url }) => {
      await mail(user.email, "Confirmer votre compte Fundroad", url);
    },
  },
  plugins: [twoFactor()],
  advanced: { useSecureCookies: config.baseURL.startsWith("https:") },
  rateLimit: { enabled: true },
});
