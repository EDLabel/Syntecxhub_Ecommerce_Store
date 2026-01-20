import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authActions';
import { getCart } from '../features/cart/cartSlice';
import { ShoppingCart, User, LogOut, Settings, LayoutDashboard, Users, Activity } from 'lucide-react';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const { items } = useSelector(state => state.cart);

    React.useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">
                            <span style={{fontFamily:"gothic", fontWeight:"bold", fontStyle:"italic", fontSize:"xx-large"}}>e</span>-Store.
                        </Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link to="/" className="text-gray-700 hover:text-blue-600">
                            Home
                        </Link>
                        <Link to="/products" className="text-gray-700 hover:text-blue-600">
                            Products
                        </Link>

                        <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
                            <ShoppingCart size={24} />
                            {items.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.length}
                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="flex items-center text-gray-700 hover:text-blue-600"
                                    >
                                        <LayoutDashboard size={20} className="mr-1" />
                                        Dashboard
                                    </Link>
                                )}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                                        <User size={20} />
                                        <span>{user?.name}</span>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10 hidden group-hover:block">
                                        <Link
                                            to="/profile"
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                                        >
                                            <User size={16} className="mr-2" />
                                            My Profile
                                        </Link>
                                        {isAuthenticated && user.role === 'user' && (
                                            <Link to="/my-orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                                <ShoppingCart size={16} className="mr-2" />
                                                My Orders
                                            </Link>
                                        )}
                                        {user.role === 'admin' && (
                                            <>
                                                <Link
                                                    to="/admin/settings"
                                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Settings size={16} className="mr-2" />
                                                    Admin Settings
                                                </Link>
                                                <Link to="/admin/orders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                                    <ShoppingCart size={16} className="mr-2" />
                                                    Manage Orders
                                                </Link>
                                                <Link to="/admin/products" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                                    <Activity size={16} className="mr-2" />
                                                    Manage Products
                                                </Link>
                                                <Link to="/admin/users" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                                    <Users size={16} className="mr-2" />
                                                    Manage Users
                                                </Link>
                                            </>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
