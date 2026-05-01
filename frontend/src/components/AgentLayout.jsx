import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingBag, 
    Menu, 
    LogOut,
    Sparkles,
    Link as LinkIcon,
    Database,
    CheckCircle2,
    ShieldAlert,
    User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getClients, getEbayAuthUrl } from '../services/api_agent';
import { useToast } from './Toast';

const AgentLayout = ({ children, onLogout, user }) => {
    const { addToast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [activeClient, setActiveClient] = useState(null);
    const location = useLocation();

    React.useEffect(() => {
        const fetchClient = async () => {
            try {
                if (user?.id && user?.role === 'agent') {
                    const clients = await getClients();
                    const client = clients.find(c => 
                        Array.isArray(c.assignedAgents) && 
                        c.assignedAgents.some(a => (typeof a === 'object' ? a._id : a) === user.id)
                    );
                    setActiveClient(client);
                }
            } catch (err) {
                console.error('Error fetching client for sidebar:', err);
            }
        };
        fetchClient();
    }, [user]);

    const handleConnectEbay = async () => {
        try {
            addToast("Fetching eBay connection link...", 'info');
            const { url } = await getEbayAuthUrl(activeClient?._id);
            if (url) window.location.href = url;
        } catch (err) {
            addToast("Failed to get link", 'error');
        }
    };

    const navGroups = [
        {
            id: 'agent-tasks',
            title: 'MY WORKSPACE',
            items: [
                { name: 'My Dashboard', path: '/', icon: LayoutDashboard },
                { name: 'Inventory', path: '/products', icon: Package },
            ]
        },
        {
            id: 'agent-tools',
            title: 'FETCH TOOLS',
            items: [
                { name: 'eBay Link', path: '/ebay-import', icon: LinkIcon, permission: 'allowEbayImport' },
                { name: 'AI Fetch', path: '/ai-fetching', icon: Sparkles, permission: 'allowAiFetching' },
            ].filter(item => user?.[item.permission] !== false)
        }
    ].filter(group => group.items.length > 0);

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
                        {isSidebarOpen && <span className="text-xl font-bold text-gray-900 tracking-tight">VA AGENT</span>}
                    </div>
                </div>

                {/* NO ROLE SWITCHER FOR AGENTS */}

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6 scrollbar-hide">
                    {isSidebarOpen && activeClient && (
                        <div className="px-5 mb-8 space-y-4">
                            <div>
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Active Portfolio</span>
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 flex-shrink-0"><User className="w-4 h-4" /></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[11px] font-black text-gray-900 truncate uppercase tracking-tight">{activeClient.name}</h4>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Assigned Client</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">eBay Gateway</span>
                                    {activeClient.ebayToken ? (
                                        <div className="flex items-center gap-1 text-emerald-500 font-bold text-[8px] uppercase tracking-tighter">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-rose-500 font-bold text-[8px] uppercase tracking-tighter">
                                            <ShieldAlert className="w-2.5 h-2.5" /> Required
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeClient.ebayToken ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[10px] font-black text-gray-800 truncate leading-tight">
                                            {activeClient.ebayAccountName && activeClient.ebayAccountName !== '454' ? activeClient.ebayAccountName : 'Not Linked'}
                                        </h4>
                                        {activeClient.ebayEmail && (
                                            <p className="text-[8px] font-bold text-indigo-500 truncate tracking-tight uppercase mt-0.5">
                                                @{activeClient.ebayEmail.split('@')[0]}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

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
                        <h2 className="text-lg font-bold text-gray-900 capitalize tracking-tight">Agent Portal</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-tighter leading-none">{user?.name || 'Agent'}</span>
                            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Workforce Access</span>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">{children}</div>
            </main>
        </div>
    );
};

export default AgentLayout;
