const nodemailer = require("nodemailer");
console.log("Mailer config:", {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? "✅ SET" : "❌ MISSING",
  owner: process.env.OWNER_EMAIL,
});

// Create transporter
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

// ─── Email to owner when new order placed ────────────────────────────────
async function sendOrderNotification(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured — skipping notification");
    return;
  }

  const transporter = createTransporter();

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

  await transporter.sendMail({
    from: `"${process.env.STORE_NAME || "My Store"}" <${process.env.EMAIL_USER}>`,
    to: process.env.OWNER_EMAIL,
    subject: `🛍️ New Order ${order.orderNumber} — EGP ${order.total.toFixed(0)}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#2C1A0E;padding:24px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:#FAF6F1;font-size:1.5rem;margin:0">
            ☕ ${process.env.STORE_NAME || "My Store"}
          </h1>
          <p style="color:#C47E3A;margin:8px 0 0">New Order Received!</p>
        </div>
        <div style="background:white;padding:32px;border:1px solid #eee">
          <div style="background:#FAF6F1;border-radius:8px;padding:20px;margin-bottom:24px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#8C7B6E;font-size:0.85rem">ORDER NUMBER</span>
              <strong>${order.orderNumber}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#8C7B6E;font-size:0.85rem">CUSTOMER</span>
              <strong>${order.customer.name}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#8C7B6E;font-size:0.85rem">PHONE</span>
              <strong>${order.customer.phone || "Not provided"}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="color:#8C7B6E;font-size:0.85rem">ADDRESS</span>
              <strong>${order.shippingAddress.street}, ${order.shippingAddress.city}</strong>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:#8C7B6E;font-size:0.85rem">PAYMENT</span>
              <strong>${order.paymentMethod.replace("-", " ").toUpperCase()}</strong>
            </div>
          </div>
          <h3 style="color:#2C1A0E;margin:0 0 12px">Order Items</h3>
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
          <div style="text-align:center;margin-top:28px">
            <a href="${process.env.SITE_URL}/admin/orders"
               style="background:#C47E3A;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700">
              View Order in Dashboard →
            </a>
          </div>
        </div>
        <div style="background:#FAF6F1;padding:16px;text-align:center;border-radius:0 0 8px 8px">
          <p style="color:#8C7B6E;font-size:0.82rem;margin:0">
            ${process.env.STORE_NAME} Admin Notification
          </p>
        </div>
      </div>
    `,
  });

  console.log(`📧 Owner notification sent for ${order.orderNumber}`);
}

