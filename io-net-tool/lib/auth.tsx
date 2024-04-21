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
    async session({ session }) {
      const sessionUser = await prisma.oauthUser.findFirst({
        where: { email: session.user.email },
      });
      session.user.id = sessionUser?.id;
      return session;
    },
    async signIn({ profile, credentials }) {
      // Check if credentials are provided
      if (credentials) {
        // Check if a user with the provided email exists in the database
        const dbUser = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        if (!dbUser) {
          // If the user doesn't exist, create a new user
          const hashedPassword = await bcrypt.hash(credentials.password, 10); // Hash the password
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              // You may add other fields if necessary
            },
          });
          return newUser;
        } else {
          // If the user already exists, compare the provided password with the stored password
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
      }

      // Check if the user exists in the database based on the OAuth profile
      const dbUser = await prisma.oauthUser.findFirst({
        where: { email: profile.email },
      });

      if (dbUser) {
        // Existing user found, return user data
        return dbUser;
      }

      // Create a new user if not found (assuming this is the desired behavior)
      const newUser = await prisma.oauthUser.create({
        data: {
          email: profile.email,
          name: profile.name,
        },
      });

      return newUser; // Return the newly created user
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
