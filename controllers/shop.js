import { Book } from "../models/products.js";
import { User } from "../models/user.js";
import { Order } from "../models/order.js";
import { __dirname } from "../app.js";
import path from "path";
import fs from "fs";
// importing stripe
import Stripe from "stripe";

//creating pdf using pdfkit
import PDFDocument from "pdfkit";

const BOOKS_PER_PAGE = 3;

//adding secret key to stripe

const stripe = Stripe(process.env.STRIPE_KEY);

// shop folder requests

export const getIndex = async (req, res, next) => {
  const pageNo = +req.query.page ? +req.query.page : 1;
  try {
    const numberOfBooks = await Book.find().countDocuments();

    const numberOfPages = Math.ceil(numberOfBooks / BOOKS_PER_PAGE);

    // page 1 skip 0 limit 2;
    // page 2 skip 2 limit 2;
    const books = await Book.find()
      .skip((pageNo - 1) * BOOKS_PER_PAGE)
      .limit(BOOKS_PER_PAGE);
    // console.log(books);

    // console.log(res.locals); { isAuthenticated: true }

    res.render("shop/index.ejs", {
      prods: books,
      path: "/",
      currentPage: pageNo,
      hasNextPage: BOOKS_PER_PAGE * pageNo < numberOfBooks,
      hasPreviousPage: pageNo > 1,
      nextPage: pageNo + 1,
      previousPage: pageNo - 1,
      lastPage: numberOfPages,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

export const getBooks = async (req, res, next) => {
  const pageNo = +req.query.page ? +req.query.page : 1;
  console.log(req.headers.origin)
  try {
    const numberOfBooks = await Book.find().countDocuments();

    const numberOfPages = Math.ceil(numberOfBooks / BOOKS_PER_PAGE);

    const books = await Book.find()
      .skip((pageNo - 1) * BOOKS_PER_PAGE)
      .limit(BOOKS_PER_PAGE);
    // console.log(books.length);
    res.render("shop/booksList.ejs", {
      prods: books,
      path: "/books",
      currentPage: pageNo,
      hasNextPage: BOOKS_PER_PAGE * pageNo < numberOfBooks,
      hasPreviousPage: pageNo > 1,
      nextPage: pageNo + 1,
      previousPage: pageNo - 1,
      lastPage: numberOfPages,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

export const getBookDetails = async (req, res, next) => {
  const bookId = req.params.bookId;

  try {
    const book = await Book.findById({ _id: bookId });

    res.render("shop/bookDetails.ejs", {
      product: book,
      path: "/books",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const { cart } = await User.findOne({ _id: req.user._id });
    const books = await Book.find({});
    // console.log(cart);

    let cartBooks;
    let totalPrice;

    if (cart.items.length > 0) {
      cartBooks = cart.items.map((item) => {
        const book = books.find(
          (book) => book?._id.toString() === item.bookId.toString()
        );

        // console.log(book);

        return {
          _id: book._id,
          title: book.title,
          price: book.price,
          image: book.image,
          description: book.description,
          quantity: item?.quantity,
        };
      });

      totalPrice = cartBooks.reduce((acc, curr) => {
        return acc + Number(curr.price) * curr?.quantity;
      }, 0);
    } else {
      cartBooks = [];
      totalPrice = 0;
    }

    res.render("shop/cart.ejs", {
      path: "/cart",
      cartBooks: cartBooks,
      totalPrice: totalPrice,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

export const postAddToCart = async (req, res, next) => {
  try {
    const bookId = req.body.bookId;
    const book = await Book.findById(bookId);
    // console.log(book);

    const result = await req.user.addToCart(book);

    // console.log(result);

    res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

//Post request for removing one item from cart

export const postRemoveOneToCart = async (req, res, next) => {
  try {
    const bookId = req.body.bookId;

    await req.user.removeOneCartItem(bookId);

    res.redirect("/cart");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

// Delete cart item

export const postDeleteCartItem = async (req, res, next) => {
  try {
    const bookId = req.body.bookId;

    await req.user.deleteCartItem(bookId);

    res.redirect("/cart");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
/*
export const postOrder = async (req, res, next) => {
  try {
    const order = await req.user.addOrder();

    res.redirect("/orders");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};
*/
export const getOrders = async (req, res, next) => {
  try {
    if (!req.user._id) {
      return res.redirect("/");
    }
    const orders = await Order.find({ "user._id": req.user._id });

    let ordersArr = [];

    let totalPrice = 0;

    // console.log(orders);
    if (orders.length > 0) {
      orders.forEach((order) => {
        order.items.forEach(async (book) => {
          totalPrice += Number(book?.price) * book.quantity;
        });
      });

      ordersArr = orders;
    }

    // console.log(ordersArr);

    res.render("shop/orders.ejs", {
      path: "/orders",
      orders: ordersArr,
      totalPrice: totalPrice,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

export const postClearOrders = async (req, res, next) => {
  try {
    await req.user.clearOrders();
    res.redirect("/orders");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

export const getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);

  if (!order) {
    return next(new Error("No Order found!"));
  }

  if (order.user._id.toString() !== req.user._id.toString()) {
    return next(new Error("You are unauthorized!"));
  }

  const invoiceFileName = orderId + ".pdf";
  const invoiceFilePath = path.resolve("data", "invoices", invoiceFileName);

  //!Creating new pdf
  const pdfDoc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${invoiceFileName}` // attachment for download, inline for open in browser
  );

  pdfDoc.pipe(fs.createWriteStream(invoiceFilePath));
  //The pipe() method in Node.js is a built-in method that is used to attach a Readable stream to a Writable stream. This allows the Readable stream to push its data to the Writable stream.

  //readable.pipe(writable)
  pdfDoc.pipe(res);

  pdfDoc.fontSize(30).text("INVOICE", 20, 30);
  pdfDoc.fontSize(30).text("LOGO", 20, 30, { align: "right" });
  pdfDoc.text("_______________________________");
  pdfDoc.text(" ");
  pdfDoc.fontSize(14).text("Invoice# " + orderId, 20, 110);
  pdfDoc.fontSize(14).text("Invoice Date: " + new Date().toLocaleDateString());
  // pdfDoc.fontSize(14).text("Invoice To: " + "");
  pdfDoc.fontSize(30).text("_______________________________", 20, 140);
  pdfDoc.fontSize(14).text(" ");

  pdfDoc
    .fontSize(16)
    .text(
      "   ITEM                  DESCRIPTION                       Qty               AMOUNT",
      20,
      175
    );

  pdfDoc.fontSize(30).text("_______________________________", 20, 170);

  let totalPrice = 0;
  let item = 1;
  let fsize = 14;
  let ystart = 210;
  let xstart = 40;
  let yinc = fsize + 20;
  let ycoord = ystart + (item - 1) * yinc;

  order.items.forEach((prod) => {
    totalPrice += prod.quantity * prod.price;

    pdfDoc.fontSize(fsize).text(" " + item, xstart, ycoord);
    pdfDoc.fontSize(fsize).text(prod.title, xstart + 120, ycoord);
    pdfDoc.fontSize(fsize).text(prod.quantity, xstart + 330, ycoord);
    pdfDoc.fontSize(fsize).text(prod.price, xstart + 430, ycoord);
    item++;
    ycoord = ystart + (item - 1) * fsize;
  });

  pdfDoc.fontSize(30).text("_______________________________", 20, ycoord);
  pdfDoc.fontSize(20).text(" Total: $" + totalPrice, 400, ycoord + 40);
  pdfDoc.fontSize(30).text("_______________________________", 20, ycoord + 40);

  pdfDoc.end();

  //if you read a file like this, node will first of all access that file, read the entire content into memory and then return it with the response. This means that for bigger files, this will take very long before a response is sent and your memory on the server might actually overflow at some point for many incoming requests because it has to read all the data into memory which of course is limited.

  /*
  fs.readFile(invoiceFilePath, (err, data) => {
    if (err) {
      return next(err);
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${invoiceFileName}` // attachment for download, inline for open in browser
    );
    res.send(data);
     });
*/

  // Using streaming data so if user get big file size then download will go in chunks as buffer and process not stop; or node will be able to use that to read in the file step by step in different chunks.
  /*
  const file = fs.createReadStream(invoiceFilePath);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${invoiceFileName}` // attachment for download, inline for open in browser
  );

  file.pipe(res); */ //call the pipe method to forward the data that is read in with that stream to my response because the response object is a writable stream actually and you can use readable streams to pipe their output into a writable stream, not every object is a writable stream but the response happens to be one. So we can pipe our readable stream, the file stream into the response and that means that the response will be streamed to the browser and will contain the data and the data will basically be downloaded by the browser step by step and for large files, this is a huge advantage because node never has to pre-load all the data into memory but just streams

  //!send file also use streaming
  /*
  const options = {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="' + invoiceFileName + '"',
    },
  };
  res.sendFile(invoiceFilePath, options, (err) => {
    if (err) {
      return next(err);
    }
  });
  */
  /*
    res.download(path [, filename] [, options] [, fn])
    res.download(`data/invoices/your-file-name.pdf`, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceName}`,
    },
  });
    */
};

export const getCheckout = async (req, res, next) => {
  try {
    const { cart } = await User.findOne({ _id: req.user._id });
    const books = await Book.find({});
    // console.log(cart);

    let cartBooks;
    let totalPrice;

    if (cart.items.length > 0) {
      cartBooks = cart.items.map((item) => {
        const book = books.find(
          (book) => book?._id.toString() === item.bookId.toString()
        );

        // console.log(book);

        return {
          _id: book._id,
          title: book.title,
          price: book.price,
          image: book.image,
          description: book.description,
          quantity: item?.quantity,
        };
      });

      totalPrice = cartBooks.reduce((acc, curr) => {
        return acc + Number(curr.price) * curr?.quantity;
      }, 0);
    } else {
      cartBooks = [];
      totalPrice = 0;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartBooks.map((book) => {
        return {
          price_data: {
            currency: "usd",
            unit_amount: book.price * 100,
            product_data: {
              name: book.title,
              description: book.description,
            },
          },
          quantity: book.quantity,
        };
      }),
      mode: "payment",
      success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
      cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
    });

    res.render("shop/checkout.ejs", {
      path: "/checkout",
      cartBooks: cartBooks,
      totalPrice: totalPrice,
      sessionId: session.id,
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

//after checkout success directing to order page;
export const getCheckoutSuccess = async (req, res, next) => {
  try {
    const order = await req.user.addOrder();

    res.redirect("/orders");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};
