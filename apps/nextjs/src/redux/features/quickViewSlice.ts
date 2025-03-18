"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

interface QuickViewState {
  item: Product | null;
}

const initialState: QuickViewState = {
  item: null,
};

const quickViewSlice = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (state, action: PayloadAction<Product>) => {
      state.item = action.payload;
    },
    resetQuickView: (state) => {
      state.item = null;
    },
  },
});

export const { updateQuickView, resetQuickView } = quickViewSlice.actions;
export default quickViewSlice.reducer;
