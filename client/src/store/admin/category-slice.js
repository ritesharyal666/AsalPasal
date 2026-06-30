import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  categoryList: [],
};

export const addNewCategory = createAsyncThunk(
  "/categories/addnewcategory",
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

export const editCategory = createAsyncThunk(
  "/categories/editCategory",
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

const AdminCategorySlice = createSlice({
  name: "adminCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryList = action.payload.data;
      })
      .addCase(fetchAllCategories.rejected, (state) => {
        state.isLoading = false;
        state.categoryList = [];
      });
  },
});

export default AdminCategorySlice.reducer;