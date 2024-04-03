"use client";
import React, { useContext, useState } from "react";
import { AppContext } from "./context/AppContext";

const DashboardMenu = () => {
  const appContext = useContext(AppContext);
  const { selectedCard } = appContext;
  return (
    <div className="w-1/5 p-4 border-2 border-white shadow-lg h-80 min-h-full">
      <div className="flex flex-col text-white text-center rounded-md h-full w-full cursor-pointer">
        {selectedCard ? (
          <>
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
          </>
        ) : (
          <h2>Select the server to perform an action</h2>
        )}
      </div>
    </div>
  );
};

export default DashboardMenu;
