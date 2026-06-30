const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const generateOrderConfirmationHTML = (order, user) => {
  const itemsHTML = order.cartItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: 500;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">NPR ${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 500;">NPR ${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
        </div>

        <!-- Order Details -->
        <div style="padding: 30px 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #333; font-size: 20px;">Order Details</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> #${order._id}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Payment Status:</strong> 
              <span style="color: ${order.paymentStatus === 'paid' ? '#28a745' : '#ffc107'}; font-weight: bold;">
                ${order.paymentStatus.toUpperCase()}
              </span>
            </p>
          </div>

          <!-- Customer Info -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Customer Information</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${user.firstName} ${user.lastName || ''}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${user.email}</p>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Shipping Address</h3>
            <p style="margin: 5px 0; color: #666; line-height: 1.5;">
              ${order.addressInfo.address}<br>
              ${order.addressInfo.city}, ${order.addressInfo.pincode}<br>
              Phone: ${order.addressInfo.phone}
              ${order.addressInfo.notes ? `<br>Notes: ${order.addressInfo.notes}` : ''}
            </p>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #e9ecef;">
                  <th style="padding: 12px 10px; text-align: left; font-weight: 600; color: #333;">Image</th>
                  <th style="padding: 12px 10px; text-align: left; font-weight: 600; color: #333;">Product</th>
                  <th style="padding: 12px 10px; text-align: center; font-weight: 600; color: #333;">Qty</th>
                  <th style="padding: 12px 10px; text-align: right; font-weight: 600; color: #333;">Price</th>
                  <th style="padding: 12px 10px; text-align: right; font-weight: 600; color: #333;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
          </div>

          <!-- Order Total -->
          <div style="background-color: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: right;">
            <h3 style="margin: 0; font-size: 24px;">Total: NPR ${order.totalAmount.toFixed(2)}</h3>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            Thank you for shopping with us!<br>
            If you have any questions, please contact our support team.
          </p>
          <div style="margin-top: 15px;">
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Track Order</a> |
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Contact Support</a> |
            <a href="#" style="color: #667eea; text-decoration: none; margin: 0 10px;">Return Policy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { sendEmail, generateOrderConfirmationHTML };