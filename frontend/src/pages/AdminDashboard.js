import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    Users, Package, DollarSign, TrendingUp,
    ShoppingCart, Activity, CreditCard, Star
} from 'lucide-react';
import { formatPrice, calculateCartTotal } from '../utils/currency';

const AdminDashboard = () => {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
        activeUsers: 0
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // Fetch dashboard data
        // This would be API calls in a real app
        setStats({
            totalUsers: 1250,
            totalProducts: 156,
            totalOrders: 3420,
            totalRevenue: 154230.50,
            todayOrders: 24,
            activeUsers: 750
        });

        setRecentOrders([
            { id: 1, customer: 'John Doe', amount: 129.99, status: 'delivered', date: '2024-01-15' },
            { id: 2, customer: 'Jane Smith', amount: 299.99, status: 'processing', date: '2024-01-15' },
            { id: 3, customer: 'Bob Johnson', amount: 89.99, status: 'pending', date: '2024-01-14' },
            { id: 4, customer: 'Alice Brown', amount: 199.99, status: 'delivered', date: '2024-01-14' },
            { id: 5, customer: 'Charlie Wilson', amount: 59.99, status: 'cancelled', date: '2024-01-13' },
        ]);

        setTopProducts([
            { id: 1, name: 'Wireless Headphones', sales: 245, revenue: 29400 },
            { id: 2, name: 'Smart Watch', sales: 189, revenue: 35910 },
            { id: 3, name: 'Running Shoes', sales: 156, revenue: 14040 },
            { id: 4, name: 'Laptop Backpack', sales: 128, revenue: 6398 },
            { id: 5, name: 'Coffee Maker', sales: 95, revenue: 7599 },
        ]);

        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setOrders(data.orders || []);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        if (user?.role === 'admin') {
            fetchOrders();
        }
    }, [user]);

    const statCards = [
        {
            title: 'Total Revenue',
            value: `${formatPrice(stats.totalRevenue)}`, // Use formatPrice
            icon: DollarSign,
            color: 'bg-green-500',
            trend: '+12.5%',
            trendUp: true
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            color: 'bg-blue-500',
            trend: '+8.2%',
            trendUp: true
        },
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            color: 'bg-purple-500',
            trend: '+5.7%',
            trendUp: true
        },
        {
            title: 'Total Products',
            value: stats.totalProducts.toLocaleString(),
            icon: Package,
            color: 'bg-yellow-500',
            trend: '+3.4%',
            trendUp: true
        }
    ];

    const statusColors = {
        delivered: 'bg-green-100 text-green-800',
        processing: 'bg-blue-100 text-blue-800',
        pending: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Welcome back, <span className="font-semibold">{user?.name}</span>! Here's what's happening with your store.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    <div className="flex items-center mt-2">
                                        <TrendingUp size={16} className={`mr-1 ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                                        <span className={`text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend} from last month
                    </span>
                                    </div>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <stat.icon size={24} className="text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts and Recent Orders */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                            <a href="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View all
                            </a>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {recentOrders && recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #ORD-{order.id.toString().padStart(4, '0')}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {order.customer}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                {formatPrice(order.amount)} {/* Use formatPrice */}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                                            </td>
                                        </tr>
                                    ))
                                ): (
                                    // Show "No recent orders" message
                                    <div className="text-center py-4">
                                        <p className="text-gray-600">No recent orders</p>
                                    </div>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Top Selling Products</h2>
                            <a href="/admin/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View all
                            </a>
                        </div>
                        <div className="space-y-4">
                            {topProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Package size={20} className="text-blue-600" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="font-medium text-gray-900">{product.name}</p>
                                            <p className="text-sm text-gray-600">{product.sales} units sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">${product.revenue.toLocaleString()}</p>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Star size={14} className="text-yellow-400 mr-1" fill="currentColor" />
                                            4.8
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Manage Products</h3>
                                <p className="text-blue-100 mt-2">Add, edit, or remove products</p>
                            </div>
                            <Activity size={32} className="text-blue-200" />
                        </div>
                        <Link
                            to="/admin/products"
                            className="mt-4 inline-block bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50"
                        >
                            Go to Products
                        </Link>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Manage Orders</h3>
                                <p className="text-green-100 mt-2">Process and track orders</p>
                            </div>
                            <ShoppingCart size={32} className="text-green-200" />
                        </div>
                        <Link
                            to="/admin/orders"
                            className="mt-4 inline-block bg-white text-green-600 px-4 py-2 rounded font-medium hover:bg-green-50"
                        >
                            Go to Orders
                        </Link>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Manage Users</h3>
                                <p className="text-purple-100 mt-2">View and manage users</p>
                            </div>
                            <Users size={32} className="text-purple-200" />
                        </div>
                        <Link
                            to="/admin/users"
                            className="mt-4 inline-block bg-white text-purple-600 px-4 py-2 rounded font-medium hover:bg-purple-50"
                        >
                            Go to Users
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
