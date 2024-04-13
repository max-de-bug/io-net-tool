import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "../../lib/utils/cn";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "../../lib/auth";
import { NextAuthProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Io.net tool",
  description: "Io.net tool for managing nodes",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-black")}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
