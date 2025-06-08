import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user, token }) {
      if (token.user) {
        session.user = token.user as any;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user && user.email) {
        const dbUser = await db.user.upsert({
          where: {
            email: user.email,
          },
          create: {
            email: user.email,
            name: user.name || user.email.split("@")[0],
            avatar: user.image,
          },
          update: {},
        });
        token.user = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          avatar: dbUser.avatar,
          proUser: dbUser.proUser,
        };
      }
      return token;
    },
  },
});

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      proUser: boolean;
      credits: number;
    } & DefaultSession["user"];
  }
}
