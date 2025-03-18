import Axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const createContent = createAsyncThunk(
  '/content/create',
  async ( contentData, { rejectWithValue }) => {
    try {
      const { data } = await Axios.post('/content/create', contentData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getContent = createAsyncThunk(
  '/content/get',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await Axios.get(`/content/${id}`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateContent = createAsyncThunk(
  '/content/update',
  async ({ id, contentData }, { rejectWithValue }) => {
    try {
      const { data } = await Axios.put(`/content/${id}`, contentData, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteContent = createAsyncThunk(
  '/content/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await Axios.delete(`/content/${id}`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
  
export const getContents = createAsyncThunk(
  '/content',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await Axios.get('/contents', { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState: { loading: false, contents: [], content: null, error: null },
  extraReducers: (builder) => {
    builder
        .addCase(createContent.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createContent.fulfilled, (state, action) => {
            state.loading = false;
            state.content = action.payload;
            state.contents.push(action.payload);
            state.error = null;
        })
        .addCase(createContent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getContent.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getContent.fulfilled, (state, action) => {
            state.loading = false;
            state.content = action.payload;
            state.error = null;
        })
        .addCase(getContent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(updateContent.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateContent.fulfilled, (state, action) => {
            state.loading = false;
            state.content = action.payload;
            const index = state.contents.findIndex(content => content.id === action.payload.id);
            if (index !== -1) {
                state.contents[index] = action.payload;
            }
            state.error = null;
        })
        .addCase(updateContent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(deleteContent.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteContent.fulfilled, (state, action) => {
            state.loading = false;
            state.contents = state.contents.filter(content => content.id !== action.payload.id);
            state.error = null;
        })
        .addCase(deleteContent.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getContents.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getContents.fulfilled, (state, action) => {
            state.loading = false;
            state.contents = action.payload;
            state.error = null;
        })
        .addCase(getContents.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
  },
});

export default contentSlice.reducer;
