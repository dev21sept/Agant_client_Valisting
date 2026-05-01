import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Package, 
    Link as LinkIcon, 
    Sparkles, 
    Settings, 
    ShoppingBag, 
    Menu, 
    LogOut,
    ChevronRight,
    Bell,
    Search,
    User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MainAdminLayout = ({ children, onLogout, user }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    const navGroups = [
        {
            id: 'manage',
            title: 'MANAGE',
            items: [
                { name: 'Dashboard', path: '/', icon: LayoutDashboard },
                { name: 'Inventory', path: '/products', icon: Package },
            ]
        },
        {
            id: 'fetch',
            title: 'FETCH TOOLS',
            items: [
                { name: 'eBay Link', path: '/ebay-import', icon: LinkIcon },
                { name: 'AI Fetch', path: '/ai-fetching', icon: Sparkles },
            ]
        },
        {
            id: 'settings',
            title: 'SETTINGS',
            items: [
                { name: 'Rule Management', path: '/settings', icon: Settings }
            ]
        },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
                            className="flex-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl bg-white text-indigo-600 shadow-sm border border-indigo-100/50"
                        >
                            Admin Main
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.setItem('vaster_role', 'workforce');
                                window.location.href = '/';
                            }}
                            className="flex-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl text-gray-400 hover:text-gray-600"
                        >
                            Admin Agent
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
                        <h2 className="text-lg font-bold text-gray-900 capitalize tracking-tight">Main Admin Workspace</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-none">{user?.name || 'Administrator'}</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">System Master</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">{children}</div>
            </main>
        </div>
    );
};

export default MainAdminLayout;
