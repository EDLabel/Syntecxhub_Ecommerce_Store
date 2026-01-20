import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/currency';
import {
    Package,
    Calendar,
    DollarSign,
    Truck,
    CheckCircle,
    Clock,
    ArrowLeft
} from 'lucide-react';

const MyOrders = () => {
    const { user } = useSelector(state => state.auth);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/orders/my/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle size={20} className="text-green-600" />;
            case 'shipped':
                return <Truck size={20} className="text-blue-600" />;
            case 'processing':
                return <Package size={20} className="text-yellow-600" />;
            default:
                return <Clock size={20} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center text-red-600">
                    <p>Error: {error}</p>
                    <button
                        onClick={fetchOrders}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Link
                    to="/"
                    className="flex items-center text-green-600 hover:text-green-800 mb-4"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Home
                </Link>
                <h1 className="text-3xl font-bold">My Orders</h1>
                <p className="text-gray-600 mt-2">
                    Track and manage all your purchases
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <Package size={64} className="text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
                    <p className="text-gray-600 mb-6">
                        You haven't placed any orders. Start shopping to see your orders here.
                    </p>
                    <Link
                        to="/"
                        className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Order Header */}
                            <div className="border-b p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div>
                                        <div className="flex items-center mb-2">
                      <span className="font-bold text-lg mr-4">
                        Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} flex items-center`}>
                        {getStatusIcon(order.status)}
                                                <span className="ml-1">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Calendar size={16} className="mr-2" />
                                            <span>
                        {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                      </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <div className="text-2xl font-bold text-green-600">
                                            {formatPrice(order.totalPrice)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <h3 className="font-semibold mb-4">Items in this order:</h3>
                                <div className="space-y-4">
                                    {order.orderItems.map((item, index) => (
                                        <div key={index} className="flex items-center border-b pb-4 last:border-b-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded mr-4"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.name}</h4>
                                                <div className="flex items-center text-gray-600 mt-1">
                                                    <span className="mr-4">Qty: {item.quantity}</span>
                                                    <span>Price: {formatPrice(item.price)} each</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold">
                                                    {formatPrice(item.price * item.quantity)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Footer */}
                            <div className="bg-gray-50 px-6 py-4 border-t">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Shipping Address</h4>
                                        {order.shippingAddress ? (
                                            <div className="text-gray-600">
                                                <p>{order.shippingAddress.street}</p>
                                                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                                <p>{order.shippingAddress.zipCode}</p>
                                                <p>{order.shippingAddress.country}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No shipping address provided</p>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Payment Details</h4>
                                        <div className="text-gray-600 space-y-1">
                                            <p className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>{formatPrice(order.itemsPrice)}</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span>Shipping:</span>
                                                <span>{formatPrice(order.shippingPrice)}</span>
                                            </p>
                                            <p className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>{formatPrice(order.taxPrice)}</span>
                                            </p>
                                            <p className="flex justify-between font-bold text-lg border-t pt-2">
                                                <span>Total:</span>
                                                <span className="text-green-600">{formatPrice(order.totalPrice)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Orders Summary */}
            {orders.length > 0 && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Orders Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{orders.length}</div>
                            <div className="text-gray-600">Total Orders</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {formatPrice(orders.reduce((sum, order) => sum + order.totalPrice, 0))}
                            </div>
                            <div className="text-gray-600">Total Spent</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {orders.filter(o => o.status === 'delivered').length}
                            </div>
                            <div className="text-gray-600">Delivered Orders</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;
