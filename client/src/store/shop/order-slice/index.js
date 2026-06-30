import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  paymentId: null,
  orderList: [],
  orderDetails: null,
  paymentLogs: [],
  userPaymentLogs: [],
  failedPayments: [],
  paymentDetails: null,
};

export const createNewOrder = createAsyncThunk(
  "/order/createNewOrder",
  async (orderData) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/create",
      orderData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const capturePayment = createAsyncThunk(
  "/order/capturePayment",
  async ({ paymentId, payerId, orderId }) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/capture",
      {
        paymentId,
        payerId,
        orderId,
      },
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

// NEW: Payment logging actions
export const getPaymentLogs = createAsyncThunk(
  "/order/getPaymentLogs",
  async (paymentId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/payment/logs/${paymentId}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getOrderPaymentLogs = createAsyncThunk(
  "/order/getOrderPaymentLogs",
  async (orderId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/payment/order-logs/${orderId}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getUserPaymentLogs = createAsyncThunk(
  "/order/getUserPaymentLogs",
  async ({ userId, limit = 10 }) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/payment/user-logs/${userId}?limit=${limit}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getFailedPayments = createAsyncThunk(
  "/order/getFailedPayments",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/shop/order/payment/failed",
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getPaymentDetails = createAsyncThunk(
  "/order/getPaymentDetails",
  async (paymentId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/payment/details/${paymentId}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const captureKhaltiPayment = createAsyncThunk(
  "/order/captureKhaltiPayment",
  async ({ pidx, orderId }) => {
    const response = await axios.post(
      "http://localhost:5000/api/shop/order/capture-khalti",
      {
        pidx,
        orderId,
      },
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  "/order/getAllOrdersByUserId",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/list/${userId}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getOrderDetails = createAsyncThunk(
  "/order/getOrderDetails",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/shop/order/details/${id}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

const shoppingOrderSlice = createSlice({
  name: "shoppingOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = action.payload.approvalURL;
        state.orderId = action.payload.orderId;
        state.paymentId = action.payload.paymentId;
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(action.payload.orderId)
        );
        sessionStorage.setItem(
          "currentPaymentId",
          JSON.stringify(action.payload.paymentId)
        );
      })
      .addCase(createNewOrder.rejected, (state) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
        state.paymentId = null;
      })
      .addCase(capturePayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
        state.paymentId = null;
      })
      .addCase(capturePayment.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data;
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      // NEW: Khalti payment capture handlers
      .addCase(captureKhaltiPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(captureKhaltiPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalURL = null;
        state.orderId = null;
      })
      .addCase(captureKhaltiPayment.rejected, (state) => {
        state.isLoading = false;
      })
      // NEW: Payment logging handlers
      .addCase(getPaymentLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPaymentLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentLogs = action.payload.data;
      })
      .addCase(getPaymentLogs.rejected, (state) => {
        state.isLoading = false;
        state.paymentLogs = [];
      })
      .addCase(getOrderPaymentLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderPaymentLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentLogs = action.payload.data;
      })
      .addCase(getOrderPaymentLogs.rejected, (state) => {
        state.isLoading = false;
        state.paymentLogs = [];
      })
      .addCase(getUserPaymentLogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserPaymentLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPaymentLogs = action.payload.data;
      })
      .addCase(getUserPaymentLogs.rejected, (state) => {
        state.isLoading = false;
        state.userPaymentLogs = [];
      })
      .addCase(getFailedPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFailedPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.failedPayments = action.payload.data;
      })
      .addCase(getFailedPayments.rejected, (state) => {
        state.isLoading = false;
        state.failedPayments = [];
      })
      .addCase(getPaymentDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPaymentDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentDetails = action.payload.data;
      })
      .addCase(getPaymentDetails.rejected, (state) => {
        state.isLoading = false;
        state.paymentDetails = null;
      });
  },
});

export const { resetOrderDetails } = shoppingOrderSlice.actions;

export default shoppingOrderSlice.reducer;