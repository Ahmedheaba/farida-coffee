const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Compare at price cannot be negative"],
    },
    category: {
      type: String,
      enum: [
        "espresso",
        "filter",
        "cold-brew",
        "beans",
        "equipment",
        "accessories",
      ],
      required: true,
    },
    image: {
      type: String,
      default: "/images/default-coffee.jpg",
    },
    images: [
      {
        type: String,
      },
    ],
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    origin: String, // e.g. "Ethiopia", "Colombia"
    roastLevel: {
      type: String,
      enum: ["light", "medium", "medium-dark", "dark"],
      default: "medium",
    },
    weight: String, // e.g. "250g", "1kg"
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for search
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
