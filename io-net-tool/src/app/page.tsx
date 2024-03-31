import ConnectionPopUp from "@/components/ConnectionPopUp";
import Dashboard from "@/components/Dashboard";
import DashboardMenu from "@/components/DashboardMenu";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { AppContextProvider } from "@/components/context/AppContext";
import Image from "next/image";

export default function Home() {
  return (
      <AppContextProvider>
    <main className="p-2">
      <ConnectionPopUp />
      <NavBar />
      <div className="flex mb-5 h-screen	">

      <DashboardMenu />
     <Dashboard />
      </div>
      <Footer />
    </main>
    </AppContextProvider>
  );
}
