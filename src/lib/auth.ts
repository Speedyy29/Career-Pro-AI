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
        // Temporary logging for debugging Google OAuth → Prisma Profile creation
        console.log("[nextauth][google][signIn] start", {
          userId: user.id,
          email: user.email,
          provider: account?.provider,
        });

        // Create profile for Google OAuth users
        const existingProfile = await db.profile.findUnique({
          where: { userId: user.id },
        });

        if (!existingProfile) {
          console.log("[nextauth][google][signIn] creating profile (before)", {
            userId: user.id,
          });

          try {
            const createdProfile = await db.profile.create({
              data: {
                userId: user.id!,
                // Minimal safe fix for required Prisma field(s)
                skills: [],
              },
            });

            console.log("[nextauth][google][signIn] created profile (after)", {
              profileId: createdProfile.id,
              userId: createdProfile.userId,
            });
          } catch (e: any) {
            console.error("[nextauth][google][signIn] prisma profile.create error", {
              message: e?.message,
              name: e?.name,
              stack: e?.stack,
              // keep raw error shape available for debugging
              error: e,
            });
            throw e;
          }
        } else {
          console.log("[nextauth][google][signIn] profile already exists", {
            userId: user.id,
          });
        }

        console.log("[nextauth][google][signIn] done");
      }

      return true;
    },
  },
});
