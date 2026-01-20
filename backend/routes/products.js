const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminAuth } = require('../middleware/authMiddleware');

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sort, page = 1, limit = 12, search } = req.query;

        const query = { isActive: true };

        // Apply filters
        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        // Apply sorting
        let sortOption = {};
        if (sort === 'price_asc') {
            sortOption.price = 1;
        } else if (sort === 'price_desc') {
            sortOption.price = -1;
        } else if (sort === 'rating') {
            sortOption.rating = -1;
        } else if (sort === 'newest') {
            sortOption.createdAt = -1;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        // Get unique categories for filters
        const categories = await Product.distinct('category', { isActive: true });

        res.json({
            success: true,
            products,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            categories
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product || !product.isActive) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get related products (same category)
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true
        }).limit(4);

        res.json({
            success: true,
            product,
            relatedProducts
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

// Create product (admin only)
router.post('/', adminAuth, async (req, res) => {
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

// Update product (admin only)
router.put('/:id', adminAuth, async (req, res) => {
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

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
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

module.exports = router;