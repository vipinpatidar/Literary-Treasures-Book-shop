import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: [
    {
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
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  user: {
    _id: {
      type: Schema.Types.ObjectId,
    },
    name: {
      type: String,
    },
  },
});

export const Order = mongoose.model("order", orderSchema);
