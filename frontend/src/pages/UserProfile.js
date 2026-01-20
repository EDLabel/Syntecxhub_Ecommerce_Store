import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserOrders } from '../features/orders/orderSlice';
import { toast } from 'react-toastify';
import { User, MapPin, Phone, ShoppingBag, Package, Calendar, DollarSign, Truck, CheckCircle, Clock } from 'lucide-react';
import { formatPrice } from '../utils/currency';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { orders, loading, error } = useSelector(state => state.orders);
    const [activeTab, setActiveTab] = useState('orders');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States'
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'United States'
                }
            });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'orders') {
            dispatch(getUserOrders());
        }
    }, [activeTab, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered':
                return <CheckCircle size={16} className="mr-2" />;
            case 'shipped':
                return <Truck size={16} className="mr-2" />;
            case 'processing':
                return <Package size={16} className="mr-2" />;
            default:
                return <Clock size={16} className="mr-2" />;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();

            // Update the user in Redux store
            dispatch({ type: 'auth/setUser', payload: data.user });

            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Failed to update profile');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <User size={32} className="text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-600">{user.email}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <ShoppingBag size={20} className="inline mr-2" />
                                My Orders ({orders?.length || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <User size={20} className="inline mr-2" />
                                Profile
                            </button>
                            <button
                                onClick={() => setActiveTab('address')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'address' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <MapPin size={20} className="inline mr-2" />
                                Address
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {activeTab === 'profile' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="flex items-center">
                                            <Phone size={20} className="text-gray-400 mr-2" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Account Type
                                        </label>
                                        <div className={`px-3 py-2 border rounded-md ${user.role === 'admin' ? 'border-purple-300 bg-purple-50' : 'border-green-300 bg-green-50'}`}>
                      <span className={`font-medium ${user.role === 'admin' ? 'text-purple-700' : 'text-green-700'}`}>
                        {user.role === 'admin' ? 'Administrator' : 'Regular Customer'}
                      </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">My Orders</h2>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading orders...</p>
                                </div>
                            ) : orders && orders.length > 0 ? (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <div key={order._id} className="border rounded-lg overflow-hidden">
                                            {/* Order Header */}
                                            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">Order #{order._id.substring(0, 8)}</p>
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <Calendar size={14} className="mr-1" />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                                                </div>
                                            </div>

                                            {/* Order Items */}
                                            <div className="p-6">
                                                {order.orderItems && order.orderItems.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                                        <div className="flex items-center">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-16 h-16 object-cover rounded mr-4"
                                                            />
                                                            <div>
                                                                <h4 className="font-medium">{item.name}</h4>
                                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                                                            <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Footer */}
                                            <div className="bg-gray-50 px-6 py-4 border-t">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Shipping to:</p>
                                                        <p className="font-medium">{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Total</p>
                                                        <p className="text-xl font-bold text-green-600">{formatPrice(order.totalPrice)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-8 text-center">
                                    <Package size={48} className="text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                    <p className="text-gray-600 mb-6">Your order history will appear here once you make purchases.</p>
                                    <a
                                        href="/"
                                        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700"
                                    >
                                        Start Shopping
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'address' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="123 Main St"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="address.state"
                                            value={formData.address.state}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ZIP Code
                                        </label>
                                        <input
                                            type="text"
                                            name="address.zipCode"
                                            value={formData.address.zipCode}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Country
                                        </label>
                                        <select
                                            name="address.country"
                                            value={formData.address.country}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="Australia">Australia</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
