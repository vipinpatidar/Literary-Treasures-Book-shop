import { check, body } from "express-validator";
import { User } from "../models/user.js";

// check(fields(name="email"), message) middleware
export const checkSignUp = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value, { req }) => {
      const userDoc = await User.findOne({ email: value });

      if (userDoc) {
        return Promise.reject(
          "Email already exists. Please pick a different one."
        );
      }

      return userDoc;
    })
    .normalizeEmail(),
  //password check
  body(
    "password",
    "Please enter password at least 6 characters and in number and text"
  )
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim(),
  //confirmed password check
  body("confPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match!");
      }
      return true;
    })
    .trim(),
];
//.custom((value, {req})=>{ if(value === "test@test.com"){ throw new Error("This email address is forbidden")}  return true;})

export const checkLogin = [
  check("email", "Please enter a valid email address!")
    .isEmail()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });

      if (!user) {
        return Promise.reject("Email address not matched!");
      }
      return user;
    })
    .normalizeEmail(),

  body(
    "password",
    "Please enter password at least 6 characters and in number and text"
  )
    .isLength({ min: 6 })
    .trim(),
];

export const checkAdminForm = [
  body("title", "Please fill title of book with at least 3 characters")
    .not()
    .isEmpty(),
  body("image", "Image url is wrong"),
  body("price", "Please add valid Price").isCurrency(),
  body(
    "description",
    "Please write at least 10 characters for description of book"
  )
    .not()
    .isEmpty()
    .isLength({ min: 10 }),
];
