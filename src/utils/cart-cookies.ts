import type { CartItem } from '@/interfaces';
import Cookies from 'js-cookie';

export const getCart = (): CartItem[] => {
  const cart = JSON.parse(Cookies.get('cart') ?? '[]');

  return cart;
};

export const addItemToCart = (cartItem: CartItem): CartItem[] => {
  const cart = getCart();

  const itemInCart = cart.find(
    (item) =>
      item.productId === cartItem.productId && item.size === cartItem.size
  );

  if (itemInCart) {
    itemInCart.quantity += cartItem.quantity;
  } else {
    cart.push(cartItem);
  }

  Cookies.set('cart', JSON.stringify(cart));

  return cart;
};

export const removeItem = (productId: string, size: string): CartItem[] => {
  const cart = getCart();

  const newCart = cart.filter(
    (item) => item.productId !== productId || item.size !== size
  );

  Cookies.set('cart', JSON.stringify(newCart));

  return newCart;
};
