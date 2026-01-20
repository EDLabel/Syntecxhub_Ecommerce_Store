import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    removeFromCart,
    updateQuantity,
    clearCart,
    getCart
} from '../features/cart/cartSlice';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { formatPrice, calculateCartTotal } from '../utils/currency';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, total } = useSelector(state => state.cart);
    const { isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    const handleIncrease = (item) => {
        dispatch(updateQuantity({
            productId: item.productId || item.id,
            quantity: item.quantity + 1
        }));
    };

    const handleDecrease = (item) => {
        if (item.quantity > 1) {
            dispatch(updateQuantity({
                productId: item.productId || item.id,
                quantity: item.quantity - 1
            }));
        }
    };

    const handleRemove = (productId) => {
        dispatch(removeFromCart(productId));
    };

    const cartTotal = calculateCartTotal(items);

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">Add some products to your cart!</p>
                <Link
                    to="/"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {items.map(item => (
                        <div key={item.productId || item.id} className="flex items-center border-b py-4">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-24 h-24 object-cover rounded"
                            />

                            <div className="ml-6 flex-1">
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-gray-600">{formatPrice(item.price)} each</p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleDecrease(item)}
                                        className="px-2 py-1 border rounded-l"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                                    <button
                                        onClick={() => handleIncrease(item)}
                                        className="px-2 py-1 border rounded-r"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="w-24 text-right">
                  <span className="font-semibold">
                     {formatPrice(item.price * item.quantity)}
                  </span>
                                </div>

                                <button
                                    onClick={() => handleRemove(item.productId || item.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6">
                        <button
                            onClick={() => dispatch(clearCart())}
                            className="text-red-600 hover:text-red-800"
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatPrice(cartTotal.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{formatPrice(cartTotal.shipping)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>VAT (15%)</span>
                                <span>{formatPrice(cartTotal.tax)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-green-600">{formatPrice(cartTotal.total)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 flex items-center justify-center"
                        >
                            Proceed to Checkout
                            <ArrowRight size={20} className="ml-2" />
                        </button>

                        <Link
                            to="/"
                            className="block text-center mt-4 text-blue-600 hover:text-blue-800"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
