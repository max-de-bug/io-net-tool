import { NextAuthOptions, User, getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "../prisma/prisma/prismaClient/client";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      type: "credentials",
      id: "credentials",
      name: "Sign in",
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
            const { password, createdAt, id, ...dbUserWithoutPassword } =
              dbUser;
            return dbUserWithoutPassword as User;
          }
        }

        // return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      console.log(profile?.email);

      if (!profile?.email) {
        // Handle missing email case (return null or throw an error)
        console.error("Email not found in the profile object");
        return null; // Or throw an appropriate error
      }

      const dbUser = await prisma.oauthUser.findFirst({
        where: { email: profile.email },
      });

      if (dbUser) {
        return dbUser; // Existing user found, return user data
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
  //@ts-ignore
  async jwt({ token, account }) {
    console.log("token");
    console.log(token);
    console.log(account);
  },
  //@ts-ignore
  async session({ session }) {
    const sessionUser = prisma.oauthUser.findFirst({
      where: { email: session.user.email },
    });

    if (sessionUser) {
      session.user.id = sessionUser.id;
    }

    return session;
  },
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  console.log(session);
  if (!session) return redirect("/authChoise");
}

export function loginIsRequiredClient() {
  if (typeof window !== "undefined") {
    const session = useSession();
    const router = useRouter();
    if (!session) router.push("/authChoise");
  }
}
