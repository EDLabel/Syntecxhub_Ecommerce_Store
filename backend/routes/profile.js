const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authMiddleware } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        // Get user's orders
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            user,
            orders,
            ordersCount: await Order.countDocuments({ user: req.user._id })
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Get user's orders
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('orderItems.product', 'name price image');

        const total = await Order.countDocuments({ user: req.user._id });

        res.json({
            success: true,
            orders,
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get specific order
router.get('/orders/:orderId', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.user._id
        }).populate('orderItems.product', 'name price image');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

module.exports = router;