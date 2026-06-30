import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  brandList: [],
};

export const addNewBrand = createAsyncThunk(
  "/brands/addnewbrand",
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

export const editBrand = createAsyncThunk(
  "/brands/editBrand",
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

const AdminBrandSlice = createSlice({
  name: "adminBrands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandList = action.payload.data;
      })
      .addCase(fetchAllBrands.rejected, (state) => {
        state.isLoading = false;
        state.brandList = [];
      });
  },
});

export default AdminBrandSlice.reducer;