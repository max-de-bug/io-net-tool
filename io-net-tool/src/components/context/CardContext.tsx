"use client";
import React, { ChangeEvent, ReactNode, createContext, useState } from "react";

interface CardContextProps {
  selectedCards: string[];
  clickedServerId: string | null;
  counter: number;
  isActive: boolean;
  changeColorServer: boolean;
  handleCardClick: () => void;
  handleDoubleClick: () => void;
  handleSingleClick: (id: string) => void;
  handleSingleAndDoubleClick: (id: string) => void;
  handleDeselectCard: () => void;
  colorStates: { [id: string]: boolean };
  setColorStates: React.Dispatch<
    React.SetStateAction<{ [id: string]: boolean }>
  >;
}

const CardContext = createContext<CardContextProps>({
  selectedCards: [],
  clickedServerId: "",
  counter: 0,
  isActive: false,
  changeColorServer: false,
  colorStates: { [""]: false },
  handleCardClick: () => {},
  handleDoubleClick: () => {},
  handleSingleClick: () => {},
  handleSingleAndDoubleClick: () => {},
  handleDeselectCard: () => {},
  setColorStates: () => {},
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
  const [colorStates, setColorStates] = useState<{ [id: string]: boolean }>({});
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
    setColorStates((prevColorStates) => ({
      ...prevColorStates,
      [id]: !prevColorStates[id], // Toggle color state for the clicked container
    }));

    if (!isSelected) {
      setSelectedCards((prevSelectedCards) => [...prevSelectedCards, id]); // Select if not already selected
      setCounter((prevCounter) => prevCounter + 1);
      setIsActive(true);
      setClickedServerId(id);
    } else {
      setSelectedCards((prevSelectedCards) =>
        prevSelectedCards.filter((cardId) => cardId !== id)
      );
      setCounter((prevCounter) => prevCounter - 1);
      setIsActive((prevIsActive) => (counter - 1 > 0 ? prevIsActive : false));
      setClickedServerId(null);
    }

    // Update color state for the clicked container only
  };

  const handleSingleAndDoubleClick = (id: string) => {
    // if (!selectedCards) {
    //   setSingleClicks((prevClicks) => prevClicks + 1);
    // }
    // if (clickedServerId === id) {
    //   setColorStates((prevColorStates) => ({
    //     ...prevColorStates,
    //     [id]: !prevColorStates[id],
    //   }));
    // }
    console.log("ss");
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
    setColorStates,
    colorStates,
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
