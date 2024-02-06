import express from "express";
import { __dirname } from "../app.js";
import {
  getAddProduct,
  postAddedProduct,
  getAdminBooks,
  getEditBook,
  postEditBook,
  // deleteBook,
  deleteBookAsync,
} from "../controllers/admin.js";
//Check router is authorized
import { isAuthRouter } from "../middleware/isAuth.js";
import { checkAdminForm } from "../validators/validators.js";

export const adminRouter = express.Router();

//  /admin/add-products => GET
/* 
the request will travel through routes from left to right.
So the request which reaches route like /add-book and goes into that isAuthRouter middleware first and in the isAuthRouter middleware,

we might be redirecting and we don't call next,
hence the request would never continue to that controller action but if we make it past the if check here in the middleware, we do call next, so the next middleware in line will be called and the next middleware in line would be our get add book controller action here. And this means that we can now add this isAuthRouter middleware to all the routes here because these routes actually all require authentication
*/
adminRouter.get("/add-book", isAuthRouter, getAddProduct);
adminRouter.get("/books", isAuthRouter, getAdminBooks);
adminRouter.get("/edit-book/:bookId", isAuthRouter, getEditBook);

// /admin/add-products => POST

adminRouter.post(
  "/add-books",
  [isAuthRouter, checkAdminForm],
  postAddedProduct
);
adminRouter.post("/edit-books", [isAuthRouter, checkAdminForm], postEditBook);

// adminRouter.post("/delete-book/:bookId", isAuthRouter, deleteBook);

//using asynchronous js to delete book without reloading page; so we can use delete method
adminRouter.delete("/delete-book/:bookId", isAuthRouter, deleteBookAsync);
