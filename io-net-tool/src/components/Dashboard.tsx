import Container from "./Container";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../../lib/auth";
import { getServer } from "@/app/api/servers";

const Dashboard = async () => {
  const serverData = await getServer();
  console.log("serverData", serverData);
  return (
    <div className="w-full min-h-full p-4 border-b-2 border-t-2 border-t-white border-b-cyan-100 shadow-lg  mb-8 h-80 min-h-72">
      <div className="w-full h-full flex flex-row gap-5">
        {serverData.length !== 0 ? (
          <Container serverData={serverData} />
        ) : (
          <div className="flex justify-center w-full mt-3 select-none">
            <h2 className="text-lg text-white font-semibold">
              Connect to the server
            </h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
