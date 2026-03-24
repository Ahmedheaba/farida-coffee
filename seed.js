require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/User");

const products = [
  {
    name: "Ethiopian Yirgacheffe",
    description:
      "Bright and fruity with notes of blueberry and jasmine. Single-origin beans from the birthplace of coffee.",
    price: 185,
    category: "beans",
    origin: "Ethiopia",
    roastLevel: "light",
    weight: "250g",
    featured: true,
    rating: 4.9,
    reviewCount: 124,
  },
  {
    name: "Colombian Supremo",
    description:
      "A classic smooth cup with caramel sweetness and a clean finish. Perfect for every morning.",
    price: 160,
    category: "beans",
    origin: "Colombia",
    roastLevel: "medium",
    weight: "250g",
    featured: true,
    rating: 4.7,
    reviewCount: 89,
  },
  {
    name: "Farida Espresso Blend",
    description:
      "Our signature house blend — rich, bold, and velvety with a beautiful crema. Crafted for espresso lovers.",
    price: 175,
    category: "espresso",
    origin: "Brazil + Rwanda",
    roastLevel: "dark",
    weight: "250g",
    featured: true,
    rating: 4.8,
    reviewCount: 212,
  },
  {
    name: "Cold Brew Concentrate",
    description:
      "Ready-to-dilute cold brew made from 100% Arabica beans. Smooth, low-acid, and incredibly refreshing.",
    price: 145,
    category: "cold-brew",
    origin: "Guatemala",
    weight: "500ml",
    featured: true,
    rating: 4.6,
    reviewCount: 67,
  },
  {
    name: "V60 Filter Blend",
    description:
      "Delicate and complex — designed to shine through pour-over brewing methods. Floral with a honeyed finish.",
    price: 165,
    category: "filter",
    origin: "Kenya",
    roastLevel: "light",
    weight: "250g",
    featured: false,
    rating: 4.8,
    reviewCount: 45,
  },
  {
    name: "Dark Roast Espresso",
    description:
      "Intense and smoky with notes of dark chocolate and toasted nuts. For those who like it strong.",
    price: 155,
    category: "espresso",
    origin: "Brazil",
    roastLevel: "dark",
    weight: "250g",
    featured: false,
    rating: 4.5,
    reviewCount: 98,
  },
];

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/farida-coffee",
    );
    console.log("Connected to MongoDB");

    // Clear existing
    await Product.deleteMany({});
    await User.deleteMany({});

    // Insert products
    await Product.insertMany(products);
    console.log(`✅ ${products.length} products seeded`);

    // Create admin user
    await User.create({
      name: "Farida Admin",
      email: "admin@farida.coffee",
      password: "admin123456",
      role: "admin",
    });
    console.log("✅ Admin user created: admin@farida.coffee / admin123456");

    mongoose.disconnect();
    console.log("✅ Seed complete!");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
