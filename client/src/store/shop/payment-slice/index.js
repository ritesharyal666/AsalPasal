import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  paymentLogs: [],
  paymentDetails: null,
  userPaymentLogs: [],
  failedPayments: [],
  orderPaymentLogs: [],
};

export const getPaymentLogs = createAsyncThunk(
  "/payment/getPaymentLogs",
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
  "/payment/getOrderPaymentLogs",
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
  "/payment/getUserPaymentLogs",
  async ({ userId, limit = 50 }) => {
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
  "/payment/getFailedPayments",
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
  "/payment/getPaymentDetails",
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

const paymentSlice = createSlice({
  name: "paymentSlice",
  initialState,
  reducers: {
    resetPaymentDetails: (state) => {
      state.paymentDetails = null;
    },
    resetPaymentLogs: (state) => {
      state.paymentLogs = [];
      state.userPaymentLogs = [];
      state.orderPaymentLogs = [];
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.orderPaymentLogs = action.payload.data;
      })
      .addCase(getOrderPaymentLogs.rejected, (state) => {
        state.isLoading = false;
        state.orderPaymentLogs = [];
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

export const { resetPaymentDetails, resetPaymentLogs } = paymentSlice.actions;

export default paymentSlice.reducer;