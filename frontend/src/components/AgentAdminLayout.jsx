import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    User, 
    Settings, 
    ShoppingBag, 
    Menu, 
    LogOut,
    Users,
    Database
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { syncEbayData, getEbayConnectionStatus, getEbayAuthUrl, disconnectEbay } from '../services/api';
import { useToast } from '../components/Toast';

const AgentAdminLayout = ({ children, onLogout, user }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [ebayStatus, setEbayStatus] = useState({ connected: false, sellerName: '' });
    const { addToast, showConfirm } = useToast();
    const location = useLocation();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const status = await getEbayConnectionStatus();
                setEbayStatus(status);
            } catch (err) {
                console.error('Failed to fetch eBay status');
            }
        };
        fetchStatus();
    }, []);

    const handleEbayDisconnect = async () => {
        const ok = await showConfirm('Are you sure you want to disconnect this eBay account? You will need to login again to list products.');
        if (!ok) return;
        try {
            await disconnectEbay();
            setEbayStatus({ connected: false, sellerName: '', sellerEmail: '', environment: 'PRODUCTION' });
            addToast('Disconnected successfully', 'success');
        } catch (err) {
            console.error('Failed to disconnect eBay:', err);
            addToast('Disconnect failed', 'error');
        }
    };

    const navGroups = [
        {
            id: 'workforce-mgmt',
            title: 'AGENT CLIENT ADMIN',
            items: [
                { name: 'Dashboard', path: '/agent-dashboard', icon: LayoutDashboard },
                { name: 'Agents', path: '/agents', icon: User },
                { name: 'Clients', path: '/clients', icon: Settings },
            ]
        }
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out
                ${isSidebarOpen ? 'w-64' : 'w-20'}
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:static lg:inset-auto'}
            `}>
                <div className="h-20 flex items-center justify-between px-4 border-b border-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
                            <ShoppingBag className="text-white w-6 h-6" />
                        </div>
                        {isSidebarOpen && <span className="text-xl font-bold text-gray-900 tracking-tight">VA LISTER</span>}
                    </div>
                </div>

                {/* ROLE SWITCHER */}
                {isSidebarOpen && (
                    <div className="mx-4 mt-6 p-1 bg-gray-50 rounded-2xl flex items-center gap-1 border border-gray-100">
                        <button 
                            onClick={() => {
                                localStorage.setItem('vaster_role', 'admin');
                                window.location.href = '/';
                            }}
                            className="flex-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl text-gray-400 hover:text-gray-600"
                        >
                            Admin Main
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.setItem('vaster_role', 'workforce');
                                window.location.href = '/';
                            }}
                            className="flex-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl bg-white text-indigo-600 shadow-sm border border-indigo-100/50"
                        >
                            Admin Agent
                        </button>
                    </div>
                )}

                {/* eBay Connection Card */}
                {isSidebarOpen && (
                    <div className="mx-4 mt-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 animate-in fade-in duration-500">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Database className="w-4 h-4 text-[#4F46E5]" />
                            </div>
                            <div className="overflow-hidden">
                                <div className="flex flex-col mb-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Account</p>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-black text-gray-900 leading-tight">
                                            {ebayStatus.sellerName || (ebayStatus.connected ? 'Connected User' : 'Not Connected')}
                                        </p>
                                        {ebayStatus.connected && ebayStatus.sellerEmail && (
                                            <p className="text-[9px] text-gray-400 font-bold truncate mt-0.5">
                                                {ebayStatus.sellerEmail}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className={`text-[9px] flex items-center gap-1 font-black uppercase tracking-tight ${ebayStatus.connected ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${ebayStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                    {ebayStatus.connected ? 'Connectivity Active' : 'Login Required'}
                                </p>
                            </div>
                        </div>
                        
                        {ebayStatus.connected && (
                            <button 
                                onClick={handleEbayDisconnect}
                                className="w-full mt-3 py-1.5 border border-rose-100 bg-rose-50/30 text-rose-500 text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-rose-50 transition-colors"
                            >
                                Force Logout eBay
                            </button>
                        )}
                        <button 
                            onClick={async () => {
                                if (ebayStatus.connected) {
                                    try {
                                        addToast('Sync started in background...', 'info');
                                        await syncEbayData();
                                        window.location.reload();
                                    } catch (err) {
                                        addToast('Sync failed. Please check connection.', 'error');
                                    }
                                } else {
                                    try {
                                        addToast('Connecting to eBay...', 'info');
                                        const { url } = await getEbayAuthUrl('dashboard');
                                        if (url) window.location.href = url;
                                    } catch (err) {
                                        addToast('Failed to connect. Check backend.', 'error');
                                    }
                                }
                            }}
                            className={`w-full py-1.5 text-[10px] font-bold rounded-lg border transition-all shadow-sm ${
                                ebayStatus.connected 
                                ? 'bg-white text-[#4F46E5] border-indigo-100 hover:bg-[#4F46E5] hover:text-white' 
                                : 'bg-[#4F46E5] text-white border-transparent hover:bg-[#4338CA]'
                            }`}
                        >
                            {ebayStatus.connected ? 'SYNC DATA NOW' : 'CONNECT EBAY'}
                        </button>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
                    {navGroups.map((group) => (
                        <div key={group.id} className="space-y-1">
                            {isSidebarOpen && (
                                <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                                    {group.title}
                                </h3>
                            )}
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`
                                            group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative
                                            ${isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                                        `}
                                    >
                                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'group-hover:text-indigo-600 transition-colors'}`} />
                                        {isSidebarOpen && <span className="text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden">{item.name}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 hover:bg-gray-50 rounded-xl text-gray-500"><Menu className="w-6 h-6" /></button>
                        <h2 className="text-lg font-bold text-gray-900 capitalize tracking-tight">Agent Admin Hub</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-none">{user?.name || 'Manager'}</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Staff Management</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">{children}</div>
            </main>
        </div>
    );
};

export default AgentAdminLayout;
