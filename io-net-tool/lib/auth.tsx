import { NextAuthOptions, User, getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";

import { prisma } from "../prisma/prisma/prismaClient/client";
import bcrypt from "bcryptjs";

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
              // You may add other fields if necessary
            },
          });
          return newUser;
        }
        if (dbUser) {
          // Compare hashed password with the provided password using bcrypt
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            dbUser.password
          );

          if (passwordMatch) {
            // Passwords match, return user data without sensitive information
            const { password, createdAt, ...dbUserWithoutPassword } = dbUser;
            return dbUserWithoutPassword as User;
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
      const sessionUser = await prisma.user.findFirst({
        where: { email: session.user.email },
      });
      session.user.id = sessionUser?.id;
      return session;
    },
    async signIn({ profile, credentials }) {
      //     // Chec k if credentials are provided
      const dbUser = await prisma.user.findFirst({
        where: { email: profile.email },
      });

      if (!dbUser) {
        const newUser = await prisma.user.create({
          data: {
            email: profile.email,
          },
        });
        return newUser;
      }
    },
  },
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  if (!session) return redirect("/authChoise");
}

export function loginIsRequiredClient() {
  if (typeof window !== "undefined") {
    const session = useSession();
    const router = useRouter();
    if (!session) router.push("/authChoise");
  }
}
