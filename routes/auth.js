import express from "express";
import { check } from "express-validator";
import { checkSignUp, checkLogin } from "../validators/validators.js";

import {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  postResetPassword,
  getResetPassword,
  getNewPasswordForm,
  postNewPasswordForm,
} from "../controllers/auth.js";

export const authRouter = express.Router();

//GET Methods

authRouter.get("/login", getLogin);

authRouter.get("/signup", getSignUp);

authRouter.get("/reset", getResetPassword);

authRouter.get("/reset/:token", getNewPasswordForm);

//POST Methods

authRouter.post("/login", checkLogin, postLogin);

authRouter.post("/signup", checkSignUp, postSignUp);

authRouter.post("/reset", postResetPassword);

authRouter.post("/update-password", postNewPasswordForm);

authRouter.post("/logout", postLogout);
