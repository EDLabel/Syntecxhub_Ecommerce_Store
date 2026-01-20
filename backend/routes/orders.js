const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/authMiddleware');

// Create order
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('🛒 Creating order for user:', req.user._id);
        console.log('📦 Order data received:', JSON.stringify(req.body, null, 2));

        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        } = req.body;

        // Validate required fields
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: 'No order items provided' });
        }

        if (!shippingAddress) {
            return res.status(400).json({ error: 'Shipping address is required' });
        }

        // Validate and process each item
        const processedItems = [];
        for (const item of orderItems) {
            if (!item.product || !item.name || !item.quantity || !item.price) {
                return res.status(400).json({ error: 'Invalid order item format' });
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            // Update stock
            product.stock -= item.quantity;
            await product.save();

            processedItems.push({
                product: item.product,
                name: item.name,
                quantity: parseInt(item.quantity),
                price: parseFloat(item.price),
                image: item.image
            });
        }

        // Create order
        const order = new Order({
            orderItems: processedItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice: parseFloat(itemsPrice),
            taxPrice: parseFloat(taxPrice),
            shippingPrice: parseFloat(shippingPrice),
            totalPrice: parseFloat(totalPrice)
        });

        const createdOrder = await order.save();
        console.log('✅ Order created successfully:', createdOrder._id);

        // Populate for response
        const populatedOrder = await Order.findById(createdOrder._id)
            .populate('orderItems.product', 'name price image');

        res.status(201).json(populatedOrder);

    } catch (err) {
        console.error('❌ Create order error:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({
            error: 'Server error creating order',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('orderItems.product', 'name price image');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if the order belongs to the user or user is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get logged in user's orders
router.get('/my/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('orderItems.product', 'name price image');
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order to paid
router.put('/:id/pay', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;