"use client";
import React, { useContext, useState } from "react";
import DashboardMenuVm from "./DashboardMenuVm";
import { CardContext } from "./context/CardContext";

const DashboardMenuWorker = () => {
  const cardContext = useContext(CardContext);
  const { selectedCard } = cardContext;
  return (
    <div className="w-1/5 p-4 border-2 border-white shadow-lg h-80 min-h-full">
      <div className="flex flex-col  text-white text-center rounded-md h-full w-full cursor-pointer">
        {selectedCard ? (
          <>
            <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400">
              Worker
            </div>
            <div className="p-2 border-2 h-13 rounded-md border-white mb-4 hover:bg-cyan-600">
              Start New Worker
            </div>
            <div className="p-2 border-2 h-13 rounded-md border-white mb-4 hover:bg-cyan-600">
              Reset Containers & Images
            </div>
            <div className="p-2 border-2 h-13 rounded-md border-white mb-4 hover:bg-cyan-600">
              Launch Node
            </div>
            <div className="p-2 border-2 h-13 rounded-md border-white mb-4 hover:bg-cyan-600">
              Check Containers Status
            </div>
            <div className="p-2 border-2 h-13 rounded-md border-white mb-4 hover:bg-cyan-600">
              Restart Server
            </div>
            <div className="p-2 border-2 h-13 rounded-md border-white hover:bg-cyan-600">
              Check Status All Servers
            </div>
            <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400">
              VM
            </div>
            <div className=" flex mt-1  pt-2 text-gray-100">
              <p>Setup a Virtual Machine for QEMU Virtual CPU 2.5+</p>
            </div>
            <div className="mt-5">
              <DashboardMenuVm />
            </div>
          </>
        ) : (
          <h2>Select the server to perform an action</h2>
        )}
      </div>
    </div>
  );
};

export default DashboardMenuWorker;
