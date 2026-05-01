import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    Award, 
    Zap, 
    Sparkles
} from 'lucide-react';
import { getAdminStats } from '../../services/api';
import { useToast } from '../../components/Toast';

const AgentClientDashboard = () => {
    const { addToast } = useToast();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminStats();
            setStats(data);
        } catch (error) {
            addToast('Failed to load statistics', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    );

    const topAgent = stats.length > 0 ? stats.sort((a, b) => b.listedCount - a.listedCount)[0] : null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Agent Admin Dashboard <TrendingUp className="text-indigo-600 w-8 h-8" />
                </h1>
                <p className="text-gray-500 mt-1 font-medium italic text-sm">Real-time performance metrics for agents and clients.</p>
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <Award className="w-10 h-10 mb-4 opacity-80" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Top Performer</p>
                        <h3 className="text-2xl font-black mt-2">{topAgent?.agentInfo?.name || 'N/A'}</h3>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-3xl font-black">{topAgent?.listedCount || 0}</span>
                            <span className="text-xs font-bold opacity-80">Products Listed</span>
                        </div>
                    </div>
                    <div className="absolute right-[-10%] bottom-[-10%] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Zap className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Efficiency</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Productivity</h4>
                        <p className="text-3xl font-black text-gray-900">{stats.reduce((acc, s) => acc + s.listedCount, 0)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Sparkles className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Power</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">AI Gen Content</h4>
                        <p className="text-3xl font-black text-gray-900">{stats.reduce((acc, s) => acc + s.aiCount, 0)}</p>
                    </div>
                </div>
            </div>

            {/* Performance Graph & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Performance Velocity</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Listing trends over time</p>
                        </div>
                    </div>

                    <div className="h-[300px] flex items-end justify-between gap-4 px-4 pb-4 border-b border-gray-50">
                        {[40, 70, 45, 90, 65, 80, 50, 100, 85, 95, 60, 75].map((h, i) => (
                            <div key={i} className="flex-1 group relative">
                                <div 
                                    style={{ height: `${h}%` }} 
                                    className="bg-indigo-50 group-hover:bg-indigo-500 rounded-t-xl transition-all duration-500 cursor-pointer relative"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Leaderboard</h3>
                    <div className="space-y-6">
                        {stats.slice(0, 5).map((s, i) => (
                            <div key={s._id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-gray-300">#{i+1}</span>
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-indigo-600">
                                        {s.agentInfo?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-800">{s.agentInfo?.name || 'Unknown'}</p>
                                        <p className="text-[10px] font-bold text-gray-400">Total: {s.totalListings}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-indigo-600">{s.listedCount}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Live</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentClientDashboard;
