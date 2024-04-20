"use server";

import { getServerSession } from "next-auth/next";
import { authConfig } from "../../../lib/auth";
import { prisma } from "../../../prisma/prisma/prismaClient/client";
import { ServerValues } from "./dto";

export const serverSaving = async (values: ServerValues) => {
  const session = await getServerSession(authConfig);
  const userId = session?.user.id;
  console.log(userId);
  const newServer = await prisma.server.create({
    data: {
      serverName: values.serverName,
      IP: Number(values.IP),
      username: values.username,
      password: values.password,
      OauthUserId: userId,
    },
  });
  return newServer;
};
