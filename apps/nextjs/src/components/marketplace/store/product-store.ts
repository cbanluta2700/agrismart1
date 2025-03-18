import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types/product';

// Types
type CartItem = Product & { quantity: number };
type WishlistItem = Product;

interface ProductState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  quickView: Product | null;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Wishlist actions
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  
  // QuickView actions
  setQuickView: (product: Product | null) => void;
  
  // Helpers
  getTotalCartPrice: () => number;
  getTotalCartItems: () => number;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      quickView: null,
      
      // Cart actions
      addToCart: (product: Product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ cart: [...cart, { ...product, quantity }] });
        }
      },
      
      removeFromCart: (productId: string) => {
        const { cart } = get();
        set({ cart: cart.filter(item => item.id !== productId) });
      },
      
      updateCartItemQuantity: (productId: string, quantity: number) => {
        const { cart } = get();
        set({
          cart: cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => set({ cart: [] }),
      
      // Wishlist actions
      addToWishlist: (product: Product) => {
        const { wishlist } = get();
        const existingItem = wishlist.find(item => item.id === product.id);
        
        if (!existingItem) {
          set({ wishlist: [...wishlist, product] });
        }
      },
      
      removeFromWishlist: (productId: string) => {
        const { wishlist } = get();
        set({ wishlist: wishlist.filter(item => item.id !== productId) });
      },
      
      // QuickView actions
      setQuickView: (product: Product | null) => set({ quickView: product }),
      
      // Helpers
      getTotalCartPrice: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
          const price = item.price.discountedPrice || item.price.amount;
          return total + price * item.quantity;
        }, 0);
      },
      
      getTotalCartItems: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'agrismart-product-store',
      // Only persist cart and wishlist, not the quickView state
      partialize: (state) => state,
    }
  )
);