// ─── Email to customer when order placed ─────────────────────────────────
async function sendOrderConfirmationEmail(order) {
  console.log(
    "📧 Attempting to send confirmation email to:",
    order.customer.email,
  );

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured — skipping confirmation");
    return;
  }
    try {
    const transporter = createTransporter();
    console.log('📧 Transporter created, sending...');
    
    await transporter.sendMail({
      from:    `"${process.env.STORE_NAME}" <${process.env.EMAIL_USER}>`,
      to:      order.customer.email,
      subject: `✅ Order Confirmed — ${order.orderNumber}`,
      // ... rest of email
    });
    
    console.log('📧 ✅ Confirmation email sent successfully to:', order.customer.email);
  } catch (err) {
    console.error('📧 ❌ Email sending FAILED:', err.message);
    console.error('📧 Full error:', err);
    }
  }


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

  await transporter.sendMail({
    from: `"${process.env.STORE_NAME || "My Store"}" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `✅ Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">

        <!-- Header -->
        <div style="background:#2C1A0E;padding:28px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:#FAF6F1;font-size:1.5rem;margin:0">
            ☕ ${process.env.STORE_NAME || "My Store"}
          </h1>
        </div>

        <!-- Status Banner -->
        <div style="background:#3D7A4F;padding:24px;text-align:center">
          <div style="font-size:3rem;margin-bottom:8px">✅</div>
          <h2 style="color:white;margin:0;font-size:1.4rem">
            Order Received!
          </h2>
        </div>

        <!-- Body -->
        <div style="background:white;padding:32px;border:1px solid #eee">
          <p style="color:#555;font-size:1rem;line-height:1.7;margin:0 0 24px">
            Hi <strong>${order.customer.name}</strong>,
            thank you for your order! We have received it and will confirm it shortly.
          </p>

          <!-- Order Info -->
          <div style="background:#FAF6F1;border-radius:8px;padding:20px;margin-bottom:24px">
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
              <span style="color:#8C7B6E;font-size:0.85rem">ORDER NUMBER</span>
              <strong>${order.orderNumber}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
              <span style="color:#8C7B6E;font-size:0.85rem">DATE</span>
              <strong>${new Date().toLocaleDateString()}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
              <span style="color:#8C7B6E;font-size:0.85rem">PAYMENT</span>
              <strong>${order.paymentMethod.replace("-", " ").toUpperCase()}</strong>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:#8C7B6E;font-size:0.85rem">DELIVER TO</span>
              <strong>${order.shippingAddress.street}, ${order.shippingAddress.city}</strong>
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

          <!-- Totals -->
          <div style="padding-top:16px;border-top:2px solid #FAF6F1;margin-bottom:28px">
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

          <!-- Track Button -->
          <div style="text-align:center">
            <a href="${process.env.SITE_URL}/orders/${order._id}/tracking"
               style="background:#C47E3A;color:white;padding:14px 32px;
                      border-radius:50px;text-decoration:none;
                      font-weight:700;font-size:1rem">
              Track Your Order →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#FAF6F1;padding:16px;text-align:center;border-radius:0 0 8px 8px">
          <p style="color:#8C7B6E;font-size:0.82rem;margin:0">
            Questions? Contact us at ${process.env.STORE_EMAIL || process.env.EMAIL_USER}
          </p>
        </div>
      </div>
    `,
  });

  console.log(`📧 Order confirmation sent to ${order.customer.email}`);
}

// ─── Email to customer when status changes ────────────────────────────────
async function sendStatusUpdateEmail(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("⚠️ Email not configured — skipping status update");
    return;
  }

  const statusMessages = {
    confirmed: {
      emoji: "✅",
      title: "Your order is confirmed!",
      message:
        "Great news! We have confirmed your order and our team is getting it ready.",
      color: "#3D7A4F",
    },
    processing: {
      emoji: "☕",
      title: "We are preparing your order!",
      message: "Our team is carefully preparing your order right now.",
      color: "#C47E3A",
    },
    shipped: {
      emoji: "🚚",
      title: "Your order is on its way!",
      message: "Your order has been shipped and is on its way to you!",
      color: "#185FA5",
    },
    delivered: {
      emoji: "🎉",
      title: "Your order has been delivered!",
      message: "Your order has arrived! Thank you for shopping with us.",
      color: "#2C1A0E",
    },
    cancelled: {
      emoji: "❌",
      title: "Your order has been cancelled",
      message:
        "Your order has been cancelled. Contact us if you have questions.",
      color: "#B83232",
    },
  };

  const info = statusMessages[order.status];
  if (!info) return;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${process.env.STORE_NAME || "My Store"}" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `${info.emoji} ${info.title} — Order ${order.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#2C1A0E;padding:28px;text-align:center;border-radius:8px 8px 0 0">
          <h1 style="color:#FAF6F1;font-size:1.5rem;margin:0">
            ☕ ${process.env.STORE_NAME || "My Store"}
          </h1>
        </div>
        <div style="background:${info.color};padding:24px;text-align:center">
          <div style="font-size:3rem;margin-bottom:8px">${info.emoji}</div>
          <h2 style="color:white;margin:0;font-size:1.4rem">${info.title}</h2>
        </div>
        <div style="background:white;padding:32px;border:1px solid #eee">
          <p style="color:#555;font-size:1rem;line-height:1.7;margin:0 0 24px">
            Hi <strong>${order.customer.name}</strong>, ${info.message}
          </p>
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
          <div style="text-align:center">
            <a href="${process.env.SITE_URL}/orders/${order._id}/tracking"
               style="background:#C47E3A;color:white;padding:14px 32px;
                      border-radius:50px;text-decoration:none;font-weight:700">
              Track Your Order →
            </a>
          </div>
        </div>
        <div style="background:#FAF6F1;padding:16px;text-align:center;border-radius:0 0 8px 8px">
          <p style="color:#8C7B6E;font-size:0.82rem;margin:0">
            Questions? Contact us at ${process.env.STORE_EMAIL || process.env.EMAIL_USER}
          </p>
        </div>
      </div>
    `,
  });

  console.log(
    `📧 Status email sent to ${order.customer.email} — ${order.status}`,
  );
}

module.exports = {
  sendOrderNotification,
  sendOrderConfirmationEmail,
  sendStatusUpdateEmail,
};
