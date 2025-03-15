import { loginUser, logout, registerUser } from './auth';
import { loadProductsFromCart } from './cart';
import {
  getProductBySlug,
  getProductsByPage,
  createOrUpdateProduct,
  deleteProductImage,
} from './products';

export const server = {
  // actions

  // Auth
  loginUser,
  logout,
  registerUser,

  //Products,
  getProductsByPage,
  getProductBySlug,
  createOrUpdateProduct,

  //Cart
  loadProductsFromCart,

  //Images
  deleteProductImage,
};
