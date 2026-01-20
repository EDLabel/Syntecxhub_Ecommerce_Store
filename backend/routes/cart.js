const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

// In-memory cart storage (for development)
// In production, use database or Redis
let carts = {};

// Apply auth middleware to all cart routes
router.use(authMiddleware);

// Get user's cart
router.get('/', (req, res) => {
    try {
        const userId = req.user._id.toString();
        const cart = carts[userId] || { items: [], total: 0 };
        res.json({
            success: true,
            cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

// Add item to cart
router.post('/add', (req, res) => {
    try {
        const { productId, name, price, image, quantity = 1 } = req.body;
        const userId = req.user._id.toString();

        if (!productId || !name || !price) {
            return res.status(400).json({ error: 'Product details are required' });
        }

        if (!carts[userId]) {
            carts[userId] = { items: [], total: 0 };
        }

        const cart = carts[userId];
        const existingItem = cart.items.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.items.push({
                productId,
                name,
                price: parseFloat(price),
                image,
                quantity: parseInt(quantity)
            });
        }

        // Calculate total
        cart.total = cart.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        res.json({
            success: true,
            message: 'Item added to cart',
            cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Remove item from cart
router.delete('/item/:productId', (req, res) => {
    try {
        const userId = req.user._id.toString();
        const productId = req.params.productId;

        if (!carts[userId]) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        carts[userId].items = carts[userId].items.filter(item => item.productId !== productId);

        // Recalculate total
        carts[userId].total = carts[userId].items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        res.json({
            success: true,
            message: 'Item removed from cart',
            cart: carts[userId]
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

// Update item quantity
router.put('/item/:productId', (req, res) => {
    try {
        const userId = req.user._id.toString();
        const productId = req.params.productId;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Valid quantity is required' });
        }

        if (!carts[userId]) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const item = carts[userId].items.find(item => item.productId === productId);

        if (!item) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        item.quantity = parseInt(quantity);

        // Recalculate total
        carts[userId].total = carts[userId].items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        res.json({
            success: true,
            message: 'Item quantity updated',
            cart: carts[userId]
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
});

// Clear cart
router.delete('/', (req, res) => {
    try {
        const userId = req.user._id.toString();
        console.log('Clearing cart for user:', userId);

        if (carts[userId]) {
            carts[userId] = { items: [], total: 0 };
        }

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;