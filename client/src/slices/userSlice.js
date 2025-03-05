import Axios from 'axios';
import { persistor } from '../store';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const register = createAsyncThunk(
  '/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await Axios.post('/register', { 
        email, 
        password 
      }, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const login = createAsyncThunk(
  '/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await Axios.post('/login', { 
        email, 
        password 
      }, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getProfile = createAsyncThunk(
  '/profile/get',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await Axios.get('/profile', { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  '/profile/update',
  async ({ first_name, last_name }, { rejectWithValue }) => {
    try {
      const { data } = await Axios.put('/profile', { first_name, last_name }, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const logout = createAsyncThunk(
    '/logout',
    async (_, { rejectWithValue }) => {
      try {
        await Axios.post('/logout', {}, { withCredentials: true }); 
        persistor.purge();
        return;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
      }
    }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { loading: false, user: null, error: null },
  extraReducers: (builder) => {
    builder
    .addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    .addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    .addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    .addCase(getProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.error = null;
    })
    .addCase(getProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    .addCase(logout.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.error = null;
    })
    .addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default userSlice.reducer;
export const { logoutSession } = userSlice.actions;
