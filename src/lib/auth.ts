import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Create profile for Google OAuth users
        const existingProfile = await db.profile.findUnique({
          where: { userId: user.id },
        });
        if (!existingProfile) {
          await db.profile.create({
            data: { userId: user.id! },
          });
        }
      }
      return true;
    },
  },
});
