import { z } from "zod";

export const formSchema = z.object({
  IP: z.string().min(1, "IP is required"),
  login: z.string().min(1, "Login is required"),
  password: z.string().min(1, "Password is required"),
  serverName: z.string().min(1, "Server Name is required"),
});
