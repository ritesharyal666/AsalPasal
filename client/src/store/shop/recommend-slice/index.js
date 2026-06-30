import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const initialState = {
  related: [],
  forYou: [],
  frequentlyBought: [],
  isLoadingRelated: false,
  isLoadingForYou: false,
  isLoadingFrequentlyBought: false,
};

// "You may also like" on a product page
export const fetchRelatedProducts = createAsyncThunk(
  "recommend/fetchRelated",
  async ({ productId, limit = 6 }) => {
    const result = await axios.get(
      `${API}/api/shop/recommend/related/${productId}?limit=${limit}`
    );
    return result?.data;
  }
);

// "Recommended for you" on the home page
export const fetchRecommendationsForUser = createAsyncThunk(
  "recommend/fetchForYou",
  async ({ userId, limit = 8 } = {}) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (userId) query.set("userId", userId);
    const result = await axios.get(
      `${API}/api/shop/recommend/for-you?${query}`
    );
    return result?.data;
  }
);

// "Frequently bought together" in the cart
export const fetchFrequentlyBoughtTogether = createAsyncThunk(
  "recommend/fetchFrequentlyBought",
  async ({ productIds = [], limit = 4 }) => {
    const result = await axios.post(
      `${API}/api/shop/recommend/frequently-bought-together`,
      { productIds, limit }
    );
    return result?.data;
  }
);

const recommendSlice = createSlice({
  name: "shopRecommend",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.related = [];
      state.frequentlyBought = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.isLoadingRelated = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.isLoadingRelated = false;
        state.related = action.payload?.data || [];
      })
      .addCase(fetchRelatedProducts.rejected, (state) => {
        state.isLoadingRelated = false;
        state.related = [];
      })
      .addCase(fetchRecommendationsForUser.pending, (state) => {
        state.isLoadingForYou = true;
      })
      .addCase(fetchRecommendationsForUser.fulfilled, (state, action) => {
        state.isLoadingForYou = false;
        state.forYou = action.payload?.data || [];
      })
      .addCase(fetchRecommendationsForUser.rejected, (state) => {
        state.isLoadingForYou = false;
        state.forYou = [];
      })
      .addCase(fetchFrequentlyBoughtTogether.pending, (state) => {
        state.isLoadingFrequentlyBought = true;
      })
      .addCase(fetchFrequentlyBoughtTogether.fulfilled, (state, action) => {
        state.isLoadingFrequentlyBought = false;
        state.frequentlyBought = action.payload?.data || [];
      })
      .addCase(fetchFrequentlyBoughtTogether.rejected, (state) => {
        state.isLoadingFrequentlyBought = false;
        state.frequentlyBought = [];
      });
  },
});

export const { clearRecommendations } = recommendSlice.actions;

export default recommendSlice.reducer;
