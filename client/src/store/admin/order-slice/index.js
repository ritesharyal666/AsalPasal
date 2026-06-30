import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orderList: [],
  orderDetails: null,
  paymentList: [],
  paymentLogs: [],
  failedPayments: [],
  isLoading: false,
};

export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/getAllOrdersForAdmin",
  async () => {
    const response = await axios.get(
      `http://localhost:5000/api/admin/orders/get`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/getOrderDetailsForAdmin",
  async (id) => {
    const response = await axios.get(
      `http://localhost:5000/api/admin/orders/details/${id}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const updateOrderStatus = createAsyncThunk(
  "/order/updateOrderStatus",
  async ({ id, orderStatus }) => {
    const response = await axios.put(
      `http://localhost:5000/api/admin/orders/update/${id}`,
      {
        orderStatus,
      },
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getAllPaymentsForAdmin = createAsyncThunk(
  "/admin/getAllPaymentsForAdmin",
  async ({ page = 1, limit = 50, status, paymentMethod, userId, orderId } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (status && status !== 'all') params.append('status', status);
    if (paymentMethod && paymentMethod !== 'all') params.append('paymentMethod', paymentMethod);
    if (userId) params.append('userId', userId);
    if (orderId) params.append('orderId', orderId);

    try {
      console.log('Fetching payments from:', `http://localhost:5000/api/admin/payments/logs?${params.toString()}`);
      const response = await axios.get(
        `http://localhost:5000/api/admin/payments/logs?${params.toString()}`,
        {
          withCredentials: true,
        }
      );
      console.log('Payment API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Payment API Error:', error.response?.data || error.message);
      throw error;
    }
  }
);

export const getFailedPaymentsForAdmin = createAsyncThunk(
  "/admin/getFailedPaymentsForAdmin",
  async () => {
    const response = await axios.get(
      `http://localhost:5000/api/admin/payments/failed`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getPaymentLogsForAdmin = createAsyncThunk(
  "/admin/getPaymentLogsForAdmin",
  async (paymentId) => {
    try {
      console.log('Fetching payment logs for ID:', paymentId);
      const response = await axios.get(
        `http://localhost:5000/api/admin/payments/logs/${paymentId}`,
        {
          withCredentials: true,
        }
      );
      console.log('Payment logs API Response for ID', paymentId, ':', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data));
      if (response.data.data) {
        console.log('Response data.data type:', typeof response.data.data);
        console.log('Response data.data length:', Array.isArray(response.data.data) ? response.data.data.length : 'not array');
      }
      return response.data;
    } catch (error) {
      console.error('Payment logs API Error:', error.response?.data || error.message);
      throw error;
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetOrderDetails: (state) => {
      console.log("resetOrderDetails");

      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      })
      .addCase(getAllOrdersForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [];
      })
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null;
      })
      .addCase(getAllPaymentsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllPaymentsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('getAllPaymentsForAdmin fulfilled - Full payload:', action.payload);
        console.log('Payload keys:', Object.keys(action.payload));
        console.log('Payload data type:', typeof action.payload.data);
        console.log('Payload data:', action.payload.data);

        // Handle various response structures
        let paymentData = [];

        if (action.payload) {
          if (action.payload.data && Array.isArray(action.payload.data)) {
            paymentData = action.payload.data;
          } else if (Array.isArray(action.payload)) {
            paymentData = action.payload;
          } else if (action.payload.payments && Array.isArray(action.payload.payments)) {
            paymentData = action.payload.payments;
          } else if (typeof action.payload === 'object' && action.payload !== null) {
            // Try to extract array from object
            const values = Object.values(action.payload);
            if (values.length > 0 && Array.isArray(values[0])) {
              paymentData = values[0];
            }
          }
        }

        state.paymentList = paymentData;
        console.log('PaymentList set to:', state.paymentList);
        console.log('PaymentList length:', state.paymentList.length);
      })
      .addCase(getAllPaymentsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.paymentList = [];
      })
      .addCase(getFailedPaymentsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFailedPaymentsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.failedPayments = action.payload.data;
      })
      .addCase(getFailedPaymentsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.failedPayments = [];
      })
      .addCase(getPaymentLogsForAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPaymentLogsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both direct array response and wrapped response
        state.paymentLogs = action.payload.data || action.payload || [];
      })
      .addCase(getPaymentLogsForAdmin.rejected, (state) => {
        state.isLoading = false;
        state.paymentLogs = [];
      });
  },
});

export const { resetOrderDetails } = adminOrderSlice.actions;

export default adminOrderSlice.reducer;
