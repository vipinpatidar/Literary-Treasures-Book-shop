import mongoose from "mongoose";
import { Book } from "./products.js";
import { Order } from "./order.js";
const { ObjectId } = mongoose.Types;

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: "book", required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

// ! User Methods

userSchema.methods.addToCart = function (book) {
  const oldBook = this.cart.items?.find((cartBook) => {
    return cartBook?.bookId.toString() === book._id.toString();
  });

  // console.log(book._id, this.cart.items, oldBook);

  const updatedItem = oldBook
    ? this.cart.items.map((item) => {
        return item.bookId?.toString() === oldBook.bookId?.toString()
          ? { ...item, quantity: item.quantity + 1 }
          : item;
      })
    : [...this.cart.items, { bookId: new ObjectId(book._id), quantity: 1 }];

  // console.log(updatedItem, "updatedItem");

  const updatedCart = {
    items: updatedItem,
  };

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.removeOneCartItem = function (id) {
  const oldBook = this.cart.items.find(
    (cartBook) => cartBook?.bookId.toString() === id.toString()
  );

  let updatedItem;

  if (oldBook.quantity > 1) {
    updatedItem = this.cart.items.map((item) =>
      item.bookId?.toString() === oldBook.bookId?.toString()
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
  } else if (oldBook.quantity === 1) {
    updatedItem = this.cart.items.filter(
      (item) => item.bookId.toString() !== oldBook.bookId?.toString()
    );
  }

  const updatedCart = {
    items: updatedItem,
  };

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.deleteCartItem = function (id) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.bookId.toString() !== id.toString()
  );

  this.cart = updatedCartItems;

  return this.save();
};

//! Method for Order

userSchema.methods.addOrder = async function () {
  const bookIds = this.cart.items.map((item) => item.bookId);

  const books = await Book.find({ _id: { $in: bookIds } });

  const newQtyBooks = books.map((book) => {
    return {
      ...book,
      quantity: this.cart.items.find(
        (item) => item.bookId.toString() === book._id.toString()
      ).quantity,
    };
  });

  const order = {
    items: newQtyBooks,
    user: {
      _id: new ObjectId(this._id),
      name: this.name,
    },
  };

  const orderData = new Order(order);

  orderData.save();

  await User.findByIdAndUpdate(
    {
      _id: new ObjectId(this._id),
    },
    { $set: { cart: { items: [] } } }
  );

  return orderData;
};

userSchema.methods.clearOrders = function () {
  return Order.deleteMany({});
};

export const User = mongoose.model("user", userSchema);
