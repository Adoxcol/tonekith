import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { getAppUrl } from "@/lib/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db.insert(schema.profiles).values({
            userId: user.id,
            displayName: user.name,
          });
        },
      },
    },
  },
  trustedOrigins: [getAppUrl()],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || getAppUrl(),
});

export type Session = typeof auth.$Infer.Session;
