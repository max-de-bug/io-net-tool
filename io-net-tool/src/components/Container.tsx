"use client";
import { useContext, useState } from "react";
import { CardContext } from "./context/CardContext";

interface ServerData {
  id: string;
  serverName: string;
  username: string;
  IP: string;
}

const Container = ({ serverData }: { serverData: ServerData[] }) => {
  const cardContext = useContext(CardContext);
  const {
    selectedCards,
    handleSingleClick,
    handleSingleAndDoubleClick,
    clickedServerId,
    isActive,
    changeColorServer,
    colorStates,
    setColorStates,
  } = cardContext;

  return (
    <div className="flex flex-col gap-5 w-full select-none">
      {serverData.map((server) => (
        <div
          key={server.id}
          className={`bg-black border-2 border-cyan-100 rounded-lg p-4 h-16 w-full text-white cursor-pointer ${
            selectedCards?.includes(server.id) || colorStates[server.id] // Check color state from context
              ? "bg-cyan-600"
              : ""
          }`}
          onClick={() => {
            handleSingleClick(server.id);
            // Toggle color state for the clicked container
          }}
          onDoubleClick={() => handleSingleAndDoubleClick(server.id)}
        >
          <div className="flex justify-between">
            <p className="text-lg font-bold mb-4">Status</p>
            <p>Server Name: {server.serverName}</p>
            <p>Username: {server.username}</p>
            <p>IP: {server.IP}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Container;
