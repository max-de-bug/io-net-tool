"use client";
import React, { ChangeEvent, ReactNode, createContext, useState } from "react";
import { number } from "zod";

interface AppContextProps {
  isOpen: boolean;
  selectedCard: boolean;
  login: string;
  password: string;
  counter: number;
  openPopup: () => void;
  closePopup: () => void;
  handleIPChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUserChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleServerNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleCardClick: () => void;
  handleDoubleClick: () => void;
  handleOnSubmit: () => void;
}

const AppContext = createContext<AppContextProps>({
  isOpen: false,
  selectedCard: false,
  login: "",
  password: "",
  counter: 0,
  openPopup: () => {},
  closePopup: () => {},
  handleUserChange: () => {},
  handlePasswordChange: () => {},
  handleIPChange: () => {},
  handleServerNameChange: () => {},
  handleCardClick: () => {},
  handleDoubleClick: () => {},
  handleOnSubmit: () => {},
});

interface ProviderProps {
  children: ReactNode;
}

const AppContextProvider = ({ children }: ProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [login, setUser] = useState("");
  const [IP, setIP] = useState("");
  const [password, setPassword] = useState("");
  const [ServerName, setServerName] = useState("");
  const [selectedCard, setSelectedCard] = useState(false);
  const [counter, setCounter] = useState(0);

  const openPopup = () => {
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  const handleUserChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  const handleIPChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIP(e.target.value);
  };

  const handleServerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServerName(e.target.value);
  };

  const handleCardClick = () => {
    setSelectedCard(!selectedCard);
    setCounter((prevCounter) => prevCounter + 1);
  };

  const handleDoubleClick = () => {
    setSelectedCard(selectedCard);
    setCounter((prevCounter) => prevCounter - 1);
  };

  const handleOnSubmit = () => {
    // Handle form submission logic here
    console.log("Submitting form...");
  };

  const AppContextValues: AppContextProps = {
    isOpen,
    login,
    password,
    counter,
    openPopup,
    closePopup,
    handleUserChange,
    handlePasswordChange,
    handleIPChange,
    handleServerNameChange,
    handleOnSubmit,
    handleCardClick,
    handleDoubleClick,
    selectedCard,
  };

  return (
    <AppContext.Provider value={AppContextValues}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
