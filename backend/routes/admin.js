const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token') ||
            req.header('Authorization')?.replace('Bearer ', '') ||
            req.query.token;

        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_12345');

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Admin auth error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }

        res.status(500).json({ error: 'Authentication failed' });
    }
};

router.get('/dashboard/stats', adminAuth, async (req, res) => {
    try {
        // Get counts
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name price');

        // Get sales data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get top products
        const topProducts = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    productName: { $first: "$orderItems.name" },
                    totalSold: { $sum: "$orderItems.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Get order status counts
        const orderStatus = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                users: userCount,
                products: productCount,
                orders: orderCount,
                recentOrders: recentOrders.length,
                totalSales: recentSales.reduce((sum, day) => sum + day.totalSales, 0)
            },
            recentOrders,
            recentSales,
            topProducts,
            orderStatus
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
});


// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find({}, '-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Get user by ID
router.get('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get user's orders
        const userOrders = await Order.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            user,
            recentOrders: userOrders
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Update user
router.put('/users/:id', adminAuth, async (req, res) => {
    try {
        const { name, email, role, isActive } = req.body;

        // Don't allow changing own role or status
        if (req.params.id === req.user._id.toString()) {
            if (role && role !== req.user.role) {
                return res.status(400).json({ error: 'Cannot change your own role' });
            }
            if (isActive !== undefined && !isActive) {
                return res.status(400).json({ error: 'Cannot deactivate your own account' });
            }
        }

        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (role) updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        // Don't allow deleting own account
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ======================
// PRODUCT MANAGEMENT
// ======================

// Get all products with filters
router.get('/products', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};

        // Filter by category
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Filter by stock status
        if (req.query.stockStatus === 'low') {
            query.stock = { $lt: 10 };
        } else if (req.query.stockStatus === 'out') {
            query.stock = 0;
        }

        // Filter by active status
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

// Create product
router.post('/products', adminAuth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update product
router.put('/products/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Get all categories
router.get('/categories', adminAuth, async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $group: { _id: "$category" } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            categories: categories.map(c => c._id)
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

// Sales analytics
router.get('/analytics/sales', adminAuth, async (req, res) => {
    try {
        const { period = 'monthly', year } = req.query;

        let groupFormat;
        if (period === 'daily') {
            groupFormat = "%Y-%m-%d";
        } else if (period === 'monthly') {
            groupFormat = "%Y-%m";
        } else if (period === 'yearly') {
            groupFormat = "%Y";
        }

        const match = {};
        if (year) {
            match.createdAt = {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
            };
        }

        const salesData = await Order.aggregate([
            { $match: { ...match, isPaid: true } },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    orderCount: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            period,
            salesData
        });
    } catch (error) {
        console.error('Sales analytics error:', error);
        res.status(500).json({ error: 'Failed to get sales analytics' });
    }
});

// Product analytics
router.get('/analytics/products', adminAuth, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const productStats = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    name: { $first: "$orderItems.name" },
                    totalSold: { $sum: "$orderItems.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
                    avgPrice: { $avg: "$orderItems.price" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: parseInt(limit) }
        ]);

        // Get product details
        for (let stat of productStats) {
            const product = await Product.findById(stat._id).select('stock category');
            if (product) {
                stat.stock = product.stock;
                stat.category = product.category;
            }
        }

        res.json({
            success: true,
            topProducts: productStats
        });
    } catch (error) {
        console.error('Product analytics error:', error);
        res.status(500).json({ error: 'Failed to get product analytics' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Valid role is required (user or admin)' });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            message: `User role updated to ${role}`,
            user
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Get all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required' });
        }
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Get settings
router.get('/settings', adminAuth, async (req, res) => {
    try {
        // In production, load from database or config file
        const settings = {
            storeName: 'e-Store',
            storeDescription: 'Your premier e-commerce destination',
            contactEmail: 'contact@yourstore.com',
            supportPhone: '+27 11 123 4567',
            stripePublishableKey: '',
            stripeSecretKey: '',
            payPalClientId: '',
            defaultShippingFee: 45.00,
            freeShippingThreshold: 500.00,
            vatRate: 15,
            requireEmailVerification: false,
            enableTwoFactor: false,
            sessionTimeout: 60,
            maintenanceMode: false,
            enableLogging: true,
            logLevel: 'info'
        };

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// Update settings
router.put('/settings', adminAuth, async (req, res) => {
    try {
        const settings = req.body;

        // TODO: Save to database or config file in production
        console.log('Settings updated:', settings);

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;