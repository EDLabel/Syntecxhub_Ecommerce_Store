const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        set: v => Math.round(v * 100) / 100 // Ensure 2 decimal places
    },
    currency: {
        type: String,
        default: 'ZAR',
        enum: ['ZAR', 'USD', 'EUR'] // You can add more currencies
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    features: [String],
    brand: String,
    colors: [String],
    sizes: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);