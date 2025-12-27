import { NextAuthOptions, User, getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";

import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials || !credentials.email || !credentials.password)
          return null;

        const dbUser = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (!dbUser) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10); // Hash the password
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
            } as any,
          });
          return {
            id: newUser.id,
            email: newUser.email,
          } as User;
        }
        const userPassword = (dbUser as any).password;
        if (dbUser && userPassword) {
          // Compare hashed password with the provided password using bcrypt
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            userPassword
          );

          if (passwordMatch) {
            // Passwords match, return user data without sensitive information
            return {
              id: dbUser.id,
              email: dbUser.email,
            } as User;
          }
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    }),

    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.JWT_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (session.user.email) {
        const sessionUser = await prisma.user.findFirst({
          where: { email: session.user.email },
        });
        if (sessionUser) {
          session.user.id = sessionUser.id;
        }
      }
      return session;
    },
    async signIn({ profile, credentials }) {
      // Only handle OAuth providers (profile exists)
      if (profile && profile.email) {
        const dbUser = await prisma.user.findFirst({
          where: { email: profile.email },
        });

        if (!dbUser) {
          await prisma.user.create({
            data: {
              email: profile.email,
            } as any,
          });
        }
        return true;
      }
      // For credentials provider, return true (authorization handled in authorize)
      return true;
    },
  },
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  if (!session) return redirect("/authChoise");
}
