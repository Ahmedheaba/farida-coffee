# ☕ Farida Coffee — Full Node.js E-Commerce Store

A complete, production-ready online coffee store built with Node.js, Express, MongoDB, and EJS.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```
Then edit `.env` and fill in your MongoDB URI, Stripe keys, etc.

### 3. Seed the Database (add sample products + admin user)
```bash
node seed.js
```
This creates:
- 6 coffee products
- Admin account: `admin@farida.coffee` / `admin123456`

### 4. Start the Server
```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Open: **http://localhost:3000**

---

## 📁 Project Structure

```
farida-coffee/
├── server.js              ← Entry point, Express setup
├── seed.js                ← Database seeder
├── .env.example           ← Environment variables template
│
├── models/
│   ├── Product.js         ← Coffee product schema
│   ├── Order.js           ← Order schema
│   └── User.js            ← User/Admin schema
│
├── routes/
│   ├── home.js            ← Homepage
│   ├── products.js        ← Product listing & detail
│   ├── cart.js            ← Shopping cart (session-based)
│   ├── checkout.js        ← Checkout + Stripe payment
│   ├── auth.js            ← Login / Register / Logout
│   ├── orders.js          ← Order confirmation
│   └── admin.js           ← Admin dashboard (protected)
│
├── middleware/
│   └── auth.js            ← requireLogin, requireAdmin
│
├── views/
│   ├── layout.ejs         ← Main HTML layout (navbar, footer)
│   ├── home.ejs           ← Homepage
│   ├── cart.ejs           ← Cart page
│   ├── checkout.ejs       ← Checkout with Stripe
│   ├── order-confirmation.ejs
│   ├── 404.ejs
│   ├── products/
│   │   ├── index.ejs      ← Product listing with filters
│   │   └── show.ejs       ← Single product detail
│   ├── auth/
│   │   ├── login.ejs
│   │   └── register.ejs
│   └── admin/
│       ├── dashboard.ejs  ← Stats + recent orders
│       ├── products.ejs   ← Product management table
│       ├── product-form.ejs ← Add/Edit product form
│       ├── orders.ejs     ← Order management
│       └── order-detail.ejs
│
└── public/
    ├── css/style.css      ← All styles
    ├── js/main.js         ← Client JavaScript
    └── images/            ← Product images (uploaded here)
```

---

## 🔑 Key Features

| Feature | Details |
|---|---|
| **Product Catalog** | Filter by category, price, sort by rating/price |
| **Shopping Cart** | Session-based, persists during visit |
| **Checkout** | Cash on delivery + Stripe card payments |
| **Admin Dashboard** | Product CRUD, order management, stats |
| **Auth** | Register/Login with bcrypt password hashing |
| **Image Upload** | Multer for product image uploads |

---

## 🌐 Deploy to Railway (Free)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a MongoDB service in Railway
4. Set your environment variables in the Railway dashboard
5. Done! Your store is live 🎉

---

## 💳 Stripe Test Cards

| Card | Number |
|---|---|
| Success | `4242 4242 4242 4242` |
| Declined | `4000 0000 0000 0002` |
| Any future date for expiry, any 3 digits for CVC |

---

## 📚 Node.js Concepts You Learn

- **Express routing** — GET, POST, PUT, DELETE
- **Middleware** — session, flash, auth guards
- **Mongoose** — schemas, models, queries, aggregation
- **EJS templating** — dynamic HTML with loops and conditionals
- **File uploads** — Multer
- **Payments** — Stripe API integration
- **Session management** — express-session
- **Password security** — bcrypt hashing
- **REST conventions** — method-override for PUT/DELETE in forms
