import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Mongoose Schema
const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export const Book = mongoose.model("book", bookSchema);
