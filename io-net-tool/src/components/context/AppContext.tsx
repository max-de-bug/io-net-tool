"use client";
import React, { ChangeEvent, ReactNode, createContext, useState } from "react";

interface AppContextProps {
  isOpen: boolean;
  selectedCard: boolean;
  login: string;
  password: string;
  IP: number;
  serverName: string;
  counter: number;
  loading: boolean;
  setLoading: (loading: boolean) => void;
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
  IP: 0,
  serverName: "",
  counter: 0,
  loading: false,
  setLoading: () => {},
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
  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [login, setUser] = useState("");
  const [IP, setIP] = useState(0);
  const [password, setPassword] = useState("");
  const [serverName, setServerName] = useState("");
  const [selectedCard, setSelectedCard] = useState(false);
  const [counter, setCounter] = useState(0);

  //authSession

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

  const handleOnSubmit = ({ data }) => {
    console.log("Submitting form...", data);
  };

  const AppContextValues: AppContextProps = {
    isOpen,
    login,
    password,
    IP,
    serverName,
    counter,
    loading,
    setLoading,
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
