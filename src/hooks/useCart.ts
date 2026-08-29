import { useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product } from '../types';

function getCartStorageKey(merchantId: string): string {
  return merchantId ? `vendora_cart_${merchantId}` : '';
}

function loadCartFromStorage(merchantId: string): CartItem[] {
  if (!merchantId) return [];
  try {
    const key = getCartStorageKey(merchantId);
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed: CartItem[] = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Filter out any corrupt items or items belonging to a different merchant
        return parsed.filter(
          (item) => !item.product.merchantId || item.product.merchantId === merchantId
        );
      }
    }
  } catch (e) {
    console.warn('Failed to load cart from storage:', e);
  }
  return [];
}

export function useCart(merchantId: string = '') {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage(merchantId));

  // Reload or switch cart when merchantId changes
  useEffect(() => {
    setCart(loadCartFromStorage(merchantId));
  }, [merchantId]);

  // Persist cart updates to merchant-scoped key
  useEffect(() => {
    if (!merchantId) return;
    try {
      const key = getCartStorageKey(merchantId);
      if (cart.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(cart));
      }
    } catch (e) {
      console.warn('Failed to persist cart to storage:', e);
    }
  }, [cart, merchantId]);

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
