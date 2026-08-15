import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : undefined,
});
