import Axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const createProduct = createAsyncThunk(
  '/product/create',
  async ( productData, { rejectWithValue }) => {
    try {
      const { data } = await Axios.post('/product/create', productData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getProduct = createAsyncThunk(
  '/product/get',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await Axios.get(`/product/${id}`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  '/product/update',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await Axios.put(`/product/${id}`, productData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  '/product/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await Axios.delete(`/product/${id}`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
  
export const getProducts = createAsyncThunk(
  '/products/all',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await Axios.get('/products', { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: { loading: false, products: [], product: null, error: null },
  extraReducers: (builder) => {
    builder
        .addCase(createProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.product = action.payload;
            state.products.push(action.payload);
            state.error = null;
        })
        .addCase(createProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.product = action.payload;
            state.error = null;
        })
        .addCase(getProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(updateProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.product = action.payload;
            const index = state.products.findIndex(product => product.id === action.payload.id);
            if (index !== -1) {
                state.products[index] = action.payload;
            }
            state.error = null;
        })
        .addCase(updateProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(deleteProduct.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteProduct.fulfilled, (state, action) => {
            state.loading = false;
            state.products = state.products.filter(product => product.id !== action.payload.id);
            state.error = null;
        })
        .addCase(deleteProduct.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getProducts.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload;
            state.error = null;
        })
        .addCase(getProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
  },
});

export default productSlice.reducer;
