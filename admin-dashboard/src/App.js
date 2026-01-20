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