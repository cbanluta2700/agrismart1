"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { type Product } from "./types/product";

// Types
type CartItem = Product & { quantity: number };
type WishlistItem = Product;

type ProductState = {
  cart: CartItem[];
  wishlist: WishlistItem[];
  quickView: Product | null;
};

type ProductAction =
  | { type: "ADD_TO_CART"; payload: Product; quantity?: number }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "ADD_TO_WISHLIST"; payload: Product }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "SET_QUICK_VIEW"; payload: Product | null };

type ProductContextType = {
  state: ProductState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  setQuickView: (product: Product | null) => void;
  getTotalCartPrice: () => number;
  getTotalCartItems: () => number;
};

// Initial state
const initialState: ProductState = {
  cart: [],
  wishlist: [],
  quickView: null,
};

// Create context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Reducer function
function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const quantity = action.quantity || 1;
      const existingItem = state.cart.find((item) => item.id === action.payload.id);

      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity }],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case "CLEAR_CART":
      return {
        ...state,
        cart: [],
      };

    case "ADD_TO_WISHLIST": {
      const existingItem = state.wishlist.find((item) => item.id === action.payload.id);

      if (existingItem) {
        return state;
      }

      return {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      };
    }

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlist: state.wishlist.filter((item) => item.id !== action.payload),
      };

    case "SET_QUICK_VIEW":
      return {
        ...state,
        quickView: action.payload,
      };

    default:
      return state;
  }
}

// Provider component
export function ProductProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Load state from localStorage on initialization
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("agrismart_cart");
      const savedWishlist = localStorage.getItem("agrismart_wishlist");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          parsedCart.forEach((item) => {
            dispatch({ type: "ADD_TO_CART", payload: item, quantity: item.quantity });
          });
        }
      }

      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          parsedWishlist.forEach((item) => {
            dispatch({ type: "ADD_TO_WISHLIST", payload: item });
          });
        }
      }
    } catch (error) {
      console.error("Failed to load cart/wishlist from localStorage:", error);
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    localStorage.setItem("agrismart_cart", JSON.stringify(state.cart));
    localStorage.setItem("agrismart_wishlist", JSON.stringify(state.wishlist));
  }, [state.cart, state.wishlist]);

  // Context actions
  const addToCart = (product: Product, quantity?: number) => {
    dispatch({ type: "ADD_TO_CART", payload: product, quantity });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: productId });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    dispatch({
      type: "UPDATE_CART_QUANTITY",
      payload: { id: productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const addToWishlist = (product: Product) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: product });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });
  };

  const setQuickView = (product: Product | null) => {
    dispatch({ type: "SET_QUICK_VIEW", payload: product });
  };

  // Helper functions
  const getTotalCartPrice = (): number => {
    return state.cart.reduce((total, item) => {
      const price = item.price.discountedPrice || item.price.amount;
      return total + price * item.quantity;
    }, 0);
  };

  const getTotalCartItems = (): number => {
    return state.cart.reduce((total, item) => total + item.quantity, 0);
  };

  const contextValue: ProductContextType = {
    state,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    setQuickView,
    getTotalCartPrice,
    getTotalCartItems,
  };

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
}

// Custom hook to use the context
export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
}
