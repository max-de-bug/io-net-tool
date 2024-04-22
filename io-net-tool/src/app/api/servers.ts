"use server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../../../lib/auth";
import { prisma } from "../../../prisma/prisma/prismaClient/client";
import { ServerValues } from "./dto";
import axios from "../../../core/axios";

export const serverSaving = async (values: ServerValues) => {
  try {
    const session = await getServerSession(authConfig);
    const userId = session?.user.id;

    console.log(userId);

    // Create a new server
    const newServer = await prisma.server.create({
      data: {
        serverName: values.serverName,
        IP: values.IP,
        username: values.username,
        password: values.password,
        userId: userId,
      },
    });

    // Make a POST request to setup the virtual machine
    const response = await axios.post("/setup-virtual-machine/", values);

    console.log("response", response);
    return { newServer, setupResponse: response.data };
  } catch (error) {
    // Handle any errors
    console.error("Error saving server:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

export const getServer = async () => {
  const session = await getServerSession(authConfig);
  const userId = session?.user.id;
  try {
    // Find servers belonging to the user
    const servers = await prisma.server.findMany({
      where: {
        userId: userId,
      },
    });
    return servers;
  } catch (error) {
    // Handle any errors
    console.error("Error retrieving servers:", error);
    throw error; // Re-throw the error for the caller to handle
  }
};
