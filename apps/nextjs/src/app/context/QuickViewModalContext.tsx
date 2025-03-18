"use client";

import React, { createContext, useContext, useState } from "react";

// Define the shape of our context
interface ModalContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// Create the context with default values
const ModalContext = createContext<ModalContextType>({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

// Provider component to wrap our app
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook to use the modal context
export const useModalContext = () => useContext(ModalContext);
