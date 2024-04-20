import { z } from "zod";

export const formSchema = z.object({
  IP: z.number().min(1, "IP is required"),
  username: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
  serverName: z.string().min(1, "Server Name is required"),
});
