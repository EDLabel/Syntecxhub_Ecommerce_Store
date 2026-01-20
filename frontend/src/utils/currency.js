export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
};

// Format price without currency symbol (just number with formatting)
export const formatPriceNumber = (price) => {
    return new Intl.NumberFormat('en-ZA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
};

// Get currency symbol
export const getCurrencySymbol = () => 'R';

// Calculate discount price
export const calculateDiscountPrice = (price, discount) => {
    const discountAmount = (price * discount) / 100;
    return price - discountAmount;
};

// Format discount percentage
export const formatDiscount = (discount) => {
    return `${discount}%`;
};

// Calculate cart totals with ZAR formatting
export const calculateCartTotal = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 45.00; // Standard shipping in ZAR
    const tax = subtotal * 0.15; // 15% VAT for South Africa

    return {
        subtotal,
        shipping,
        tax,
        total: subtotal + shipping + tax,
        formatted: {
            subtotal: formatPrice(subtotal),
            shipping: formatPrice(shipping),
            tax: formatPrice(tax),
            total: formatPrice(subtotal + shipping + tax)
        }
    };
};

// Format order summary with ZAR currency
export const formatOrderSummary = (order) => {
    return {
        ...order,
        formattedItemsPrice: formatPrice(order.itemsPrice),
        formattedShippingPrice: formatPrice(order.shippingPrice),
        formattedTaxPrice: formatPrice(order.taxPrice),
        formattedTotalPrice: formatPrice(order.totalPrice)
    };
};
