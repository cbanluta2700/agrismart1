"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

interface ProductDetailsState {
  product: Product | null;
}

const initialState: ProductDetailsState = {
  product: null,
};

const productDetailsSlice = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (state, action: PayloadAction<Product>) => {
      state.product = action.payload;
    },
    resetProductDetails: (state) => {
      state.product = null;
    },
  },
});

export const { updateproductDetails, resetProductDetails } = productDetailsSlice.actions;
export default productDetailsSlice.reducer;
