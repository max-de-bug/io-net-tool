"use client";

import { SessionProvider } from "next-auth/react";

export const NextAuthProvider = async ({ children, session }) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};
