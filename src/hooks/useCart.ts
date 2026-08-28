import { useState, useEffect, useMemo } from 'react';
import { CartItem, Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialData';

const CART_STORAGE_KEY = 'vendora_cart_items';

const DEFAULT_INITIAL_CART: CartItem[] = [
  {
    cartItemId: 'initial-1',
    product: INITIAL_PRODUCTS[0], // Chicken Adobo
    quantity: 1,
    selectedOptions: {
      rice: 'rice-white',
      spice: 'spice-spicy'
    },
    totalPrice: 270
  },
  {
    cartItemId: 'initial-2',
    product: INITIAL_PRODUCTS[4], // Floral Summer Dress
    quantity: 1,
    selectedOptions: {
      size: 'sz-m',
      color: 'col-red'
    },
    totalPrice: 599
  }
];

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load cart from storage, using defaults:', e);
    }
    return DEFAULT_INITIAL_CART;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to persist cart to storage:', e);
    }
  }, [cart]);

  const cartTotalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.totalPrice, 0),
    [cart]
  );

  const addToCart = (
    product: Product,
    quantity: number,
    selectedOptions: Record<string, string | string[]>,
    calculatedTotalPrice: number
  ) => {
    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product,
      quantity,
      selectedOptions,
      totalPrice: calculatedTotalPrice
    };
    setCart((prev) => [...prev, newItem]);
  };

  const quickAddToCart = (
    product: Product,
    onNeedsCustomization?: (p: Product) => void
  ) => {
    // If product has required option groups, trigger full customizer modal
    const hasRequired = product.optionGroups.some((g) => g.required);
    if (hasRequired && onNeedsCustomization) {
      onNeedsCustomization(product);
      return;
    }

    const newItem: CartItem = {
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      product,
      quantity: 1,
      selectedOptions: {},
      totalPrice: product.basePrice
    };
    setCart((prev) => [...prev, newItem]);
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId !== cartItemId) return item;
        const unitPrice = item.totalPrice / item.quantity;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: unitPrice * newQuantity
        };
      })
    );
  };

  const removeItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart,
    cartTotalItems,
    subtotal,
    addToCart,
    quickAddToCart,
    updateQuantity,
    removeItem,
    clearCart,
    setCart
  };
}
