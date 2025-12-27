"use client";

import { Sidebar } from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 animate-pulse flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-primary animate-ping" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect("/authChoise");
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Sidebar />
      <main className="pl-64">
        {children}
      </main>
    </div>
  );
}

