const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5,
  connectionTimeout: 5000, // ✅ 5 second timeout
  greetingTimeout: 5000,
  socketTimeout: 5000,
});
// Send email to store owner when new order is placed
async function sendOrderNotification(order) {
  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">EGP ${(item.price * item.quantity).toFixed(0)}</td>
    </tr>`,
    )
    .join("");

  const mailOptions = {
    from: `"Farida Coffee" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `☕ New Order ${order.orderNumber} — EGP ${order.total.toFixed(0)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        
        <!-- Header -->
        <div style="background:#2C1A0E;padding:24px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:#FAF6F1;font-size:1.5rem;margin:0">
            ☕ Farida Coffee
          </h1>
          <p style="color:#C47E3A;margin:8px 0 0;font-size:0.9rem">New Order Received!</p>
        </div>

        <!-- Body -->
        <div style="background:white;padding:32px;border:1px solid #eee">
          
          <!-- Order Info -->
          <div style="background:#FAF6F1;border-radius:8px;padding:20px;margin-bottom:24px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#8C7B6E;font-size:0.85rem">ORDER NUMBER</span>
              <strong>${order.orderNumber}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#8C7B6E;font-size:0.85rem">DATE</span>
              <strong>${new Date().toLocaleString()}</strong>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:#8C7B6E;font-size:0.85rem">PAYMENT</span>
              <strong>${order.paymentMethod.replace("-", " ").toUpperCase()}</strong>
            </div>
          </div>

          <!-- Customer Info -->
          <h3 style="color:#2C1A0E;margin:0 0 12px">Customer</h3>
          <p style="margin:0;color:#555">
            👤 <strong>${order.customer.name}</strong><br>
            📧 ${order.customer.email}<br>
            📞 ${order.customer.phone || "Not provided"}<br>
            📍 ${order.shippingAddress.street}, ${order.shippingAddress.city}
          </p>

          <!-- Items -->
          <h3 style="color:#2C1A0E;margin:24px 0 12px">Order Items</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#FAF6F1">
                <th style="padding:8px;text-align:left;font-size:0.8rem;color:#8C7B6E">PRODUCT</th>
                <th style="padding:8px;text-align:center;font-size:0.8rem;color:#8C7B6E">QTY</th>
                <th style="padding:8px;text-align:right;font-size:0.8rem;color:#8C7B6E">TOTAL</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>

          <!-- Totals -->
          <div style="margin-top:16px;padding-top:16px;border-top:2px solid #FAF6F1">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#555">
              <span>Subtotal</span><span>EGP ${order.subtotal.toFixed(0)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#555">
              <span>Shipping</span><span>EGP ${order.shippingCost}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:1.1rem;font-weight:700;color:#2C1A0E">
              <span>Total</span><span>EGP ${order.total.toFixed(0)}</span>
            </div>
          </div>

          <!-- CTA -->
          <div style="text-align:center;margin-top:28px">
            <a href="http://localhost:3000/admin/orders"
               style="background:#C47E3A;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700">
              View Order in Dashboard →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#FAF6F1;padding:16px;text-align:center;border-radius:0 0 8px 8px">
          <p style="color:#8C7B6E;font-size:0.82rem;margin:0">
            Farida Coffee Admin Notification — You received this because you are the store owner
          </p>
        </div>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Order notification sent for ${order.orderNumber}`);
}
// Send email to customer when order status changes
async function sendStatusUpdateEmail(order) {
  const statusMessages = {
    confirmed: {
      emoji: "✅",
      title: "Your order is confirmed!",
      message:
        "Great news! We have confirmed your order and our team is getting it ready for you.",
      color: "#3D7A4F",
    },
    processing: {
      emoji: "☕",
      title: "We are preparing your coffee!",
      message:
        "Our team is carefully preparing your coffee order right now. We will notify you once it ships.",
      color: "#C47E3A",
    },
    shipped: {
      emoji: "🚚",
      title: "Your order is on its way!",
      message:
        "Your coffee has been shipped and is on its way to you. Expect delivery very soon!",
      color: "#185FA5",
    },
    delivered: {
      emoji: "🎉",
      title: "Your order has been delivered!",
      message:
        "Your coffee has arrived! We hope you enjoy every sip. Thank you for choosing Farida Coffee.",
      color: "#2C1A0E",
    },
    cancelled: {
      emoji: "❌",
      title: "Your order has been cancelled",
      message:
        "Your order has been cancelled. If you have any questions please contact us.",
      color: "#B83232",
    },
  };

  // Only send email for these statuses
  const info = statusMessages[order.status];
  if (!info) return;

  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
      <td style="padding:10px;border-bottom:1px solid #eee">${item.name}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;text-align:right">EGP ${(item.price * item.quantity).toFixed(0)}</td>
    </tr>`,
    )
    .join("");

  const mailOptions = {
    from: `"Farida Coffee" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `${info.emoji} ${info.title} — Order ${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">

        <!-- Header -->
        <div style="background:#2C1A0E;padding:28px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:#FAF6F1;font-size:1.5rem;margin:0">☕ Farida Coffee</h1>
          <p style="color:#C47E3A;margin:8px 0 0;font-size:0.9rem">Order Update</p>
        </div>

        <!-- Status Banner -->
        <div style="background:${info.color};padding:24px;text-align:center">
          <div style="font-size:3rem;margin-bottom:8px">${info.emoji}</div>
          <h2 style="color:white;margin:0;font-size:1.4rem">${info.title}</h2>
        </div>

        <!-- Body -->
        <div style="background:white;padding:32px;border:1px solid #eee">

          <p style="color:#555;font-size:1rem;line-height:1.7;margin:0 0 24px">
            Hi <strong>${order.customer.name}</strong>, ${info.message}
          </p>

          <!-- Order Info -->
          <div style="background:#FAF6F1;border-radius:8px;padding:20px;margin-bottom:24px">
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
              <span style="color:#8C7B6E;font-size:0.85rem">ORDER NUMBER</span>
              <strong>${order.orderNumber}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
              <span style="color:#8C7B6E;font-size:0.85rem">STATUS</span>
              <strong style="color:${info.color}">${order.status.toUpperCase()}</strong>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:#8C7B6E;font-size:0.85rem">TOTAL</span>
              <strong>EGP ${order.total.toFixed(0)}</strong>
            </div>
          </div>

          <!-- Items -->
          <h3 style="color:#2C1A0E;margin:0 0 12px;font-size:1rem">Your Items</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#FAF6F1">
                <th style="padding:10px;text-align:left;font-size:0.8rem;color:#8C7B6E">PRODUCT</th>
                <th style="padding:10px;text-align:center;font-size:0.8rem;color:#8C7B6E">QTY</th>
                <th style="padding:10px;text-align:right;font-size:0.8rem;color:#8C7B6E">TOTAL</th>
              </tr>
            </thead>
            <tbody>${itemsList}</tbody>
          </table>

          <!-- Track Order Button -->
          <div style="text-align:center;margin-top:28px">
            <a href="${process.env.SITE_URL || "http://localhost:3000"}/orders/${order._id}/tracking"
               style="background:#C47E3A;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:1rem">
              Track Your Order →
            </a>
          </div>

          <p style="text-align:center;margin-top:24px;color:#8C7B6E;font-size:0.85rem">
            Questions? Reply to this email or contact us anytime.
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#FAF6F1;padding:16px;text-align:center;border-radius:0 0 8px 8px">
          <p style="color:#8C7B6E;font-size:0.82rem;margin:0">
            © <%= new Date().getFullYear() %> Farida Coffee — Cairo, Egypt
          </p>
        </div>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(
    `📧 Status email sent to ${order.customer.email} — ${order.status}`,
  );
}
module.exports = { sendOrderNotification, sendStatusUpdateEmail };
