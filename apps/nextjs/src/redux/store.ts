"use client";

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import wishlistReducer from "./features/wishlistSlice";
import quickViewReducer from "./features/quickViewSlice";
import productDetailsReducer from "./features/productDetails";
import { TypedUseSelectorHook, useSelector } from "react-redux";

// Configure the Redux store
export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    quickView: quickViewReducer,
    productDetails: productDetailsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Define types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Define typed selector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
