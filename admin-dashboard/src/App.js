import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductsManagement from './pages/ProductsManagement';
import OrdersManagement from './pages/OrdersManagement';
import UsersManagement from './pages/UsersManagement';

function App() {
    return (
        <Router>
            <AdminLayout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<ProductsManagement />} />
                    <Route path="/orders" element={<OrdersManagement />} />
                    <Route path="/users" element={<UsersManagement />} />
                </Routes>
            </AdminLayout>
        </Router>
    );
}

export default App;


// /backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '') ||
            req.header('x-auth-token') ||
            req.query.token;

        if (!token) {
            return res.status(401).json({ error: 'No authentication token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_12345');

        // Find user
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

const adminAuth = async (req, res, next) => {
    try {
        await authMiddleware(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { authMiddleware, adminAuth };