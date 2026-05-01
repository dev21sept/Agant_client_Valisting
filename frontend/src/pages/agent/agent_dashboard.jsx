import React, { useState, useEffect } from 'react';
import { 
    Zap, 
    Sparkles, 
    Calendar, 
    CheckCircle2,
    ShoppingBag,
    Package,
    Settings,
    LayoutDashboard
} from 'lucide-react';
import { getAgentPerformance, getClients } from '../../services/api_agent';
import { useToast } from '../../components/Toast';
import { Link } from 'react-router-dom';

const AgentDashboard = ({ user, scopedAgentId, scopedAgentName }) => {
    const { addToast } = useToast();
    const [agentPerf, setAgentPerf] = useState({ today: 0, week: 0, month: 0 });
    const [myClient, setMyClient] = useState(null);
    const [loading, setLoading] = useState(true);

    const effectiveAgentId = scopedAgentId || user?.id;
    const effectiveAgentName = scopedAgentName || user?.name;

    useEffect(() => {
        if (effectiveAgentId) {
            fetchAgentData();
        }
    }, [effectiveAgentId]);

    const fetchAgentData = async () => {
        try {
            setLoading(true);
            const [perf, clients] = await Promise.all([
                getAgentPerformance(effectiveAgentId),
                getClients()
            ]);
            setAgentPerf(perf);
            
            // For scoped view, we might need the client assigned to this agent
            // The user object passed might not have the correct clientId if it's the admin
            // But we can find the client that has this agent in its assignedAgents
            const client = clients.find(c => 
                Array.isArray(c.assignedAgents) && 
                c.assignedAgents.some(a => (typeof a === 'object' ? a._id : a) === effectiveAgentId)
            );
            setMyClient(client);
        } catch (error) {
            addToast('Failed to load performance data', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        {scopedAgentId ? `Viewing: ${effectiveAgentName}` : `Welcome Back, ${effectiveAgentName}`} 
                        <Sparkles className="text-amber-400 w-8 h-8" />
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic text-sm">
                        {scopedAgentId ? "Live performance metrics for this agent account." : "Here is your performance snapshot for today."}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Agent Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform"><Zap className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Velocity</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Today's Listings</h4>
                        <p className="text-4xl font-black text-gray-900">{agentPerf.today}</p>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform"><CheckCircle2 className="w-6 h-6" /></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly Output</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Last 7 Days</h4>
                        <p className="text-4xl font-black text-gray-900">{agentPerf.week}</p>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default AgentDashboard;
