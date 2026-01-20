import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, addToCartGuest } from '../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingBag } from 'lucide-react';
import { formatPrice, calculateDiscountPrice, formatDiscount } from '../utils/currency';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector(state => state.auth);

    const handleAddToCart = (e) => {
        e.stopPropagation();

        if (!product || !product._id) {
            toast.error('Product information is incomplete');
            return;
        }

        if (isAuthenticated) {
            dispatch(addToCart({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            }));
        } else {
            dispatch(addToCartGuest({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            }));
        }

        toast.success('Added to cart!');
    };

    const handleCardClick = () => {
        if (product && product._id) {
            navigate(`/product/${product._id}`);
        } else {
            toast.error('Cannot view product details');
        }
    };

    if (!product) {
        return null;
    }

    const hasDiscount = product.discount > 0;
    const discountedPrice = hasDiscount ? calculateDiscountPrice(product.price, product.discount) : product.price;

    return (
        <div
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={handleCardClick}
        >
            <div className="relative">
                <img
                    src={product.image || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300';
                    }}
                />
                {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                        -{formatDiscount(product.discount)}
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400">
                        {'★'.repeat(Math.floor(product.rating || 0))}
                        {'☆'.repeat(5 - Math.floor(product.rating || 0))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
            ({product.numReviews || 0})
          </span>
                </div>

                <div className="flex justify-between items-center">
                    <div>
            <span className="text-xl font-bold text-green-600">
                            {formatPrice(discountedPrice)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ShoppingBag size={18} className="mr-2" />
                        Add
                    </button>
                </div>

                {product.stock !== undefined && product.stock <= 10 && product.stock > 0 && (
                    <div className="mt-3 text-xs text-orange-600">
                        Only {product.stock} left in stock!
                    </div>
                )}

                {product.stock === 0 && (
                    <div className="mt-3 text-xs text-red-600">
                        Out of stock
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
