import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/orders';

// Create order
export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`
                }
            };

            const response = await axios.post(API_URL, orderData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get user orders
export const getUserOrders = createAsyncThunk(
    'orders/getUserOrders',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            };

            const response = await axios.get(`${API_URL}/my/orders`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
    'orders/getOrderById',
    async (orderId, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            };

            const response = await axios.get(`${API_URL}/${orderId}`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        orders: [],
        currentOrder: null,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        resetOrderState: (state) => {
            state.currentOrder = null;
            state.success = false;
            state.error = null;
        },
        clearOrderError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentOrder = action.payload;
                state.orders.unshift(action.payload); // Add to beginning of array
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to create order';
                state.success = false;
            })
            // Get User Orders
            .addCase(getUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(getUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to get orders';
            })
            // Get Order by ID
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to get order';
            });
    }
});

export const { resetOrderState, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;