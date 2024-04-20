"use client";
import { Loader } from "lucide-react";
import { useContext, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { AppContext } from "./context/AppContext";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { formSchema } from "../../lib/types";
import { date, z } from "zod";
import { useRouter } from "next/navigation";
import * as Api from "./../app/api";
import { ServerValues } from "@/app/api/dto";
import { useSession } from "next-auth/react";
import { loginIsRequiredClient, loginIsRequiredServer } from "../../lib/auth";

interface FormData {
  IP: number;
  username: string;
  password: string;
  serverName: string;
}

const ConnectionPopUp = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const appContext = useContext(AppContext);
  const {
    isOpen,
    handleUserChange,
    handleIPChange,
    handleServerNameChange,
    handlePasswordChange,
    handleOnSubmit,
    loading,
    setLoading,
    closePopup,
  } = appContext;

  const { handleSubmit, register } = useForm<FormData>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  // const userId = session?.user.id;
  const onSubmit: SubmitHandler<FormData> = async (
    values: z.infer<typeof formSchema>
  ) => {
    // setLoading(true); // Set loading to true when form is submitted
    console.log("Form submitted with values:", values);
    const serverInfo = await Api.server.serverSaving<ServerValues>(values);

    console.log(serverInfo);
  };
  return (
    <div className="relative">
      {isOpen && (
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full flex justify-center"
          >
            <div className="border-2 p-6 border-gray-500 fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center">
              <div className="bg-gray-200 p-2 rounded shadow-lg w-96 h-5/5">
                <div className="relative h-5 mb-2">
                  <button
                    className="absolute top-0 right-0 text-gray-500 hover:text-black focus:outline-none"
                    onClick={() => {
                      closePopup();
                    }}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-1">
                  <h2 className="text-black text-lg font-semibold mb-4">
                    Please provide credentials to your server
                  </h2>
                  <div className="flex flex-col gap-5  w-full">
                    <FormItem>
                      <FormLabel className="text-black">IP</FormLabel>
                      <FormControl>
                        <Input
                          {...register("IP", { required: true })}
                          placeholder="xxx.xx.xx.xx"
                          className="w-full px-3 py-2 border border-gray-300 rounded outline-0"
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem>
                      <FormLabel className="text-black">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...register("username", { required: true })}
                          placeholder="Username"
                          className="focus:outline-none w-full px-3 py-2 border border-gray-300 rounded"
                          type="text"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem>
                      <FormLabel className="text-black">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...register("password", { required: true })}
                          placeholder="Password"
                          className="focus:outline-none w-full px-3 py-2 border border-gray-300 rounded"
                          type="text"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem>
                      <FormLabel className="text-black">Server Name</FormLabel>
                      <FormControl>
                        <Input
                          {...register("serverName", { required: true })}
                          placeholder="Server Name"
                          className="focus:outline-none w-full px-3 py-2 border border-gray-300 rounded"
                          type="text"
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <div className="w-full h-full flex justify-center align-center">
                      {loading ? (
                        <Button type="submit" disabled={loading}>
                          {loading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : null}
                        </Button>
                      ) : (
                        <Button type="submit">Connect to the server</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ConnectionPopUp;
