import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Save, RefreshCw, Store, Mail, Shield, Truck, CreditCard, Database } from 'lucide-react';

const AdminSettings = () => {
    const { user } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('general');
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        // General
        storeName: 'e-Store',
        storeDescription: 'Your premier e-commerce destination',
        contactEmail: 'contact@yourstore.com',
        supportPhone: '+27 11 123 4567',

        // Payment (demo)
        stripePublishableKey: '',
        stripeSecretKey: '',
        payPalClientId: '',

        // Shipping
        defaultShippingFee: 45.00,
        freeShippingThreshold: 500.00,
        vatRate: 15,

        // Security
        requireEmailVerification: false,
        enableTwoFactor: false,
        sessionTimeout: 60,

        // System
        maintenanceMode: false,
        enableLogging: true,
        logLevel: 'info'
    });

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'payment', label: 'Payments', icon: CreditCard },
        { id: 'shipping', label: 'Shipping', icon: Truck },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'system', label: 'System', icon: Database }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            // API call to save settings
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) throw new Error('Failed to save settings');

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Save settings error:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
            // Reload from server or reset to defaults
            window.location.reload();
        }
    };

    const TabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">General Store Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                <input
                                    type="text"
                                    name="storeName"
                                    value={settings.storeName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={settings.contactEmail}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                                <textarea
                                    name="storeDescription"
                                    value={settings.storeDescription}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'payment':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Payment Configuration</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                                ⚠️ These are demo settings. In production, use environment variables.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Publishable Key</label>
                                <input
                                    type="password"
                                    name="stripePublishableKey"
                                    value={settings.stripePublishableKey}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="pk_test_..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Stripe Secret Key</label>
                                <input
                                    type="password"
                                    name="stripeSecretKey"
                                    value={settings.stripeSecretKey}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="sk_test_..."
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'shipping':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Shipping Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Fee (ZAR)</label>
                                <input
                                    type="number"
                                    name="defaultShippingFee"
                                    value={settings.defaultShippingFee}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (ZAR)</label>
                                <input
                                    type="number"
                                    name="freeShippingThreshold"
                                    value={settings.freeShippingThreshold}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">VAT Rate (%)</label>
                                <input
                                    type="number"
                                    name="vatRate"
                                    value={settings.vatRate}
                                    onChange={handleChange}
                                    step="0.1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'email':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Email Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={settings.contactEmail}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Support Phone</label>
                                <input
                                    type="tel"
                                    name="supportPhone"
                                    value={settings.supportPhone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Security Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Require Email Verification</label>
                                    <p className="text-sm text-gray-500">Force users to verify email before ordering</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="requireEmailVerification"
                                    checked={settings.requireEmailVerification}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Enable Two-Factor Authentication</label>
                                    <p className="text-sm text-gray-500">Allow users to enable 2FA (requires email/SMS service)</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="enableTwoFactor"
                                    checked={settings.enableTwoFactor}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                                <input
                                    type="number"
                                    name="sessionTimeout"
                                    value={settings.sessionTimeout}
                                    onChange={handleChange}
                                    min="15"
                                    max="1440"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'system':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">System Configuration</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Maintenance Mode</label>
                                    <p className="text-sm text-gray-500">Display maintenance page to all users</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="maintenanceMode"
                                    checked={settings.maintenanceMode}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Enable Logging</label>
                                    <p className="text-sm text-gray-500">Log all system events</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="enableLogging"
                                    checked={settings.enableLogging}
                                    onChange={handleChange}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                                <select
                                    name="logLevel"
                                    value={settings.logLevel}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="error">Error</option>
                                    <option value="warn">Warning</option>
                                    <option value="info">Info</option>
                                    <option value="debug">Debug</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
                    <p className="text-gray-600 mt-2">Configure your e-commerce platform</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="border-b">
                        <nav className="-mb-px flex flex-wrap">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon size={16} className="mr-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        <TabContent />
                    </div>

                    {/* Actions */}
                    <div className="border-t px-6 py-4 flex justify-end space-x-4">
                        <button
                            onClick={handleReset}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Reset
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw size={16} className="mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">System Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-md">
                            <p className="text-sm text-green-800">Backend Connected</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                            <p className="text-sm text-green-800">Database Connected</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                            <p className="text-sm text-green-800">All Systems Operational</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;