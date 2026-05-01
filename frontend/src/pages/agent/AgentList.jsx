import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Search, Mail, Key, ShieldCheck, Trash2, Edit2, Zap, X, Eye, EyeOff } from 'lucide-react';
import { getAgents, createAgent, deleteAgent, updateAgent } from '../../services/api';
import { useToast } from '../../components/Toast';

import AgentDashboard from './agent_dashboard';
import ProductListAgent from './ProductListAgent';

const AgentList = () => {
    const { addToast, showConfirm } = useToast();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'inventory'
    const [viewingAgent, setViewingAgent] = useState(null);
    const [editingAgent, setEditingAgent] = useState(null);
    const [newAgent, setNewAgent] = useState({ agentId: '', password: '', name: '' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const data = await getAgents();
            setAgents(data);
        } catch (error) {
            addToast('Failed to fetch agents', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAgent = (agent) => {
        setViewingAgent(agent);
        setActiveTab('dashboard');
        setShowViewModal(true);
    };

    const handleAddAgent = async (e) => {
        e.preventDefault();
        try {
            await createAgent(newAgent);
            addToast('Agent created successfully', 'success');
            setShowAddModal(false);
            setNewAgent({ agentId: '', password: '', name: '' });
            fetchAgents();
        } catch (error) {
            addToast('Failed to create agent', 'error');
        }
    };

    const openEditModal = (agent) => {
        setEditingAgent({ ...agent, password: '' });
        setShowEditModal(true);
    };

    const handleUpdateAgent = async (e) => {
        e.preventDefault();
        try {
            // If password is empty, don't update it (keep existing)
            const updateData = { ...editingAgent };
            if (!updateData.password) delete updateData.password;
            
            await updateAgent(editingAgent._id, updateData);
            addToast('Agent updated successfully', 'success');
            setShowEditModal(false);
            fetchAgents();
        } catch (error) {
            addToast('Failed to update agent', 'error');
        }
    };

    const handleDeleteAgent = async (id) => {
        const ok = await showConfirm('Are you sure you want to delete this agent? They will no longer be able to log in.');
        if (!ok) return;
        try {
            await deleteAgent(id);
            addToast('Agent removed successfully', 'success');
            fetchAgents();
        } catch (error) {
            addToast('Failed to delete agent', 'error');
        }
    };

    const togglePermission = async (agent, field) => {
        try {
            const updatedValue = !agent[field];
            await updateAgent(agent._id, { [field]: updatedValue });
            addToast(`Permission updated`, 'success');
            fetchAgents();
        } catch (error) {
            addToast('Failed to update permission', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Agent Management</h1>
                    <p className="text-gray-500 mt-1 font-medium italic text-sm">Create and manage your workforce.</p>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 bg-[#4F46E5] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-lg active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Add New Agent
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search agents by name or ID..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-[#4F46E5] transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-400 italic">Loading agents...</td></tr>
                            ) : agents.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-400 italic">No agents found. Start by adding one!</td></tr>
                            ) : agents.map((agent) => (
                                <tr key={agent._id} className="hover:bg-gray-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                {agent.name.charAt(0)}
                                            </div>
                                            <div onClick={() => handleViewAgent(agent)} className="cursor-pointer group/name">
                                                <p className="text-sm font-bold text-gray-900 group-hover/name:text-indigo-600 transition-colors">{agent.name}</p>
                                                <p className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-2">
                                                    {agent.agentId}
                                                    <span className="opacity-0 group-hover/name:opacity-100 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded transition-all">View Portal</span>
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${agent.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => openEditModal(agent)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAgent(agent._id)}
                                                className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Agent Modal */}
            {showAddModal && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowAddModal(false)}
                >
                    <div 
                        className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Create Agent Account</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Users className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAgent} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={newAgent.name}
                                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                                    placeholder="Enter agent's name..."
                                    className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#4F46E5] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Agent Login ID</label>
                                <input 
                                    required
                                    type="text" 
                                    value={newAgent.agentId}
                                    onChange={(e) => setNewAgent({...newAgent, agentId: e.target.value})}
                                    placeholder="e.g. agent_ram"
                                    className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#4F46E5] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Temporary Password</label>
                                <div className="relative">
                                    <input 
                                        required
                                        type={showNewPassword ? "text" : "password"} 
                                        value={newAgent.password}
                                        onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#4F46E5] outline-none transition-all pr-12"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-4 bg-[#4F46E5] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:translate-y-[-2px] transition-all active:scale-95 mt-4"
                            >
                                Save Agent Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingAgent && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowEditModal(false)}
                >
                    <div 
                        className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Edit Agent</h3>
                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Update Credentials</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAgent} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <input 
                                    required
                                    type="text" 
                                    value={editingAgent.name}
                                    onChange={(e) => setEditingAgent({...editingAgent, name: e.target.value})}
                                    className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#4F46E5] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Agent Login ID</label>
                                <input 
                                    required
                                    type="text" 
                                    value={editingAgent.agentId}
                                    onChange={(e) => setEditingAgent({...editingAgent, agentId: e.target.value})}
                                    className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#4F46E5] outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Password (Optional)</label>
                                <div className="relative">
                                    <input 
                                        type={showEditPassword ? "text" : "password"} 
                                        value={editingAgent.password}
                                        onChange={(e) => setEditingAgent({...editingAgent, password: e.target.value})}
                                        placeholder="Leave blank to keep current"
                                        className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-[#4F46E5] outline-none transition-all pr-12"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:translate-y-[-2px] transition-all active:scale-95 mt-4"
                            >
                                Update Agent Info
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Agent View Modal */}
            {showViewModal && viewingAgent && (
                <div 
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setShowViewModal(false)}
                >
                    <div 
                        className="bg-white rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-in-center animate-in zoom-in-95 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Agent Portal Preview</h3>
                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-[0.2em] mt-1">Viewing: {viewingAgent.name} ({viewingAgent.agentId})</p>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                                <button 
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Dashboard
                                </button>
                                <button 
                                    onClick={() => setActiveTab('inventory')}
                                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white text-indigo-600 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Inventory
                                </button>
                            </div>

                            <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors absolute top-6 right-6 md:static">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 no-scrollbar bg-gray-50/30">
                            {activeTab === 'dashboard' ? (
                                <AgentDashboard 
                                    scopedAgentId={viewingAgent._id} 
                                    scopedAgentName={viewingAgent.name} 
                                />
                            ) : (
                                <ProductListAgent 
                                    scopedAgentId={viewingAgent._id} 
                                    viewOnly={true} 
                                />
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-white flex justify-center shrink-0">
                            <button 
                                onClick={() => setShowViewModal(false)}
                                className="px-12 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all active:scale-95"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentList;
