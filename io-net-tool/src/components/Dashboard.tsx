import { redirect } from "next/navigation";
import Container from "./Container";
import { getServerSession } from "next-auth/next";
import {
  authConfig,
  loginIsRequiredClient,
  loginIsRequiredServer,
} from "../../lib/auth";
import * as Api from "../app/api/index";

const Dashboard = async () => {
  // await loginIsRequiredServer();
  const session = await getServerSession(authConfig);
  const userId = session?.user.id;
  const serverData = await Api.server.getServer(userId);
  return (
    <div className="w-full min-h-full p-4 border-b-2 border-t-2 border-t-white border-b-cyan-100 shadow-lg  mb-8 h-80 min-h-72">
      <div className="w-full h-full flex flex-row gap-5">
        <Container serverData={serverData} />
      </div>
    </div>
  );
};

export default Dashboard;
