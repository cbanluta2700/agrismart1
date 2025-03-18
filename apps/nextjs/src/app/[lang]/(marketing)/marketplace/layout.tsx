"use client";

import React from "react";
import ReduxProvider from "@/redux/Provider";
import { ModalProvider } from "@/app/context/QuickViewModalContext";
import QuickViewModal from "./components/Common/QuickViewModal";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <ModalProvider>
        {children}
        <QuickViewModal />
      </ModalProvider>
    </ReduxProvider>
  );
}
