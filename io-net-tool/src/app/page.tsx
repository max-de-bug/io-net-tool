"use client";
import ConnectionPopUp from "@/components/ConnectionPopUp";
import Dashboard from "@/components/Dashboard";
import DashboardMenu from "@/components/DashboardMenu";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import StatusMenu from "@/components/StatusMenu";
import { AppContextProvider } from "@/components/context/AppContext";
import { SessionProvider } from "next-auth/react";
// import Auth from "./auth/auth";

export default function Home({ session }) {
  return (
    <SessionProvider session={session}>
      {/* <Auth /> */}
      <AppContextProvider>
        <main className="p-2">
          <ConnectionPopUp />
          <NavBar />
          <StatusMenu />
          <div className="flex mb-5 h-screen">
            <DashboardMenu />
            <Dashboard />
          </div>
          <Footer />
        </main>
      </AppContextProvider>
    </SessionProvider>
  );
}
