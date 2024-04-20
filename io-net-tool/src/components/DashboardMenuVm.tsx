"use client";
import React, { useContext, useState } from "react";
import { CardContext } from "./context/CardContext";

const DashboardMenuVm = () => {
  const cardContext = useContext(CardContext);
  const { selectedCard } = cardContext;
  return (
    <div className="flex flex-col text-white text-center rounded-md h-full w-full cursor-pointer">
      {selectedCard ? (
        <>
          <div className="p-2 border-2 h-13 rounded-md border-white mb-4 hover:bg-cyan-600">
            Setup Virtual machine
          </div>
          <div className="p-2 border-2 h-13 rounded-md border-white mb-4 hover:bg-cyan-600">
            Delete Virtual machine
          </div>
        </>
      ) : null}
    </div>
  );
};

export default DashboardMenuVm;
