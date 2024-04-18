import { CredentialsForm } from "@/components/CredentialsForm";
import { getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { authConfig } from "../../../lib/auth";

const EmailAuth = async () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen py-2">
      <div className="flex flex-col items-center mt-10 p-10 shadow-md">
        <CredentialsForm />
      </div>
      <span className="text-white">or</span>
      <div className="text-center text-md text-gray">
        <a className="cursor-pointer text-white underline" href="/authChoise">
          Go back
        </a>
      </div>
    </div>
  );
};

export default EmailAuth;
