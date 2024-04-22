"use client";
import React, { ChangeEvent, ReactNode, createContext, useState } from "react";

interface CardContextProps {
  selectedCards: string[];
  clickedServerId: string;
  counter: number;
  isActive: boolean;
  changeColorServer: boolean;
  handleCardClick: () => void;
  handleDoubleClick: () => void;
  handleSingleClick: (id: string) => void;
  handleSingleAndDoubleClick: (id: string) => void;
  handleDeselectCard: () => void;
}

const CardContext = createContext<CardContextProps>({
  selectedCards: [],
  clickedServerId: "",
  counter: 0,
  isActive: false,
  changeColorServer: false,
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
  const [counter, setCounter] = useState(0);
  const [singleClicks, setSingleClicks] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [changeColorServer, setChangeColorServer] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [clickedServerId, setClickedServerId] = useState<string | null>(null);

  // const handleCardClick = () => {
  //   setSelectedCard(!selectedCard);
  //   setCounter((prevCounter) => prevCounter + 1);
  // };

  // const handleDoubleClick = () => {
  //   if (!selectedCard) {
  //     // Increment counter only if the card is not already selected
  //     setCounter((prevCounter) => prevCounter + 1);
  //   }
  // };

  //

  const handleSingleClick = (id: string) => {
    const isSelected = selectedCards.includes(id);
    // If it's not selected, add it to the selectedCards state and increment the counter
    if (!isSelected) {
      setSelectedCards((prevSelectedCards) => [...prevSelectedCards, id]);
      setCounter((prevCounter) => prevCounter + 1);
      setIsActive(true);
      setChangeColorServer(true);
    } else {
      setSelectedCards((prevSelectedCards) =>
        prevSelectedCards.filter((cardId) => cardId !== id)
      );
      setCounter((prevCounter) => prevCounter - 1);
      setIsActive((prevIsActive) => (counter - 1 > 0 ? prevIsActive : false));
      setClickedServerId(null);
      setChangeColorServer(false);
    }
  };
  const handleSingleAndDoubleClick = () => {
    if (!selectedCards) {
      setSingleClicks((prevClicks) => prevClicks + 1);
    }
  };

  // const handleDeselectCard = () => {
  //   setSelectedCard(false);
  //   if (counter > 0) {
  //     setCounter((prevCounter) => prevCounter - 1);
  //   } else {
  //     setIsActive(false); // Disable buttons if counter is 0
  //   }
  // };

  const AppContextValues: CardContextProps = {
    counter,
    isActive,
    clickedServerId,
    changeColorServer,
    // handleCardClick,
    // handleDoubleClick,
    // selectedCard,
    handleSingleClick,
    handleSingleAndDoubleClick,
    // handleDeselectCard,
  };

  return (
    <CardContext.Provider value={AppContextValues}>
      {children}
    </CardContext.Provider>
  );
};

export { CardContext, CardContextProvider };
