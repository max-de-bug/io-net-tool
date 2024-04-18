"use client";

import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import { ServerActions } from "./ServerAction";
import { ServerContext } from "./context/ServerContext";

const StatusMenu = () => {
  const serverContext = useContext(ServerContext);
  const { counter } = serverContext;
  return (
    <>
      <div className="flex flex-row items-center gap-5 overflow-x-auto p-4 pb-2 border-x-2 border-white">
        <h2 className="text-base text-gray-300">Status of nodes:</h2>
        <a
          data-testid="CategoryMenu_running"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-green-300 text-light-300 h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Running</span>
        </a>
        <a
          data-testid="CategoryMenu_paused"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-orange-400 text-orange h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Paused</span>
        </a>
        <a
          data-testid="CategoryMenu_inactive"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-red-400 text-red h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Inactive</span>
        </a>
        <a
          data-testid="CategoryMenu_failed"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-red-600 text-red h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Failed</span>
        </a>
        <a
          data-testid="CategoryMenu_terminated"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-red-600 text-red h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Terminated</span>
        </a>
        <a
          data-testid="CategoryMenu_unsupported"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-red-600 text-red h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Unsupported</span>
        </a>
        <a
          data-testid="CategoryMenu_blocked"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-red-600 text-red h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Blocked</span>
        </a>
        <a
          data-testid="CategoryMenu_restartRequired"
          className="flex select-none flex-row items-center gap-2 whitespace-nowrap cursor-pointer text-gray hover:text-black dark:hover:text-white"
        >
          <span className="bg-red-600 text-red h-[10px] w-[10px] rounded-full"></span>
          <span className="text-xs text-gray-300">Restart required</span>
        </a>
        <div className="flex justify-center content-center border-l-2 border-white p-2">
          <p className="text-base text-gray-300">Servers selected: {counter}</p>
        </div>
        <ServerActions />
      </div>
    </>
  );
};

export default StatusMenu;
