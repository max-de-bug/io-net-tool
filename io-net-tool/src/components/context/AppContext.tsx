"use client"
import React, { ChangeEvent, ReactNode, createContext, useState } from "react";

interface AppContextProps {
    isOpen: boolean;
    login: string;
    password: string;
    openPopup: () => void;
    closePopup: () => void;
    handleLoginChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handlePasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleOnSubmit: () => void;
  };

const AppContext = createContext<AppContextProps>({
    isOpen: false,
    login: "",
    password: "",
    openPopup: () => {},
    closePopup: () => {},
    handleLoginChange: () => {},
    handlePasswordChange: () => {},
    handleOnSubmit: () => {},
});

interface ProviderProps {
    children: ReactNode;
}

const AppContextProvider = ({ children }:ProviderProps ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const openPopup = () => {
        setIsOpen(true);
    };

    const closePopup = () => {
        setIsOpen(false);
    };

    const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleOnSubmit = () => {
        // Handle form submission logic here
        console.log("Submitting form...");
      };


    const AppContextValues: AppContextProps = {
        isOpen,
        login,
        password,
        openPopup,
        closePopup,
        handleLoginChange,
        handlePasswordChange,
        handleOnSubmit,
    };

    return (
        <AppContext.Provider 
        value = {
            AppContextValues
        }
>
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppContextProvider };
