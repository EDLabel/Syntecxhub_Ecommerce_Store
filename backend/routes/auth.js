const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ======================
// MIDDLEWARE
// ======================
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token') ||
            req.header('Authorization')?.replace('Bearer ', '') ||
            req.query.token;

        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_12345');
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }

        res.status(500).json({ error: 'Authentication failed' });
    }
};

// ======================
// REGISTER USER
// ======================
router.post('/register', async (req, res) => {
    try {
        console.log('Register request:', req.body.email);

        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'All fields are required',
                missing: {
                    name: !name,
                    email: !email,
                    password: !password
                }
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'user'
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_12345',
            { expiresIn: '7d' }
        );

        console.log('User registered:', user.email);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ======================
// LOGIN USER
// ======================
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt:', req.body.email);

        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required',
                missing: {
                    email: !email,
                    password: !password
                }
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({
                error: 'Invalid credentials',
                suggestion: 'Please check your email and password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('Invalid password for:', email);
            return res.status(400).json({
                error: 'Invalid credentials',
                suggestion: 'Please check your email and password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_12345',
            { expiresIn: '7d' }
        );

        console.log('Login successful:', user.email);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ======================
// GET CURRENT USER
// ======================
router.get('/me', authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                address: req.user.address,
                phone: req.user.phone,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user information' });
    }
});

// ======================
// UPDATE USER PROFILE
// ======================
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (address) updates.address = address;
        if (phone) updates.phone = phone;

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

// ======================
// CHANGE PASSWORD
// ======================
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password are required' });
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

// ======================
// LOGOUT (Client-side)
// ======================
router.post('/logout', authMiddleware, (req, res) => {
    // Note: JWT is stateless, so logout is handled client-side by removing the token
    res.json({
        success: true,
        message: 'Logout successful (remove token client-side)'
    });
});

// ======================
// GET ALL USERS (Admin only)
// ======================
router.get('/users', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const users = await User.find({}, '-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// ======================
// UPDATE USER ROLE (Admin only)
// ======================
router.put('/users/:userId/role', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Valid role is required (user or admin)' });
        }

        // Cannot change own role
        if (req.params.userId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
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

module.exports = router;
