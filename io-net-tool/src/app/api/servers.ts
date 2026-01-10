"use server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "../../../lib/auth";
import { prisma } from "../../../prisma/prisma/prismaClient/client";
import { ServerValues } from "./dto";
import axios from "../../../core/axios";
import { revalidatePath } from "next/cache";

export const serverSaving = async (values: ServerValues) => {
  try {
    const session = await getServerSession(authConfig);
    const userId = session?.user.id;

    if (!userId) {
      throw new Error("Unauthorized: User not authenticated");
    }

    // Create a new server in Prisma (for frontend tracking)
    // Note: The actual server should be created via Django API which handles encryption
    const newServer = await prisma.server.create({
      data: {
        serverName: values.serverName,
        IP: values.IP,
        username: values.username,
        password: values.password, // TODO: Remove password from Prisma, use Django API only
        userId: userId,
      },
    });

    // Make a POST request to Django API to create server (handles encryption)
    const response = await axios.post("/api/servers/", {
      name: values.serverName,
      ip_address: values.IP,
      ssh_username: values.username,
      ssh_password: values.password,
      ssh_port: 22,
    });

    return { newServer, setupResponse: response.data };
  } catch (error: any) {
    // Handle any errors
    const errorMessage = error?.response?.data?.detail || error?.message || "Unknown error occurred";
    throw new Error(`Failed to save server: ${errorMessage}`);
  }
};

export const getServer = async () => {
  const session = await getServerSession(authConfig);
  const userId = session?.user.id;
  
  if (!userId) {
    return [];
  }
  
  try {
    // Find servers belonging to the user
    const servers = await prisma.server.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        serverName: true,
        IP: true,
        username: true,
        userId: true,
        createdAt: true,
        // Don't select password for security
      },
    });
    revalidatePath("/");
    return servers;
  } catch (error: any) {
    // Handle any errors
    const errorMessage = error?.message || "Unknown error occurred";
    throw new Error(`Failed to retrieve servers: ${errorMessage}`);
  }
};

export const deleteServer = async (id: string) => {
  try {
    const server = await prisma.server.delete({
      where: {
        id: id,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error(error);
  }
};
