import Image from "next/image";
import googleLogo from "@/public/google.png";
import githubLogo from "@/public/github.png";
import { getServerSession } from "next-auth";

import { redirect } from "next/navigation";

import { getCsrfToken } from "next-auth/react";
import { CredentialsForm } from "@/components/CredentialsForm";
import { authConfig } from "../../../lib/auth";
import {
  GithubSignInButton,
  GoogleSignInButton,
} from "@/components/AuthButtons";

export default async function SignInPage() {
  const session = await getServerSession(authConfig);

  console.log("Session: ", session);

  if (session) return redirect("/timeline");

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center mt-10 p-10 shadow-md">
        <h1 className="mt-10 mb-4 text-4xl font-bold">Sign In</h1>
        <GoogleSignInButton />
        <GithubSignInButton />
        <span className="text-2xl font-semibold text-white text-center mt-8">
          Or
        </span>
        {/* <CredentialsSignInButton /> */}
        <CredentialsForm />
      </div>
    </div>
  );
}
