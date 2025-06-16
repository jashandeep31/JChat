import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import Credential from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credential({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        console.log(credentials);
        const email = credentials?.email;
        const password = credentials?.password;
        if (
          !email ||
          !password ||
          typeof email !== "string" ||
          typeof password !== "string"
        ) {
          throw new Error("Invalid credentials.");
        }

        const user = await db.user.findUnique({
          where: {
            email,
          },
        });
        if (!user || !user.password) {
          throw new Error("Invalid credentials.");
        }
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials.");
        }
        return user;
      },
    }),
  ],
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
      }
      return session;
    },

    async jwt({ token, user }) {
      const cookieStore = await cookies();
      if (user && user.email) {
        const dbUser = await db.user.upsert({
          where: {
            email: user.email,
          },
          create: {
            email: user.email,
            name: user.name || user.email.split("@")[0],
            avatar: user.image,
            credits: 10,
            totalCredits: 10,
            proUser: false,
          },
          update: {},
        });
        cookieStore.set(
          "jwt-token",
          jwt.sign(
            { user: { id: dbUser.id, email: dbUser.email } },
            process.env.JWT_SECRET!,
            {
              expiresIn: "7d",
            }
          ),
          {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60,
          }
        );
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
  interface Session {
    user: {
      id: string;
      proUser: boolean;
      credits: number;
    } & DefaultSession["user"];
  }
}
