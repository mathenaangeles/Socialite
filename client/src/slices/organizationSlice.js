import Axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const createOrganization = createAsyncThunk(
  '/organization/create',
  async ({ name }, { rejectWithValue }) => {
    try {
      const { data } = await Axios.post('/organization/create', { name }, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getOrganization = createAsyncThunk(
  '/organization/get',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await Axios.get(`/organization/${id}`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateOrganization = createAsyncThunk(
  '/organization/update',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const { data } = await Axios.put(`/organization/${id}`, { name }, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  '/organization/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await Axios.delete(`/organization/${id}`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addMembers = createAsyncThunk(
    'organization/members/add',
    async ({ id, emails }, { rejectWithValue }) => {
      try {
        const { data } = await Axios.put(`/organization/members/${id}`, { emails },  { withCredentials: true });
        return data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
      }
    }
);

export const deleteMembers = createAsyncThunk(
    '/organization/members/delete',
    async ({ id, emails }, { rejectWithValue }) => {
      try {
        const { data } = await Axios.delete(`/organization/members/${id}`, { emails },  { withCredentials: true });
        return data;
      } catch (err) {
        return rejectWithValue(err.response?.data?.message || err.message);
      }
    }
);
  
export const getOrganizations = createAsyncThunk(
  '/organizations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await Axios.get('/organizations', { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState: { loading: false, organizations: [], organization: null, error: null },
  extraReducers: (builder) => {
    builder
        .addCase(createOrganization.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createOrganization.fulfilled, (state, action) => {
            state.loading = false;
            state.organization = action.payload;
            state.organizations.push(action.payload);
            state.error = null;
        })
        .addCase(createOrganization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getOrganization.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getOrganization.fulfilled, (state, action) => {
            state.loading = false;
            state.organization = action.payload;
            state.error = null;
        })
        .addCase(getOrganization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(updateOrganization.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateOrganization.fulfilled, (state, action) => {
            state.loading = false;
            state.organization = action.payload;
            const index = state.organizations.findIndex(organization => organization.id === action.payload.id);
            if (index !== -1) {
                state.organizations[index] = action.payload;
            }
            state.error = null;
        })
        .addCase(updateOrganization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(deleteOrganization.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteOrganization.fulfilled, (state, action) => {
            state.loading = false;
            state.organizations = state.organizations.filter(organization => organization.id !== action.payload.id);
            state.error = null;
        })
        .addCase(deleteOrganization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(addMembers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(addMembers.fulfilled, (state, action) => {
            state.loading = false;
            state.organization = action.payload;
            const index = state.organizations.findIndex(organization => organization.id === action.payload.id);
            if (index !== -1) {
                state.organizations[index] = action.payload;
            }
            state.error = null;
        })
        .addCase(addMembers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(deleteMembers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteMembers.fulfilled, (state, action) => {
            state.loading = false;
            state.organization = action.payload;
            const index = state.organizations.findIndex(organization => organization.id === action.payload.id);
            if (index !== -1) {
                state.organizations[index] = action.payload;
            }
            state.error = null;
        })
        .addCase(deleteMembers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase(getOrganizations.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getOrganizations.fulfilled, (state, action) => {
            state.loading = false;
            state.organizations = action.payload;
            state.error = null;
        })
        .addCase(getOrganizations.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
  },
});

export default organizationSlice.reducer;
