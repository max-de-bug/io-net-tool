"use client"
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { AppContext } from "./context/AppContext";

import { Form, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";


const ConnectionPopUp = () => {
  const appContext = useContext(AppContext);
  const { isOpen, login, password, handleLoginChange, handlePasswordChange, handleOnSubmit, } = appContext;




  return (
    <div className="relative">
      {isOpen && (
        <div className="border-2 border-gray-500 fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-gray-200 p-8 rounded shadow-lg w-90 h-72">
            <h2 className="text-black text-lg font-semibold mb-4">Please provide credentials to your server</h2>
            <Form>
              <div className="flex flex-col gap-5 mb-5 w-full">
                <FormItem>
                  <FormLabel className="text-white">Login</FormLabel>
                  <FormControl>
                    <Input value={login} onChange={handleLoginChange} placeholder="Login" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input value={password} onChange={handlePasswordChange} placeholder="Password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
              <div className="w-full h-full flex justify-center align-center">
                <Button type="submit">Connect to the server</Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionPopUp;
