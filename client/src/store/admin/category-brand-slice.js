import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  categories: [],
  brands: [],
};

// Categories async thunks
export const addCategory = createAsyncThunk(
  "/categories/addCategory",
  async (formData) => {
    const response = await axios.post(
      "http://localhost:5000/api/admin/categories/add",
      formData
    );
    return response.data;
  }
);

export const fetchAllCategories = createAsyncThunk(
  "/categories/fetchAllCategories",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/admin/categories/get"
    );
    return response.data;
  }
);

export const updateCategory = createAsyncThunk(
  "/categories/updateCategory",
  async ({ id, formData }) => {
    const response = await axios.put(
      `http://localhost:5000/api/admin/categories/edit/${id}`,
      formData
    );
    return response.data;
  }
);

export const deleteCategory = createAsyncThunk(
  "/categories/deleteCategory",
  async (id) => {
    const response = await axios.delete(
      `http://localhost:5000/api/admin/categories/delete/${id}`
    );
    return response.data;
  }
);

// Brands async thunks
export const addBrand = createAsyncThunk(
  "/brands/addBrand",
  async (formData) => {
    const response = await axios.post(
      "http://localhost:5000/api/admin/brands/add",
      formData
    );
    return response.data;
  }
);

export const fetchAllBrands = createAsyncThunk(
  "/brands/fetchAllBrands",
  async () => {
    const response = await axios.get(
      "http://localhost:5000/api/admin/brands/get"
    );
    return response.data;
  }
);

export const updateBrand = createAsyncThunk(
  "/brands/updateBrand",
  async ({ id, formData }) => {
    const response = await axios.put(
      `http://localhost:5000/api/admin/brands/edit/${id}`,
      formData
    );
    return response.data;
  }
);

export const deleteBrand = createAsyncThunk(
  "/brands/deleteBrand",
  async (id) => {
    const response = await axios.delete(
      `http://localhost:5000/api/admin/brands/delete/${id}`
    );
    return response.data;
  }
);

const categoryBrandSlice = createSlice({
  name: "adminCategoryBrand",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Categories cases
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload.data;
      })
      .addCase(fetchAllCategories.rejected, (state) => {
        state.isLoading = false;
        state.categories = [];
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload.data);
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (category) => category._id === action.payload.data._id
        );
        if (index !== -1) {
          state.categories[index] = action.payload.data;
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (category) => category._id !== action.payload.data._id
        );
      })
      // Brands cases
      .addCase(fetchAllBrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brands = action.payload.data;
      })
      .addCase(fetchAllBrands.rejected, (state) => {
        state.isLoading = false;
        state.brands = [];
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        state.brands.push(action.payload.data);
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex(
          (brand) => brand._id === action.payload.data._id
        );
        if (index !== -1) {
          state.brands[index] = action.payload.data;
        }
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter(
          (brand) => brand._id !== action.payload.data._id
        );
      });
  },
});

export default categoryBrandSlice.reducer;