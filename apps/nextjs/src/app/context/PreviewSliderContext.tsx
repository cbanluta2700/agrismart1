"use client";

import React, { createContext, useContext, useState } from "react";

// Define the shape of our context
interface PreviewSliderContextType {
  isPreviewModalOpen: boolean;
  openPreviewModal: () => void;
  closePreviewModal: () => void;
}

// Create the context with default values
const PreviewSliderContext = createContext<PreviewSliderContextType>({
  isPreviewModalOpen: false,
  openPreviewModal: () => {},
  closePreviewModal: () => {},
});

// Provider component to wrap our app
export const PreviewSliderProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const openPreviewModal = () => setIsPreviewModalOpen(true);
  const closePreviewModal = () => setIsPreviewModalOpen(false);

  return (
    <PreviewSliderContext.Provider value={{ isPreviewModalOpen, openPreviewModal, closePreviewModal }}>
      {children}
    </PreviewSliderContext.Provider>
  );
};

// Hook to use the preview slider context
export const usePreviewSlider = () => useContext(PreviewSliderContext);
