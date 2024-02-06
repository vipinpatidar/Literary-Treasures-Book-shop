import bcrypt from "bcryptjs";
import { User } from "../models/user.js";
import crypto from "crypto";
import { validationResult } from "express-validator";

export const getLogin = (req, res) => {
  res.set({ Cache: "no-cache" });
  res.render("auth/login.ejs", {
    pageTitle: "login Here",
    path: "/login",
    errorMessage: req.flash("error")[0],
    validateErrorMsg: [],
    oldInputValue: {
      email: "",
      password: "",
    },
  });
};

export const postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // validate email Result form router middleware
    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.status(422).render("auth/login.ejs", {
        pageTitle: "login Here",
        path: "/login",
        errorMessage: error.array()[0].msg,
        validateErrorMsg: error.array(),
        oldInputValue: {
          email: email,
          password: password,
        },
      });
    }

    const user = await User.findOne({ email: email });

    const doMatch = await bcrypt.compare(password, user.password);

    if (doMatch) {
      req.session.user = user;
      req.session.isLoggedIn = true;
      //mongodb takes time to add session in database so redirect works faster than adding session so we can do

      return req.session.save((error) => {
        console.log(error);
        res.redirect("/");
      });
    } else {
      return res.status(422).render("auth/login.ejs", {
        pageTitle: "login Here",
        path: "/login",
        errorMessage: "Passwords do not match!",
        validateErrorMsg: [],
        oldInputValue: {
          email: email,
          password: password,
        },
      });
    }
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

/*=========== SIGN UP ================ */

export const getSignUp = (req, res, next) => {
  res.render("auth/signup.ejs", {
    pageTitle: "Create An Account",
    path: "/signup",
    errorMessage: req.flash("upError")[0],
    validateErrorMsg: [],
    oldInputValue: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};

export const postSignUp = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // validate email Result form router middleware
    const error = validationResult(req);

    if (!error.isEmpty()) {
      // console.log(error.array());
      return res.status(422).render("auth/signup.ejs", {
        pageTitle: "Create An Account",
        path: "/signup",
        errorMessage: error.array()[0].msg,
        validateErrorMsg: error.array(),
        oldInputValue: {
          email: email,
          password: password,
          confirmPassword: req.body.confPassword,
        },
      });
    }

    //now use validation with validator package

    // const userDoc = await User.findOne({ email: email });

    // if (userDoc) {
    //   req.flash("upError", "Email already exists. ");
    //   return res.redirect("/signup");
    // }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { items: [] },
    });

    await user.save();

    res.redirect("/login");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

/*=========== RESET Password ================ */

export const getResetPassword = (req, res, next) => {
  res.render("auth/reset.ejs", {
    pageTitle: "Confirm Your Email",
    path: "/reset",
    errorMessage: req.flash("error")[0], //we can write same key name in flash because req will be different for different routes
  });
};

export const postResetPassword = async (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");

      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        req.flash("error", "No Account with that email found.");
        return res.redirect("/reset");
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();

      //! Now here we use email transporter to send email to user

      res.redirect(`/reset/${token}`);
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

/*=========== New password Setting form page ================ */

export const getNewPasswordForm = async (req, res, next) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (user) {
      // console.log(user);
      return res.render("auth/newPassword.ejs", {
        pageTitle: "Update Your Password",
        path: "/newPassword",
        errorMessage: req.flash("error")[0],
        userId: user._id.toString(),
        passwordToken: token,
      });
    } else {
      req.flash("error", "Session Time expired!");
      res.redirect("/reset");
    }
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

export const postNewPasswordForm = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    if (user) {
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;

      user.save();

      res.redirect("/login");
    } else {
      req.flash("error", "Session Time expired or Token not verified!");
      res.redirect("/reset");
    }
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

/*=========== Logout ================ */

export const postLogout = (req, res) => {
  res.set({ Cache: "no-cache" });
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
