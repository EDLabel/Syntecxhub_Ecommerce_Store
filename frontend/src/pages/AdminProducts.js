import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Package, Edit, Trash2, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, calculateCartTotal } from '../utils/currency';

const AdminProducts = () => {
    const { token } = useSelector(state => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('/api/admin/products', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/api/admin/products/${productId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProducts(products.filter(product => product._id !== productId));
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleEditProduct = (productId) => {
        navigate(`/admin/products/edit/${productId}`);
    };

    const handleCreateProduct = () => {
        navigate('/admin/products/new');
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                    <p className="text-gray-600">Manage all products in the store</p>
                </div>
                <button
                    onClick={handleCreateProduct}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Add Product
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex space-x-2">
                                <button
                                    onClick={() => handleEditProduct(product._id)}
                                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-3">{product.category}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold">{formatPrice(product.price)}</span>
                                <div className="text-sm text-gray-600">
                                    Stock: {product.stock}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminProducts;
