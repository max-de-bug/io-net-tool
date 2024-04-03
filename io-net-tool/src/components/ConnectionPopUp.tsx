"use client";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { AppContext } from "./context/AppContext";

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const ConnectionPopUp = () => {
  const appContext = useContext(AppContext);
  const {
    isOpen,
    login,
    password,
    handleUserChange,
    handleIPChange,
    handleServerNameChange,
    handlePasswordChange,
    handleOnSubmit,
    closePopup,
  } = appContext;

  // Initialize useForm hook
  const { handleSubmit } = useForm();

  const onSubmit = (data) => {
    // Handle form submission here
    console.log(data);
  };

  return (
    <div className="relative">
      {isOpen && (
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="border-2 p-6 border-gray-500 fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center">
            <div className="bg-gray-200 p-2 rounded shadow-lg w-96 h-4/5">
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
                        value={login}
                        onChange={handleIPChange}
                        placeholder="xx.xxx.xxx:xxxx"
                        className="w-full px-3 py-2 border border-gray-300 rounded outline-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-black">User</FormLabel>
                    <FormControl>
                      <Input
                        value={password}
                        onChange={handleUserChange}
                        placeholder="User"
                        className="focus:outline-none w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-black">Password</FormLabel>
                    <FormControl>
                      <Input
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="Password"
                        className="focus:outline-none w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <FormItem>
                    <FormLabel className="text-black">Server Name</FormLabel>
                    <FormControl>
                      <Input
                        value={password}
                        onChange={handleServerNameChange}
                        placeholder="Server Name"
                        className="focus:outline-none w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  <div className="w-full h-full flex justify-center align-center">
                    <Button type="submit">Connect to the server</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}
    </div>
  );
};

export default ConnectionPopUp;
