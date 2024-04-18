"use client";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import { ServerContext } from "./context/ServerContext";

const Container = () => {
  const serverContext = useContext(ServerContext);
  const { selectedCard, handleCardClick, handleDoubleClick } = serverContext;

  return (
    <div
      className={`bg-black border-2 border-cyan-100 rounded-lg p-4 h-16 w-full text-white cursor-pointer hover:bg-cyan-600 ${
        selectedCard ? "bg-cyan-600" : "" // Apply additional styling when selected
      }`}
      onClick={() => handleCardClick()}
    >
      <div className="flex justify-between">
        <h3 className="text-lg font-bold mb-4">Status</h3>

        <p>Server Name: MyServer</p>
        <p>User: Konor</p>
        <p>IP: 192.123.203</p>
      </div>
    </div>
  );
};

export default Container;
