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
    requireEmailVerification: config.requireEmailVerification,
    sendResetPassword: async ({ user, url }) => {
      await mail(
        user.email,
        "Réinitialiser votre mot de passe Fund Road",
        `Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (valable une seule fois) :\n${url}\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.`,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: mailReady(),
    sendVerificationEmail: async ({ user, url }) => {
      await mail(
        user.email,
        "Confirmer votre compte Fund Road",
        `Bonjour,\n\nBienvenue sur Fund Road. Confirmez votre adresse en ouvrant ce lien :\n${url}\n\nSi vous n’avez pas créé de compte, ignorez ce message.`,
      );
    },
  },
  plugins: [twoFactor()],
  advanced: {
    useSecureCookies: config.baseURL.startsWith("https:"),
    // derrière le tunnel Cloudflare, seule cette adresse est fiable (x-forwarded-for est falsifiable)
    ...(process.env.BEHIND_CLOUDFLARE && {
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
    }),
  },
  rateLimit: { enabled: true },
});
