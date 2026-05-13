const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },
    items: [
      {
        productId: String,
        name: String,
        price: String,
        image: String,
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Delivered", "Cancelled"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
