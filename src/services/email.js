const nodemailer = require('nodemailer');

// ----------------------------------------
// Transporter — created fresh per send so env vars are always current
// ----------------------------------------
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ----------------------------------------
// HTML receipt template
// ----------------------------------------
function buildReceiptHtml(order) {
  const { customer, items, orderType, deliveryAddress, pricing, orderNumber } = order;

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#f5f0e8;font-family:Arial,sans-serif;font-size:14px;">
        ${item.name}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#a0978a;font-family:Arial,sans-serif;font-size:14px;text-align:center;">
        ×${item.quantity}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:#d4af37;font-family:Arial,sans-serif;font-size:14px;text-align:right;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const deliveryLine = orderType === 'delivery' && deliveryAddress
    ? `${deliveryAddress.address}${deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : ''}, ${deliveryAddress.city}, ${deliveryAddress.state} ${deliveryAddress.zip}`
    : 'Raymah Café - Downtown, 123 Coffee Lane';

  const deliveryLabel = orderType === 'delivery' ? 'Delivering to' : 'Pickup from';
  const estimatedTime = orderType === 'delivery' ? '30–45 minutes' : '15–20 minutes';

  const discountRow = pricing.discount > 0 ? `
    <tr>
      <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;">Discount</td>
      <td style="padding:6px 0;color:#4ade80;font-family:Arial,sans-serif;font-size:13px;text-align:right;">-$${pricing.discount.toFixed(2)}</td>
    </tr>
  ` : '';

  const deliveryFeeRow = orderType === 'delivery' ? `
    <tr>
      <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;">Delivery Fee</td>
      <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;text-align:right;">$${pricing.deliveryFee.toFixed(2)}</td>
    </tr>
  ` : '';

  const tipRow = pricing.tip > 0 ? `
    <tr>
      <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;">Tip</td>
      <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;text-align:right;">$${pricing.tip.toFixed(2)}</td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Order Confirmed — Raymah Café</title></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#141414;border:1px solid rgba(212,175,55,0.2);padding:40px;text-align:center;">
              <p style="margin:0 0 4px;color:#d4af37;font-family:Georgia,serif;font-size:28px;letter-spacing:4px;text-transform:uppercase;">Raymah Café</p>
              <p style="margin:0;color:#a0978a;font-size:12px;letter-spacing:2px;text-transform:uppercase;">From Bean to Brew</p>
            </td>
          </tr>

          <!-- Order confirmed banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a0a,#141414);border-left:1px solid rgba(212,175,55,0.2);border-right:1px solid rgba(212,175,55,0.2);padding:32px 40px;text-align:center;">
              <div style="width:64px;height:64px;background-color:rgba(74,222,128,0.15);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:28px;">✓</span>
              </div>
              <p style="margin:0 0 8px;color:#f5f0e8;font-family:Georgia,serif;font-size:26px;">Order Confirmed!</p>
              <p style="margin:0;color:#a0978a;font-size:14px;">Hi ${customer.firstName}, thank you for your order.</p>
              <p style="margin:16px 0 0;display:inline-block;background-color:rgba(212,175,55,0.1);border:1px solid rgba(212,175,55,0.3);color:#d4af37;font-size:18px;font-weight:bold;padding:10px 24px;letter-spacing:2px;">
                #${orderNumber}
              </p>
            </td>
          </tr>

          <!-- Fulfilment info -->
          <tr>
            <td style="background-color:#141414;border-left:1px solid rgba(212,175,55,0.2);border-right:1px solid rgba(212,175,55,0.2);padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px;background-color:#1a1a1a;border:1px solid #2a2a2a;">
                    <p style="margin:0 0 4px;color:#a0978a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">${deliveryLabel}</p>
                    <p style="margin:0;color:#f5f0e8;font-size:14px;">${deliveryLine}</p>
                  </td>
                  <td width="16"></td>
                  <td style="padding:16px;background-color:#1a1a1a;border:1px solid #2a2a2a;">
                    <p style="margin:0 0 4px;color:#a0978a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Estimated Time</p>
                    <p style="margin:0;color:#f5f0e8;font-size:14px;">${estimatedTime}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="background-color:#141414;border-left:1px solid rgba(212,175,55,0.2);border-right:1px solid rgba(212,175,55,0.2);padding:0 40px 24px;">
              <p style="margin:0 0 12px;color:#d4af37;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Your Order</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#a0978a;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;font-weight:normal;">Item</th>
                    <th style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#a0978a;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:center;font-weight:normal;">Qty</th>
                    <th style="padding:8px 0;border-bottom:1px solid #2a2a2a;color:#a0978a;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:right;font-weight:normal;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Pricing breakdown -->
          <tr>
            <td style="background-color:#141414;border-left:1px solid rgba(212,175,55,0.2);border-right:1px solid rgba(212,175,55,0.2);padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;">Subtotal</td>
                  <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;text-align:right;">$${pricing.subtotal.toFixed(2)}</td>
                </tr>
                ${deliveryFeeRow}
                ${discountRow}
                <tr>
                  <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;">Tax</td>
                  <td style="padding:6px 0;color:#a0978a;font-family:Arial,sans-serif;font-size:13px;text-align:right;">$${pricing.tax.toFixed(2)}</td>
                </tr>
                ${tipRow}
                <tr>
                  <td style="padding:14px 0 6px;border-top:1px solid #2a2a2a;color:#f5f0e8;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Total Charged</td>
                  <td style="padding:14px 0 6px;border-top:1px solid #2a2a2a;color:#d4af37;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;text-align:right;">$${pricing.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f0f0f;border:1px solid rgba(212,175,55,0.2);border-top:none;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#a0978a;font-size:12px;">Questions? Reply to this email or visit us at Raymah Café - Downtown.</p>
              <p style="margin:0;color:#4a4a4a;font-size:11px;">© ${new Date().getFullYear()} Raymah Café · All rights reserved</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// ----------------------------------------
// Public API
// ----------------------------------------
async function sendOrderReceipt(order) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[email] Not configured — skipping receipt for order ${order.orderNumber}`);
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Raymah Café <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmed — #${order.orderNumber} | Raymah Café`,
    html: buildReceiptHtml(order),
  });

  console.log(`[email] Receipt sent → ${order.customer.email} (order ${order.orderNumber})`);
}

module.exports = { sendOrderReceipt };
