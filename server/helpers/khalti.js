const axios = require("axios");

// Khalti Configuration
const KHALTI_CONFIG = {
  secretKey: process.env.KHALTI_SECRET_KEY, // Get this from test-admin.khalti.com
  apiUrl: process.env.KHALTI_API_URL || "https://dev.khalti.com/api/v2", // Use https://khalti.com/api/v2 for production
};

// Helper function to make Khalti API requests
const khaltiRequest = async (endpoint, data) => {
  try {
    const response = await axios.post(
      `${KHALTI_CONFIG.apiUrl}${endpoint}`,
      data,
      {
        headers: {
          Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Khalti API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || { message: error.message },
    };
  }
};

// Initiate Khalti Payment
const initiatePayment = async (paymentData) => {
  const {
    orderId,
    amount,
    customerName,
    customerEmail,
    customerPhone,
    returnUrl,
    websiteUrl,
  } = paymentData;

  // Amount should be in paisa (multiply by 100)
  const amountInPaisa = Math.round(amount * 100);

  const payload = {
    return_url: returnUrl || "http://localhost:5173/shop/khalti-return",
    website_url: websiteUrl || "http://localhost:5173",
    amount: amountInPaisa,
    purchase_order_id: orderId,
    purchase_order_name: `Order #${orderId}`,
    customer_info: {
      name: customerName || "Customer",
      email: customerEmail || "customer@example.com",
      phone: customerPhone || "9800000000",
    },
  };

  return await khaltiRequest("/epayment/initiate/", payload);
};

// Verify Khalti Payment (Lookup)
const verifyPayment = async (pidx) => {
  return await khaltiRequest("/epayment/lookup/", { pidx });
};

module.exports = {
  initiatePayment,
  verifyPayment,
  KHALTI_CONFIG,
};