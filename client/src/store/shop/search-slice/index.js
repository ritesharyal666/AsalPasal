import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  searchResults: [],
  pagination: {},
  searchInfo: {},
};

export const getSearchResults = createAsyncThunk(
  "/order/getSearchResults",
  async ({ keyword, filters = {}, page = 1 }) => {
    console.log("🔍 Redux: Searching with:", { keyword, filters, page });

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20', // Changed from 50 to 20
      ...filters
    });

    const url = `${import.meta.env.VITE_API_URL}/api/shop/search/${encodeURIComponent(keyword)}?${params}`;
    console.log("🌐 Redux: Calling URL:", url);

    const response = await axios.get(url);
    
    console.log("✅ Redux: Got response:", {
      success: response.data.success,
      resultCount: response.data.data?.length,
      pagination: response.data.pagination
    });

    return response.data;
  }
);

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    resetSearchResults: (state) => {
      console.log("🔄 Redux: Resetting search results");
      state.searchResults = [];
      state.pagination = {};
      state.searchInfo = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSearchResults.pending, (state) => {
        console.log("⏳ Redux: Search pending...");
        state.isLoading = true;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        console.log("✅ Redux: Search fulfilled:", action.payload);
        state.isLoading = false;
        state.searchResults = action.payload.data;
        state.pagination = action.payload.pagination || {};
        state.searchInfo = action.payload.searchInfo || {};
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        console.error("❌ Redux: Search rejected:", action.error);
        state.isLoading = false;
        state.searchResults = [];
      });
  },
});

export const { resetSearchResults } = searchSlice.actions;

export default searchSlice.reducer;