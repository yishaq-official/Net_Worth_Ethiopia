import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "./db.js";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8081";

export const auth = betterAuth({
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  database: drizzleAdapter(db, { provider: "pg" }),
  user: {
    additionalFields: {
      acceptedTerms: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    expo(),
  ],
  trustedOrigins: [frontendUrl, "networth://"],
});
