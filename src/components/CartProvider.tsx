'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  bookId: string;
  title: string;
  coverImage: string;
  author: string;
  price: number;
  quantity: number;
  slug: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, qty: number) => void;
  clearCart: () => void;
  isInCart: (bookId: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);
const CART_KEY = 'gg_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.bookId === newItem.bookId);
      if (exists) {
        return prev.map((i) =>
          i.bookId === newItem.bookId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = (bookId: string) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  };

  const updateQuantity = (bookId: string, qty: number) => {
    if (qty <= 0) return removeItem(bookId);
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const isInCart = (bookId: string) => items.some((i) => i.bookId === bookId);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
