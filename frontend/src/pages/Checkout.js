import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../features/cart/cartSlice';
import { createOrder, resetOrderState } from '../features/orders/orderSlice';
import { toast } from 'react-toastify';
import { CreditCard, Lock, CheckCircle, Loader } from 'lucide-react';
import { formatPrice, calculateCartTotal } from '../utils/currency';

const Checkout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);
    const { loading, success, error, currentOrder } = useSelector(state => state.orders);

    // LOCAL STATE for form submission
    const [submitting, setSubmitting] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        street: '',
        city: '',
        province: '',
        postalCode: '',
        country: 'South Africa'
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    // Handle order success/error with proper cleanup
    useEffect(() => {
        if (success && currentOrder) {
            // Clear backend cart after successful order
            const clearBackendCart = async () => {
                try {
                    const token = localStorage.getItem('token');
                    await fetch('/api/cart', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (error) {
                    console.error('Failed to clear backend cart:', error);
                }
            };

            clearBackendCart();
            dispatch(clearCart());

            toast.success('Order placed successfully!');

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/my-orders');
                dispatch(resetOrderState());
            }, 2000);
        }

        if (error) {
            toast.error(error);
            setSubmitting(false); // Reset on error
        }
    }, [success, error, currentOrder, dispatch, navigate]);

    useEffect(() => {
        // Pre-fill shipping info if user has address
        if (user?.address) {
            setShippingInfo(prev => ({
                ...prev,
                street: user.address.street || '',
                city: user.address.city || '',
                province: user.address.state || '',
                postalCode: user.address.zipCode || ''
            }));
        }
    }, [user]);

    const handleShippingChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const handlePaymentChange = (e) => {
        setPaymentInfo({
            ...paymentInfo,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!shippingInfo.street || !shippingInfo.city || !shippingInfo.province || !shippingInfo.postalCode) {
            toast.error('Please fill in all shipping information');
            return;
        }

        const cartTotal = calculateCartTotal(items);

        // Prepare order data
        const orderData = {
            orderItems: items.map(item => ({
                product: item.productId || item.id || item._id,
                name: item.name,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
                image: item.image
            })),
            shippingAddress: {
                street: shippingInfo.street,
                city: shippingInfo.city,
                state: shippingInfo.province,
                zipCode: shippingInfo.postalCode,
                country: shippingInfo.country
            },
            paymentMethod: 'Credit Card',
            itemsPrice: cartTotal.subtotal,
            taxPrice: cartTotal.tax,
            shippingPrice: cartTotal.shipping,
            totalPrice: cartTotal.total
        };

        // Dispatch the Redux thunk instead of direct fetch
        setSubmitting(true);
        dispatch(createOrder(orderData));
    };

    const cartTotal = calculateCartTotal(items);

    // Show success page after order placement
    if (success && currentOrder) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
                <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-6">
                    Thank you for your order. Order #{currentOrder._id?.substring(0, 8)} has been confirmed.
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-500">Redirecting to your orders...</p>
            </div>
        );
    }

    if (items.length === 0 && !success) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
                <button
                    onClick={() => navigate('/')}
                    className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
                >
                    Shop Now
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <form onSubmit={handleSubmit}>
                        {/* Shipping Information */}
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        disabled
                                        className="w-full px-3 py-2 border rounded bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-3 py-2 border rounded bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                                    <input
                                        type="text"
                                        name="street"
                                        value={shippingInfo.street}
                                        onChange={handleShippingChange}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        placeholder="123 Main Street"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingInfo.city}
                                            onChange={handleShippingChange}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                            placeholder="Johannesburg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                                        <select
                                            name="province"
                                            value={shippingInfo.province}
                                            onChange={handleShippingChange}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                        >
                                            <option value="">Select Province</option>
                                            <option value="Gauteng">Gauteng</option>
                                            <option value="Western Cape">Western Cape</option>
                                            <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                                            <option value="Eastern Cape">Eastern Cape</option>
                                            <option value="Limpopo">Limpopo</option>
                                            <option value="Mpumalanga">Mpumalanga</option>
                                            <option value="North West">North West</option>
                                            <option value="Free State">Free State</option>
                                            <option value="Northern Cape">Northern Cape</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={shippingInfo.postalCode}
                                            onChange={handleShippingChange}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                            placeholder="2001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                        <input
                                            type="text"
                                            value="South Africa"
                                            disabled
                                            className="w-full px-3 py-2 border rounded bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white p-6 rounded-lg shadow mb-6">
                            <div className="flex items-center mb-4">
                                <CreditCard size={24} className="mr-2 text-green-600" />
                                <h2 className="text-xl font-semibold">Payment Information</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={paymentInfo.cardNumber}
                                        onChange={handlePaymentChange}
                                        placeholder="1234 5678 9012 3456"
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        maxLength="19"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (MM/YY) *</label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={paymentInfo.expiryDate}
                                            onChange={handlePaymentChange}
                                            placeholder="MM/YY"
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                            maxLength="5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={paymentInfo.cvv}
                                            onChange={handlePaymentChange}
                                            placeholder="123"
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                            required
                                            maxLength="4"
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>💳 Test card for development: 4242 4242 4242 4242</p>
                                    <p>Expiry: Any future date | CVV: Any 3 digits</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || submitting}
                            className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            {(loading || submitting) ? (
                                <>
                                    <Loader size={20} className="mr-2 animate-spin" />
                                    Processing Order...
                                </>
                            ) : (
                                <>
                                    <Lock size={20} className="mr-2" />
                                    Place Order - {formatPrice(cartTotal.total)}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-gray-50 p-6 rounded-lg shadow sticky top-4">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                            {items.map(item => (
                                <div key={item.productId || item.id} className="flex justify-between items-center border-b pb-4">
                                    <div className="flex items-center">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded mr-3"
                                        />
                                        <div>
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-medium text-green-600">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2">
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
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span className="text-green-600">{formatPrice(cartTotal.total)}</span>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Note:</strong> This is a demo store. No real payment will be processed.
                                Use test card details provided.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;