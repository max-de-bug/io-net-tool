"use client";
import { useContext, useState } from "react";
import { AppContext } from "./context/AppContext";
import { CardContext } from "./context/CardContext";
import { useSession } from "next-auth/react";

const Container = ({ serverData }) => {
  const cardContext = useContext(CardContext);
  const { selectedCard, handleSingleClick, handleSingleAndDoubleClick } =
    cardContext;
  const { data: session, status } = useSession();
  const userId = session?.user.id;
  const { serverName, username, ip } = serverData || {};
  // State to track the number of single clicks
  return (
    <div
      className={`bg-black border-2 border-cyan-100 rounded-lg p-4 h-16 w-full text-white cursor-pointer hover:bg-cyan-600 ${
        selectedCard ? "bg-cyan-600" : ""
      }`}
      onClick={handleSingleClick} // Handle single-click
      onDoubleClick={handleSingleAndDoubleClick} // Handle double-click
    >
      <div className="flex justify-between">
        <h3 className="text-lg font-bold mb-4">Status</h3>

        <p>Server Name: {serverName}</p>
        <p>Username: {username}</p>
        <p>IP: {ip}</p>
      </div>
    </div>
  );
};

export default Container;
