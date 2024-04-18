"use client";
import React, { ChangeEvent, ReactNode, createContext, useState } from "react";

interface ServerContextProps {
  selectedCard: boolean;
  counter: number;
  handleCardClick: () => void;
  handleDoubleClick: () => void;
}

const ServerContext = createContext<ServerContextProps>({
  selectedCard: false,
  counter: 0,
  handleCardClick: () => {},
  handleDoubleClick: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

const ServerContextProvider = ({ children }: ProviderProps) => {
  const [selectedCard, setSelectedCard] = useState(false);
  const [counter, setCounter] = useState(0);

  //authSession

  const handleCardClick = () => {
    setSelectedCard(!selectedCard);
    setCounter((prevCounter) => prevCounter + 1);
  };

  const handleDoubleClick = () => {
    setSelectedCard(selectedCard);
    setCounter((prevCounter) => prevCounter - 1);
  };

  const AppContextValues: ServerContextProps = {
    counter,
    handleCardClick,
    handleDoubleClick,
    selectedCard,
  };

  return (
    <ServerContext.Provider value={AppContextValues}>
      {children}
    </ServerContext.Provider>
  );
};

export { ServerContext, ServerContextProvider };
