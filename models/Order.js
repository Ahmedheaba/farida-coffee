const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => "FC-" + Date.now().toString().slice(-8),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Egypt" },
      zip: String,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String, // snapshot at purchase time
        price: Number,
        quantity: { type: Number, min: 1 },
        image: String,
      },
    ],
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 50 }, // EGP
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash-on-delivery", "card", "stripe", "instapay"],
      default: "cash-on-delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    stripePaymentId: String,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);
