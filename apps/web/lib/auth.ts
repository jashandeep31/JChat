import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import jwt from "jsonwebtoken";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user = token.user as any;
        session.user.jwt = jwt.sign(
          { user: token.user },
          process.env.JWT_SECRET as string
        );
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
      jwt: string;
    } & DefaultSession["user"];
  }
}
