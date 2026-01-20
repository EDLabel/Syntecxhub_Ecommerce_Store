import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/cart';

// Async thunks
export const getCart = createAsyncThunk(
    'cart/getCart',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            if (!auth.token) return { items: [], total: 0 };

            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            };

            const response = await axios.get(API_URL, config);
            return response.data.cart;
        } catch (error) {
            // If 401, user is not logged in - return empty cart
            if (error.response?.status === 401) {
                return { items: [], total: 0 };
            }
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, name, price, image, quantity = 1 }, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            };

            const response = await axios.post(
                `${API_URL}/add`,
                { productId, name, price, image, quantity },
                config
            );
            return response.data.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (productId, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            };

            const response = await axios.delete(`${API_URL}/item/${productId}`, config);
            return response.data.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ productId, quantity }, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            };

            const response = await axios.put(
                `${API_URL}/item/${productId}`,
                { quantity },
                config
            );
            return response.data.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Alias for backward compatibility
export const updateQuantity = updateCartItem;

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            };

            await axios.delete(API_URL, config);
            return { items: [], total: 0 };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        total: 0,
        loading: false,
        error: null
    },
    reducers: {
        // For guest users and logout
        resetCart: (state) => {
            state.items = [];
            state.total = 0;
        },
        // For guest users to add items (temporary until login)
        addToCartGuest: (state, action) => {
            const { productId, name, price, image, quantity = 1 } = action.payload;
            const existingItem = state.items.find(item => item.productId === productId);

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ productId, name, price, image, quantity });
            }

            state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        // For guest users to remove items
        removeFromCartGuest: (state, action) => {
            const productId = action.payload;
            state.items = state.items.filter(item => item.productId !== productId);
            state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        },
        // For guest users to update quantity
        updateQuantityGuest: (state, action) => {
            const { productId, quantity } = action.payload;
            const item = state.items.find(item => item.productId === productId);
            if (item) {
                item.quantity = quantity;
            }
            state.total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Cart
            .addCase(getCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(getCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to get cart';
            })
            // Add to Cart
            .addCase(addToCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.error || 'Failed to add to cart';
            })
            // Remove from Cart
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            // Update Cart Item
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.total = action.payload.total;
            })
            // Clear Cart
            .addCase(clearCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.total = action.payload.total;
            });
    }
});

export const {
    resetCart,
    addToCartGuest,
    removeFromCartGuest,
    updateQuantityGuest
} = cartSlice.actions;

export default cartSlice.reducer;