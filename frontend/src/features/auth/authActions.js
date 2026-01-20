import { logout } from './authSlice';
import { resetCart } from '../cart/cartSlice';

export const logoutUser = () => (dispatch) => {
    // Clear localStorage
    localStorage.removeItem('token');

    // Dispatch logout to clear auth state
    dispatch(logout());

    // Dispatch resetCart to clear cart state
    dispatch(resetCart());
};
