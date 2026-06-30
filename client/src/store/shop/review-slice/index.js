import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
};

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formdata) => {
    const response = await axios.post(
      `http://localhost:5000/api/shop/review/add`,
      formdata,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const getReviews = createAsyncThunk("/order/getReviews", async (id) => {
  const response = await axios.get(
    `http://localhost:5000/api/shop/review/${id}`,
    {
      withCredentials: true,
    }
  );

  return response.data;
});

export const editReview = createAsyncThunk(
  "/order/editReview",
  async ({ reviewId, formdata }) => {
    const response = await axios.put(
      `http://localhost:5000/api/shop/review/edit/${reviewId}`,
      formdata,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const deleteReview = createAsyncThunk(
  "/order/deleteReview",
  async (reviewId) => {
    const response = await axios.delete(
      `http://localhost:5000/api/shop/review/delete/${reviewId}`,
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      })
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addReview.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(editReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editReview.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(editReview.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(deleteReview.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default reviewSlice.reducer;
