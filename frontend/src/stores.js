import { configureStore } from '@reduxjs/toolkit';

const initialState = {
    auth: { isAuthenticated: false, user: null },
    cart: { items: [], total: 0 }
};

const store = configureStore({
    reducer: (state = initialState, action) => {
        switch (action.type) {
            default:
                return state;
        }
    }
});

export { store };
