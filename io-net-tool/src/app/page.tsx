"use client";
import ConnectionPopUp from "@/components/ConnectionPopUp";
import Dashboard from "@/components/Dashboard";
import DashboardMenuVm from "@/components/DashboardMenuVm";
import DashboardMenuWorker from "@/components/DashboardMenuWorker";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import StatusMenu from "@/components/StatusMenu";
import { AppContextProvider } from "@/components/context/AppContext";
import { CardContextProvider } from "@/components/context/CardContext";
// import Auth from "./auth/auth";

export default function Home() {
  return (
    <>
      <AppContextProvider>
        <CardContextProvider>
          <main className="p-2">
            <ConnectionPopUp />
            <NavBar />
            <StatusMenu />
            <div className="flex mb-5 h-screen">
              <DashboardMenuWorker />
              <Dashboard />
            </div>
            <Footer />
          </main>
        </CardContextProvider>
      </AppContextProvider>
    </>
  );
}
