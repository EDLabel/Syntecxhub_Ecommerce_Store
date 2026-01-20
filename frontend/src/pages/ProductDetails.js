import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentProduct, loading, error } = useSelector(state => state.products);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [id, dispatch]);

    const handleAddToCart = () => {
        if (currentProduct) {
            dispatch(addToCart({
                id: currentProduct._id,
                name: currentProduct.name,
                price: currentProduct.price,
                image: currentProduct.image,
                quantity
            }));
            toast.success('Added to cart!');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Loading product details...</div>
            </div>
        );
    }

    if (error || !currentProduct) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    {error || 'Product not found'}
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 flex items-center text-blue-600"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/')}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Products
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img
                        src={currentProduct.image}
                        alt={currentProduct.name}
                        className="w-full h-96 object-cover rounded-lg shadow-md"
                    />
                </div>

                <div>
                    <h1 className="text-3xl font-bold mb-4">{currentProduct.name}</h1>
                    <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={20} fill={i < currentProduct.rating ? 'currentColor' : 'none'} />
                            ))}
                        </div>
                        <span className="ml-2 text-gray-600">
              ({currentProduct.numReviews} reviews)
            </span>
                    </div>

                    <p className="text-gray-700 mb-6">{currentProduct.description}</p>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Features:</h3>
                        <ul className="list-disc list-inside text-gray-600">
                            {currentProduct.features?.map((feature, index) => (
                                <li key={index}>{feature}</li>
                            )) || <li>No features listed</li>}
                        </ul>
                    </div>

                    <div className="mb-6">
            <span className="text-3xl font-bold text-blue-600">
              ${currentProduct.price.toFixed(2)}
            </span>
                        {currentProduct.discount > 0 && (
                            <span className="ml-2 text-sm text-red-600 line-through">
                ${(currentProduct.price / (1 - currentProduct.discount / 100)).toFixed(2)}
              </span>
                        )}
                    </div>

                    <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${currentProduct.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {currentProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-1 border rounded-l"
                            >
                                -
                            </button>
                            <span className="px-4 py-1 border-t border-b">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-3 py-1 border rounded-r"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={currentProduct.stock === 0}
                            className={`flex items-center px-6 py-3 rounded font-semibold ${currentProduct.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            <ShoppingCart size={20} className="mr-2" />
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
