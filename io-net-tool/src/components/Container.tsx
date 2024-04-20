"use client";
import { useContext, useState } from "react";
import { AppContext } from "./context/AppContext";
import { CardContext } from "./context/CardContext";

const Container = () => {
  const cardContext = useContext(CardContext);
  const { selectedCard, handleSingleClick, handleSingleAndDoubleClick } =
    cardContext;

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

        <p>Server Name: MyServer</p>
        <p>Username: Konor</p>
        <p>IP: 192.123.203</p>
      </div>
    </div>
  );
};

export default Container;
