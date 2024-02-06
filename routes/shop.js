import express from "express";
// import path from "path";
import {
  getBooks,
  getCart,
  getBookDetails,
  getCheckout,
  getIndex,
  getOrders,
  postClearOrders,
  postAddToCart,
  postRemoveOneToCart,
  postDeleteCartItem,
  getInvoice,
  getCheckoutSuccess,
} from "../controllers/shop.js";
// import { __dirname } from "../app.js";
//Check router is authorized
import { isAuthRouter } from "../middleware/isAuth.js";

export const shopRouter = express.Router();

shopRouter.get("/", getIndex);

shopRouter.get("/books", getBooks);

shopRouter.get("/cart", isAuthRouter, getCart);

shopRouter.post("/add-to-cart", isAuthRouter, postAddToCart);

shopRouter.post("/cart-removeOne-item", isAuthRouter, postRemoveOneToCart);

shopRouter.get("/orders", isAuthRouter, getOrders);

// shopRouter.post("/create-order", isAuthRouter, postOrder);

shopRouter.post("/clear-orders", isAuthRouter, postClearOrders);

shopRouter.get("/orders/:orderId", isAuthRouter, getInvoice);

shopRouter.get("/checkout", isAuthRouter, getCheckout);

shopRouter.get("/checkout/success", isAuthRouter, getCheckoutSuccess);

shopRouter.get("/checkout/cancel", isAuthRouter, getCheckout);

shopRouter.get("/books/:bookId", getBookDetails);

shopRouter.post("/cart-delete-item", isAuthRouter, postDeleteCartItem);
