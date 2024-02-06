import { Book } from "../models/products.js";

import { validationResult } from "express-validator";
import { deleteFileImage } from "../util/fileDelete.js";

// Admin folder requests

// Admin Form

export const getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  res.set({ Cache: "no-cache" });

  res.render("admin/editBook.ejs", {
    path: "/admin",
    pageTitle: "Add Books Here",
    btnTxt: "Add Book",
    errorMessage: "",
    oldInputValue: {
      title: "",
      image: "",
      price: "",
      description: "",
    },
    validateErrorMsg: [],
  });
};

// Admin Form data posting

export const postAddedProduct = async (req, res, next) => {
  try {
    const title = req.body.title;
    //file upload using multer
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    // console.log(image);

    if (!image) {
      return res.render("admin/editBook.ejs", {
        path: "/admin",
        pageTitle: "Add Books Here",
        btnTxt: "Add Book",
        errorMessage: "Attached file is not an image!",
        oldInputValue: {
          title: title,
          price: price,
          description: description,
        },
        validateErrorMsg: [],
      });
    }

    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.render("admin/editBook.ejs", {
        path: "/admin",
        pageTitle: "Add Books Here",
        btnTxt: "Add Book",
        errorMessage: error.array()[0].msg,
        oldInputValue: {
          title: title,
          price: price,
          description: description,
        },
        validateErrorMsg: error.array(),
      });
    }

    const imagePath = `/${image.path}`;

    const userId = req.user._id; // we can also add req.user and mongoose will add _id behind seen

    const book = new Book({
      title: title,
      price: price,
      image: imagePath,
      description: description,
      userId: userId,
    });

    await book.save();

    res.redirect("/");
  } catch (error) {
    // res.status(500).redirect("/500");

    //using middleware for error handling

    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err); //by calling next(err) like this when error occurred express will skip all other middleware and move right away to error handler middleware
  }
};

// Admin Books with edit and delete

export const getAdminBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ userId: req.user._id });

    // BY .select() method we can get only given data -_id for removing form data
    // By .populate() method we can get given field data too like with .populate("userId") we can get name email, cart

    //  const books = await Book.find({}).select("title price -_id").populate("userId", "name")

    // so here we get title price not id with user name data

    res.render("admin/books.ejs", {
      prods: books,
      path: "/admin/books",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

// Edit Book Form in Admin

export const getEditBook = async (req, res, next) => {
  const editMode = Boolean(req.query.edit);

  if (!editMode) {
    return res.redirect("/");
  }

  const bookId = req.params.bookId;

  try {
    const book = await Book.findById({ _id: bookId });

    //only find books currently logged user

    if (!book) {
      return res.redirect("/");
    }

    res.render("admin/editBook.ejs", {
      path: "/editBook",
      pageTitle: "Edit Book Here",
      isEditing: editMode,
      product: book,
      btnTxt: "Edit Book",
      errorMessage: "",
      validateErrorMsg: [],
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

// Edit book form action or Post request

export const postEditBook = async (req, res, next) => {
  // console.log(req.body);
  try {
    const title = req.body.title;
    //file upload using multer
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;

    const error = validationResult(req);

    if (!error.isEmpty()) {
      return res.render("admin/editBook.ejs", {
        path: "/editBook",
        pageTitle: "Edit Book Here",
        isEditing: true,
        product: {
          title: req.body.title,
          price: req.body.price,
          description: req.body.description,
          _id: req.body.id,
        },
        errorMessage: error.array()[0].msg,
        btnTxt: "Edit Book",
        validateErrorMsg: error.array(),
      });
    }

    const book = await Book.findById({ _id: req.body.id });

    const oldImage = book.image;

    if (image) {
      const filePath = `.${oldImage}`;
      deleteFileImage(filePath);
    }

    const imagePath = `/${image?.path}`;

    const editedForm = {
      title: title,
      image: image && imagePath,
      price: price,
      description: description,
    };

    if (book.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }

    await Book.findByIdAndUpdate({ _id: req.body.id }, { $set: editedForm });

    res.redirect("/admin/books");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

// Delete book
/*
export const deleteBook = async (req, res, next) => {
  const bookId = req.params.bookId;
  // const userId = req.user._id;
  // console.log(userId);

  try {
    const book = await Book.findOneAndDelete({
      _id: bookId,
      userId: req.user._id,
    });

    //only delete if created user is authorized
    // const book = await Book.deleteOne({ _id: bookId, userId: req.user._id });

    //delete image from images folder too
    if (book.image) {
      const filePath = `.${book.image}`;
      deleteFileImage(filePath);
    }

    await req.user.deleteCartItem(bookId);
    res.redirect("/admin/books");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};
*/

export const deleteBookAsync = async (req, res, next) => {
  const bookId = req.params.bookId;
  // const userId = req.user._id;
  // console.log(userId);

  console.log(bookId);

  try {
    const book = await Book.findOneAndDelete({
      _id: bookId,
      userId: req.user._id,
    });

    //only delete if created user is authorized
    // const book = await Book.deleteOne({ _id: bookId, userId: req.user._id });

    //delete image from images folder too
    if (book.image) {
      const filePath = `.${book.image}`;
      deleteFileImage(filePath);
    }
    await req.user.deleteCartItem(bookId);

    res.status(200).json({ message: "Successfully deleted the book" });
  } catch (error) {
    res.status(500).json({ message: "Failed deleting the book" });
  }
};
