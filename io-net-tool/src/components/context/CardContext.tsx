"use client";
import React, { ChangeEvent, ReactNode, createContext, useState } from "react";

interface CardContextProps {
  selectedCard: boolean;
  counter: number;
  isActive: boolean;
  handleCardClick: () => void;
  handleDoubleClick: () => void;
  handleSingleClick: () => void;
  handleSingleAndDoubleClick: () => void;
  handleDeselectCard: () => void;
}

const CardContext = createContext<CardContextProps>({
  selectedCard: false,
  counter: 0,
  isActive: false,
  handleCardClick: () => {},
  handleDoubleClick: () => {},
  handleSingleClick: () => {},
  handleSingleAndDoubleClick: () => {},
  handleDeselectCard: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

const CardContextProvider = ({ children }: ProviderProps) => {
  const [selectedCard, setSelectedCard] = useState(false);
  const [counter, setCounter] = useState(0);
  const [singleClicks, setSingleClicks] = useState(0);
  const [isActive, setIsActive] = useState(false);

  //authSession

  const handleCardClick = () => {
    setSelectedCard(!selectedCard);
    setCounter((prevCounter) => prevCounter + 1);
  };

  const handleDoubleClick = () => {
    if (!selectedCard) {
      // Increment counter only if the card is not already selected
      setCounter((prevCounter) => prevCounter + 1);
    }
  };

  //

  const handleSingleClick = () => {
    if (!selectedCard) {
      setSingleClicks((prevClicks) => prevClicks + 1);
      handleCardClick();
      setIsActive(true);
    }
  };

  const handleSingleAndDoubleClick = () => {
    if (!selectedCard) {
      setSingleClicks((prevClicks) => prevClicks + 1);
      handleCardClick();
    } else {
      handleDoubleClick();
    }
  };

  const handleDeselectCard = () => {
    setSelectedCard(false);
    if (counter > 0) {
      setCounter((prevCounter) => prevCounter - 1);
    } else {
      setIsActive(false); // Disable buttons if counter is 0
    }
  };

  const AppContextValues: CardContextProps = {
    counter,
    isActive,
    handleCardClick,
    handleDoubleClick,
    selectedCard,
    handleSingleClick,
    handleSingleAndDoubleClick,
    handleDeselectCard,
  };

  return (
    <CardContext.Provider value={AppContextValues}>
      {children}
    </CardContext.Provider>
  );
};

export { CardContext, CardContextProvider };
