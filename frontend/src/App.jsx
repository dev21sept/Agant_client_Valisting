import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainAdminLayout from './components/MainAdminLayout';
import AgentAdminLayout from './components/AgentAdminLayout';
import AgentLayout from './components/AgentLayout';

import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import EbayImport from './pages/EbayImport';
import EditProduct from './pages/EditProduct';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AiFetching from './pages/AiFetching';
import AdminLogin from './pages/AdminLogin';
import Settings from './pages/Settings';
import AgentDashboard from './pages/agent/agent_dashboard';
import AgentClientDashboard from './pages/agent/agent_client_dashboard';

// New Agent Specific Pages (Separated)
import AiFetchingAgent from './pages/agent/AiFetchingAgent';
import EbayImportAgent from './pages/agent/EbayImportAgent';
import ProductListAgent from './pages/agent/ProductListAgent';
import SettingsAgent from './pages/agent/SettingsAgent';

import AgentList from './pages/agent/AgentList';
import ClientList from './pages/agent/ClientList';

import { ToastProvider } from './components/Toast';

// Placeholder ...
const ExtensionPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Extension Listing Tool</h1><p className="text-gray-500 mt-2">Manage your eBay listings via Chrome Extension.</p></div>;
const SingleListingPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Single API Listing</h1><p className="text-gray-500 mt-2">Create high-speed listings using direct eBay APIs.</p></div>;
const BulkListingPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Bulk / Multiple API Lister</h1><p className="text-gray-500 mt-2">Upload multiple products simultaneously.</p></div>;

function App() {
    // ... (rest of state logic)
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('va_admin_session');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('va_admin_session', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('va_admin_session');
        window.location.href = '/';
    };

    if (!user) {
        return (
            <ToastProvider>
                <AdminLogin onLogin={handleLogin} />
            </ToastProvider>
        );
    }

    // Determine Layout - Ensure Admin always has a switcher layout
    const vasterRole = localStorage.getItem('vaster_role');
    const ActiveLayout = (user?.role === 'admin') 
        ? (vasterRole === 'workforce' ? AgentAdminLayout : MainAdminLayout)
        : AgentLayout;

    return (
        <ToastProvider>
            <Router>
                <ActiveLayout onLogout={handleLogout} user={user}>
                    <Routes>
                        <Route path="/" element={
                            user?.role === 'agent'
                                ? <AgentDashboard user={user} />
                                : localStorage.getItem('vaster_role') === 'workforce'
                                    ? <AgentClientDashboard user={user} />
                                    : <Dashboard user={user} />
                        } />
                        <Route path="/products" element={
                            (user?.role === 'agent' || localStorage.getItem('vaster_role') === 'agent')
                                ? <ProductListAgent user={user} />
                                : <ProductList user={user} />
                        } />
                        <Route path="/ebay-import" element={
                            (user?.role === 'agent' || localStorage.getItem('vaster_role') === 'agent')
                                ? <EbayImportAgent user={user} />
                                : <EbayImport user={user} />
                        } />
                        <Route path="/products/edit/:id" element={<EditProduct user={user} />} />
                        <Route path="/ai-fetching" element={
                            (user?.role === 'agent' || localStorage.getItem('vaster_role') === 'agent')
                                ? <AiFetchingAgent user={user} />
                                : <AiFetching user={user} />
                        } />
                        <Route path="/settings" element={
                            (user?.role === 'agent' || localStorage.getItem('vaster_role') === 'agent')
                                ? <SettingsAgent user={user} />
                                : <Settings user={user} />
                        } />
                        <Route path="/agent-dashboard" element={
                            user?.role === 'agent'
                                ? <AgentDashboard user={user} />
                                : <AgentClientDashboard user={user} />
                        } />
                        <Route path="/agents" element={
                            (localStorage.getItem('vaster_role') === 'workforce' || user?.role === 'admin')
                                ? <AgentList user={user} />
                                : <Navigate to="/" replace />
                        } />
                        <Route path="/clients" element={
                            (localStorage.getItem('vaster_role') === 'workforce' || user?.role === 'admin')
                                ? <ClientList user={user} />
                                : <Navigate to="/" replace />
                        } />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        <Route path="/list/extension" element={<ExtensionPage />} />
                        <Route path="/list/single" element={<SingleListingPage />} />
                        <Route path="/list/bulk" element={<BulkListingPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ActiveLayout>
            </Router>
        </ToastProvider>
    );
}

export default App;

