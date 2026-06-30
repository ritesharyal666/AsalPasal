import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  pagination: {},
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams, page = 1 }) => {
    console.log(fetchAllFilteredProducts, "fetchAllFilteredProducts");

    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
      page: page.toString(),
      limit: '20'
    });

    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/products/get?${query}`
    );

    console.log(result);

    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async (slug) => { // Changed 'id' to 'slug'
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/shop/products/get/${slug}` // This must hit your slug route
    );

    return result?.data;
  }
  );
const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
