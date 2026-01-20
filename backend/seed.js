const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
require('dotenv').config();

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const seedDatabase = async () => {
    try {
        console.log('Starting database seed...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('Cleared existing data');

        // Create users with properly hashed passwords
        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: await hashPassword('admin123'),
                role: 'admin',
                address: {
                    street: '123 Admin St',
                    city: 'Admin City',
                    state: 'AC',
                    zipCode: '12345',
                    country: 'Adminland'
                },
                phone: '123-456-7890'
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: await hashPassword('user123'),
                role: 'user',
                address: {
                    street: '456 User Ave',
                    city: 'User City',
                    state: 'UC',
                    zipCode: '67890',
                    country: 'Userland'
                },
                phone: '987-654-3210'
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: await hashPassword('password123'),
                role: 'user',
                address: {
                    street: '789 Main St',
                    city: 'Somewhere',
                    state: 'ST',
                    zipCode: '54321',
                    country: 'USA'
                },
                phone: '555-123-4567'
            }
        ];

        await User.insertMany(users);
        console.log(`Created ${users.length} users`);

        // Create sample products
        const products = [
            {
                name: 'iPhone 15 Pro',
                description: 'Latest Apple smartphone with A17 Pro chip',
                price: 14999.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
                stock: 50,
                rating: 4.8,
                numReviews: 120
            },
            {
                name: 'MacBook Pro 16"',
                description: 'Professional laptop with M3 Max chip',
                price: 22499.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
                stock: 25,
                rating: 4.9,
                numReviews: 89
            },
            {
                name: 'Sony Headphones',
                description: 'Noise cancelling wireless headphones',
                price: 1299.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                stock: 100,
                rating: 4.6,
                numReviews: 210
            },
            {
                name: 'Nike Air Max',
                description: 'Comfortable running shoes',
                price: 3129.99,
                currency: 'ZAR',
                category: 'Fashion',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
                stock: 200,
                rating: 4.5,
                numReviews: 450
            },
            {
                name: 'Leather Backpack',
                description: 'Premium leather laptop backpack',
                price: 789.99,
                currency: 'ZAR',
                category: 'Fashion',
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                stock: 75,
                rating: 4.4,
                numReviews: 120
            },
            {
                name: 'Smart Watch',
                description: 'Fitness tracking smartwatch',
                price: 2199.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                stock: 150,
                rating: 4.3,
                numReviews: 300
            },
            {
                name: 'Wireless Bluetooth Headphones',
                description: 'Noise cancelling wireless headphones with premium sound quality.',
                price: 1129.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                stock: 25,
                rating: 4.5,
                numReviews: 120,
                features: ['Noise Cancelling', '30-hour Battery', 'Wireless', 'Foldable']
            },
            {
                name: 'Smart Watch Series 5',
                description: 'Advanced smart watch with fitness tracking and notifications.',
                price: 3199.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                stock: 15,
                rating: 4.3,
                numReviews: 89,
                features: ['Heart Rate Monitor', 'GPS', 'Water Resistant', 'Sleep Tracking']
            },
            {
                name: 'Running Shoes',
                description: 'Comfortable running shoes with excellent arch support.',
                price: 2289.99,
                currency: 'ZAR',
                category: 'Sports',
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
                stock: 40,
                rating: 4.7,
                numReviews: 210,
                features: ['Lightweight', 'Breathable', 'Shock Absorbing', 'Non-slip']
            },
            {
                name: 'Laptop Backpack',
                description: 'Waterproof laptop backpack with multiple compartments.',
                price: 249.99,
                currency: 'ZAR',
                category: 'Accessories',
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
                stock: 30,
                rating: 4.2,
                numReviews: 75,
                features: ['Waterproof', 'Laptop Compartment', 'USB Port', 'Anti-theft']
            },
            {
                name: 'Coffee Maker',
                description: 'Programmable coffee maker with thermal carafe.',
                price: 879.99,
                currency: 'ZAR',
                category: 'Home',
                image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
                stock: 20,
                rating: 4.4,
                numReviews: 95,
                features: ['Programmable', 'Thermal Carafe', '24-hour Timer', 'Auto Shut-off']
            },
            {
                name: 'Yoga Mat',
                description: 'Eco-friendly yoga mat with excellent grip.',
                price: 929.99,
                currency: 'ZAR',
                category: 'Sports',
                image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400',
                stock: 50,
                rating: 4.6,
                numReviews: 150,
                features: ['Non-slip', 'Eco-friendly', 'Easy to Clean', 'Lightweight']
            },
            {
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse with long battery life.',
                price: 524.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
                stock: 60,
                rating: 4.1,
                numReviews: 85,
                features: ['Wireless', 'Ergonomic', 'Long Battery Life', 'Silent Click']
            },
            {
                name: 'Desk Lamp',
                description: 'LED desk lamp with adjustable brightness and color temperature.',
                price: 739.99,
                currency: 'ZAR',
                category: 'Home',
                image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
                stock: 35,
                rating: 4.3,
                numReviews: 65,
                features: ['LED', 'Adjustable Brightness', 'Color Temperature Control', 'USB Charging']
            },
            {
                name: 'Smartphone X',
                description: 'Latest smartphone with advanced features',
                price: 2699.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
                stock: 50,
                rating: 4.5,
                numReviews: 120
            },
            {
                name: 'Laptop Pro',
                description: 'High-performance laptop for professionals',
                price: 3299.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                stock: 25,
                rating: 4.7,
                numReviews: 89
            },
            {
                name: 'Wireless Earbuds',
                description: 'True wireless earbuds with noise cancellation',
                price: 949.99,
                currency: 'ZAR',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400',
                stock: 100,
                rating: 4.3,
                numReviews: 210
            }
        ];

        await Product.insertMany(products);
        console.log(`Created ${products.length} products`);

        // Get user IDs for orders
        const createdUsers = await User.find({ email: { $in: ['john@example.com', 'jane@example.com'] } });
        const createdProducts = await Product.find().limit(3);

        // Create sample orders
        const orders = [
            {
                user: createdUsers[0]._id, // John
                orderItems: [
                    {
                        product: createdProducts[0]._id,
                        name: createdProducts[0].name,
                        quantity: 1,
                        price: createdProducts[0].price,
                        image: createdProducts[0].image
                    },
                    {
                        product: createdProducts[1]._id,
                        name: createdProducts[1].name,
                        quantity: 2,
                        price: createdProducts[1].price,
                        image: createdProducts[1].image
                    }
                ],
                shippingAddress: createdUsers[0].address,
                paymentMethod: 'Credit Card',
                itemsPrice: createdProducts[0].price + (createdProducts[1].price * 2),
                taxPrice: 89.99,
                shippingPrice: 9.99,
                totalPrice: createdProducts[0].price + (createdProducts[1].price * 2) + 89.99 + 9.99,
                isPaid: true,
                paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                isDelivered: true,
                deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                status: 'delivered'
            },
            {
                user: createdUsers[1]._id, // Jane
                orderItems: [
                    {
                        product: createdProducts[2]._id,
                        name: createdProducts[2].name,
                        quantity: 1,
                        price: createdProducts[2].price,
                        image: createdProducts[2].image
                    }
                ],
                shippingAddress: createdUsers[1].address,
                paymentMethod: 'PayPal',
                itemsPrice: createdProducts[2].price,
                taxPrice: 23.99,
                shippingPrice: 9.99,
                totalPrice: createdProducts[2].price + 23.99 + 9.99,
                isPaid: true,
                paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                isDelivered: false,
                status: 'shipped'
            }
        ];

        await Order.insertMany(orders);
        console.log(`Created ${orders.length} orders`);

        console.log('\nDatabase seeded successfully!');
        console.log('\nLogin Credentials:');
        console.log('1. Admin: admin@example.com / admin123');
        console.log('2. User: john@example.com / user123');
        console.log('3. User: jane@example.com / password123');
        console.log('\nStats:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Products: ${products.length}`);
        console.log(`   Orders: ${orders.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();