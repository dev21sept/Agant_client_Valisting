import React, { useState, useEffect, useMemo } from 'react';
import { Globe, Plus, Search, User, Link2, Settings2, Trash2, Edit2, ShieldAlert, ShieldCheck, X, Zap, Database, ExternalLink, Unlink, RefreshCw, Save, CheckCircle2, ChevronDown, Check, Sparkles, Link as LinkIcon, Mail, Phone, Key, AtSign, Eye, EyeOff } from 'lucide-react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { getClients, createClient, getAgents, updateClient, deleteClient, disconnectClientEbay, getClientPolicies, getEbayAuthUrl, getSavedConditionNotes, createFetchRule } from '../../services/api';
import { useToast } from '../../components/Toast';
import RuleManagementModal from '../../components/RuleManagementModal';

// --- PREMIUM CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ options = [], value, onSelect, placeholder = 'Select...', icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => {
        const label = typeof opt === 'object' ? opt.label : opt;
        return label?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const displayLabel = (value && typeof value === 'object') ? (value.label || value.name) : value;

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-10 px-4 bg-gray-50 border-2 rounded-xl flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-sm' : 'border-transparent hover:border-indigo-100 hover:bg-white'}`}
            >
                <div className="flex items-center gap-3 flex-1 truncate">
                    {Icon && <Icon className={`w-3.5 h-3.5 ${isOpen ? 'text-indigo-600' : 'text-gray-400'}`} />}
                    <span className={`text-[11px] font-bold truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {displayLabel || placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-[1000] overflow-hidden flex flex-col"
                    >
                        <div className="p-2.5 bg-gray-50 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input 
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-gray-200 text-[10px] font-bold outline-none focus:border-indigo-600 bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto py-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt, i) => {
                                    const label = typeof opt === 'object' ? opt.label : opt;
                                    const val = typeof opt === 'object' ? (opt.value || opt) : opt;
                                    const isSelected = displayLabel === label;
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => { onSelect(val); setIsOpen(false); setSearchTerm(''); }}
                                            className={`px-4 py-2 text-[10px] font-bold flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                        >
                                            <span className="truncate flex-1 pr-2">{label}</span>
                                            {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-3 text-[10px] font-bold text-gray-400 italic text-center">No options available</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MultiAgentSelect = ({ agents = [], selectedIds = [], onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredAgents = agents.filter(a => a.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl flex items-center justify-between cursor-pointer transition-all hover:border-indigo-200 ${isOpen ? 'ring-2 ring-indigo-50 border-indigo-400' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <User className={`w-4 h-4 ${isOpen ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold text-gray-400">Add Agents to Workforce...</span>
                </div>
                <Plus className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-45 text-indigo-600' : ''}`} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[1000] overflow-hidden flex flex-col"
                    >
                        <div className="p-3 bg-gray-50 border-b border-gray-100">
                            <input
                                autoFocus type="text" placeholder="Search agents..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-600"
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto py-1">
                            {filteredAgents.map(agent => {
                                const isSelected = selectedIds.includes(agent._id);
                                return (
                                    <div
                                        key={agent._id}
                                        onClick={() => onToggle(agent._id)}
                                        className="px-4 py-2.5 text-xs font-bold flex items-center gap-3 cursor-pointer hover:bg-indigo-50 group"
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200 group-hover:border-indigo-400'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={isSelected ? 'text-indigo-600' : 'text-gray-600'}>{agent.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BASE_TITLE_FIELDS = [
    'Brand', 'Product Type', 'Model / Series', 'Size', 'Size word with Size', 'Color', 'Material', 'Style / Use Case', 'Gender / Department'
];

const DEFAULT_CONDITION_NOTES = [
    'Pre-owned In Excellent Condition.', 'Pre-owned In Good Condition.', 'Pre-owned In Good Condition. Please See Pictures.', 'Brand New With Tags.', 'Brand New Without Tags.'
];

const CUSTOM_NOTE_OPTION = '__custom_note__';

const ClientList = ({ user }) => {
    const { addToast, showConfirm } = useToast();
    const [clients, setClients] = useState([]);
    const [agents, setAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [viewingClient, setViewingClient] = useState(null);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [policies, setPolicies] = useState({ fulfillment: [], payment: [], returns: [], locations: [] });
    const [isFetchingPolicies, setIsFetchingPolicies] = useState(false);
    const [savedNotes, setSavedNotes] = useState(DEFAULT_CONDITION_NOTES);

    // Form state for editing rules
    const [conditionSelection, setConditionSelection] = useState('');

    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        ebayAccountName: '',
        ebayPassword: ''
    });

    const [ruleSaveName, setRuleSaveName] = useState('');
    const [isSavingRule, setIsSavingRule] = useState(false);

    useEffect(() => {
        fetchData();
        const params = new URLSearchParams(window.location.search);
        if (params.get('ebay_auth') === 'success') {
            addToast('eBay Account connected successfully!', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const fetchData = async () => {
        try {
            const [clientsData, agentsData, notesRes] = await Promise.all([
                getClients(),
                getAgents(),
                getSavedConditionNotes()
            ]);
            setClients(clientsData);
            setAgents(agentsData);
            if (Array.isArray(notesRes?.data)) {
                setSavedNotes([...new Set([...DEFAULT_CONDITION_NOTES, ...notesRes.data])]);
            }
        } catch (error) {
            addToast('Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            await createClient(newClient);
            addToast('Client created successfully', 'success');
            setShowAddModal(false);
            setNewClient({ name: '', email: '', mobileNumber: '', ebayAccountName: '', ebayPassword: '' });
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.error || error.message;
            addToast('Failed: ' + msg, 'error');
        }
    };

    const openEditModal = (client) => {
        // Initialize rules if they don't exist
        const initializedClient = {
            ...client,
            defaultRules: {
                title_sequence: [],
                description_prompt: '',
                condition_note: '',
                custom_condition_note: '',
                price_markup: 0,
                custom_title_fields: [],
                ...(client.defaultRules || {})
            },
            defaultPolicies: client.defaultPolicies || {},
            assignedAgents: Array.isArray(client.assignedAgents) ? client.assignedAgents.map(a => typeof a === 'object' ? a._id : a) : [],
            allowApiListing: client.allowApiListing ?? false,
            allowExtensionListing: client.allowExtensionListing ?? true,
            allowAiFetching: client.allowAiFetching ?? true,
            allowEbayImport: client.allowEbayImport ?? true
        };

        setEditingClient(initializedClient);
        setConditionSelection(initializedClient.defaultRules.custom_condition_note ? CUSTOM_NOTE_OPTION : (initializedClient.defaultRules.condition_note || ''));
        setShowEditModal(true);

        if (client.ebayToken) {
            fetchClientPolicies(client._id);
        }
    };

    const fetchClientPolicies = async (clientId) => {
        setIsFetchingPolicies(true);
        try {
            const data = await getClientPolicies(clientId);
            setPolicies(data);
        } catch (error) {
            addToast('Could not fetch eBay policies', 'error');
        } finally {
            setIsFetchingPolicies(false);
        }
    };

    const handleConnectEbay = async (clientId) => {
        const { url } = await getEbayAuthUrl(`client_${clientId}`);
        if (url) window.location.href = url;
    };

    const handleDisconnectEbay = async (clientId) => {
        const ok = await showConfirm('Are you sure you want to disconnect eBay for this client?');
        if (!ok) return;
        try {
            await disconnectClientEbay(clientId);
            addToast('eBay disconnected successfully', 'success');
            fetchData();
            if (editingClient?._id === clientId) {
                setEditingClient({ ...editingClient, ebayToken: null, ebayAccountName: null });
            }
        } catch (error) {
            addToast('Failed to disconnect eBay', 'error');
        }
    };

    const handleUpdateClient = async (e) => {
        e.preventDefault();
        try {
            await updateClient(editingClient._id, editingClient);
            addToast('Client settings updated successfully', 'success');
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            addToast('Failed to update client', 'error');
        }
    };

    const handleDeleteClient = async (id) => {
        const ok = await showConfirm('Are you sure you want to delete this client? All settings will be lost.');
        if (!ok) return;
        try {
            await deleteClient(id);
            addToast('Client deleted successfully', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to delete client', 'error');
        }
    };

    const handleSaveCurrentAsRule = async () => {
        if (!ruleSaveName.trim()) {
            addToast('Please enter a name for the rule', 'warning');
            return;
        }
        
        setIsSavingRule(true);
        try {
            const ruleData = {
                rule_name: ruleSaveName.trim(),
                clientId: editingClient._id,
                title_sequence: editingClient.defaultRules.title_sequence,
                description_prompt: editingClient.defaultRules.description_prompt,
                condition_note: editingClient.defaultRules.condition_note,
                condition_note_mode: editingClient.defaultRules.condition_note_mode,
                custom_title_fields: editingClient.defaultRules.custom_title_fields,
                custom_condition_note: editingClient.defaultRules.custom_condition_note
            };
            
            await createFetchRule(ruleData);
            addToast('Rule saved successfully!', 'success');
            resetRuleFields();
        } catch (error) {
            const msg = error.response?.data?.error || error.message;
            addToast('Failed to save rule: ' + msg, 'error');
        } finally {
            setIsSavingRule(false);
        }
    };

    const resetRuleFields = () => {
        setEditingClient(prev => ({
            ...prev,
            defaultRules: {
                ...prev.defaultRules,
                title_sequence: [],
                description_prompt: '',
                condition_note: '',
                custom_condition_note: '',
                custom_title_fields: []
            }
        }));
        setConditionSelection('');
        setRuleSaveName('');
    };

    // Helper functions for title sequence
    const addFieldToSequence = (field) => {
        if (editingClient.defaultRules.title_sequence.includes(field)) return;
        setEditingClient({
            ...editingClient,
            defaultRules: {
                ...editingClient.defaultRules,
                title_sequence: [...editingClient.defaultRules.title_sequence, field]
            }
        });
    };

    const removeFieldFromSequence = (field) => {
        setEditingClient({
            ...editingClient,
            defaultRules: {
                ...editingClient.defaultRules,
                title_sequence: editingClient.defaultRules.title_sequence.filter(f => f !== field)
            }
        });
    };

    const addCustomTitleFieldRow = () => {
        setEditingClient({
            ...editingClient,
            defaultRules: {
                ...editingClient.defaultRules,
                custom_title_fields: [...(editingClient.defaultRules.custom_title_fields || []), '']
            }
        });
    };

    const updateCustomTitleField = (index, value) => {
        const newFields = [...(editingClient.defaultRules.custom_title_fields || [])];
        newFields[index] = value;
        setEditingClient({
            ...editingClient,
            defaultRules: {
                ...editingClient.defaultRules,
                custom_title_fields: newFields
            }
        });
    };

    const removeCustomTitleField = (index) => {
        setEditingClient({
            ...editingClient,
            defaultRules: {
                ...editingClient.defaultRules,
                custom_title_fields: (editingClient.defaultRules.custom_title_fields || []).filter((_, i) => i !== index)
            }
        });
    };

    const filteredClients = useMemo(() => {
        let list = clients;
        if (user?.role === 'agent') {
            list = clients.filter(c => c._id === user.clientId);
        }
        return list.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.ebayAccountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.assignedAgents?.some(a => a.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [clients, searchTerm, user]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {user?.role === 'agent' ? 'My Assigned Client' : 'Client Portfolios'}
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic text-sm">Central hub for multi-client eBay administration.</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Client
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search portfolios..."
                            className="w-full bg-gray-50 border border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">eBay Link</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredClients.map((client) => (
                                <tr key={client._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div 
                                                onClick={() => { setViewingClient(client); setShowViewModal(true); }}
                                                className="cursor-pointer group/name"
                                            >
                                                <p className="text-sm font-bold text-gray-900 group-hover/name:text-indigo-600 transition-colors">{client.name}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-hover/name:opacity-100 transition-all">Click to view details</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {client.assignedAgents && client.assignedAgents.length > 0 ? (
                                                client.assignedAgents.map(agent => (
                                                    <span key={agent._id} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                                                        {agent.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-300 italic">Unassigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {client.ebayToken ? (
                                            <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] uppercase tracking-wider">
                                                <CheckCircle2 className="w-4 h-4" /> {client.ebayAccountName}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Disconnected</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(client)}
                                                className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl flex items-center justify-center transition-all"
                                                title="Edit Rules & eBay"
                                            >
                                                <Settings2 className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClient(client._id)}
                                                className="w-10 h-10 bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl flex items-center justify-center transition-all"
                                                title="Delete Client"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal (FULL SYSTEM) */}
            {showEditModal && editingClient && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setShowEditModal(false)}
                >
                    <div 
                        className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col scale-in-center animate-in zoom-in-95 duration-500"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100"><Settings2 className="w-6 h-6" /></div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Master Config: {editingClient.name}</h3>
                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-[0.2em] mt-1">Rule Management & eBay Gateway</p>
                                </div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar space-y-8">
                            
                            {/* SECTION 1: CONNECTIVITY & POLICIES */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                                {/* eBay Connection */}
                                <div className="flex flex-col space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">eBay Connection</h4>
                                    <div className={`flex-1 p-6 rounded-[1.5rem] border transition-all flex flex-col justify-center ${editingClient.ebayToken ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                                        {editingClient.ebayToken ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600"><Database className="w-5 h-5" /></div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-emerald-700/50 uppercase tracking-widest">Linked Account</p>
                                                        <p className="text-md font-black text-emerald-900">{editingClient.ebayAccountName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => fetchClientPolicies(editingClient._id)} className="flex-1 py-2.5 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all">
                                                        <RefreshCw className={`w-3 h-3 ${isFetchingPolicies ? 'animate-spin' : ''}`} /> Sync Policies
                                                    </button>
                                                    <button onClick={() => handleDisconnectEbay(editingClient._id)} className="p-2.5 bg-white border border-rose-200 text-rose-500 rounded-xl hover:bg-rose-50 transition-all"><Unlink className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 space-y-4">
                                                <p className="text-xs text-gray-400 font-medium px-4 leading-relaxed">No eBay account connected.</p>
                                                <button onClick={() => handleConnectEbay(editingClient._id)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
                                                    <Zap className="w-4 h-4" /> Connect eBay Gateway
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Business Policies */}
                                <div className="flex flex-col space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Policies</h4>
                                    <div className="flex-1 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col justify-center space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Fulfillment', key: 'fulfillment', icon: Zap, options: policies.fulfillment, idField: 'fulfillmentPolicyId' },
                                                { label: 'Payment', key: 'payment', icon: Database, options: policies.payment, idField: 'paymentPolicyId' },
                                                { label: 'Returns', key: 'returns', icon: RefreshCw, options: policies.returns, idField: 'returnPolicyId' },
                                                { label: 'Location', key: 'location', icon: Globe, options: policies.locations, idField: 'merchantLocationKey' }
                                            ].map((pol) => (
                                                <div key={pol.label} className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">{pol.label}</label>
                                                    <CustomSelect
                                                        icon={pol.icon}
                                                        placeholder={isFetchingPolicies ? '...' : `Select...`}
                                                        options={pol.options.map(o => ({ label: o.name || o.merchantLocationKey, value: o[pol.idField] }))}
                                                        value={editingClient.defaultPolicies?.[pol.key] ? { label: editingClient.defaultPolicies[pol.key].name || editingClient.defaultPolicies[pol.key].merchantLocationKey, value: editingClient.defaultPolicies[pol.key][pol.idField] } : null}
                                                        onSelect={(val) => {
                                                            const selected = pol.options.find(o => o[pol.idField] === val);
                                                            setEditingClient({ ...editingClient, defaultPolicies: { ...editingClient.defaultPolicies, [pol.key]: selected } });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: WORKFORCE & PERMISSIONS */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch pt-2">
                                {/* Assign Agent */}
                                <div className="flex flex-col space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Workforce</h4>
                                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{editingClient.assignedAgents?.length || 0} Active</span>
                                    </div>
                                    <div className="flex-1 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100 flex flex-col space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Add Agents</label>
                                            <MultiAgentSelect 
                                                agents={agents}
                                                selectedIds={editingClient.assignedAgents || []}
                                                onToggle={(id) => {
                                                    const current = editingClient.assignedAgents || [];
                                                    const next = current.includes(id) ? current.filter(cid => cid !== id) : [...current, id];
                                                    setEditingClient({ ...editingClient, assignedAgents: next });
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Assigned Workforce</label>
                                            <div className="min-h-[80px] p-3 bg-white border border-gray-100 rounded-xl flex flex-wrap gap-1.5 content-start">
                                                {editingClient.assignedAgents?.length > 0 ? (
                                                    editingClient.assignedAgents.map(id => {
                                                        const agent = agents.find(a => a._id === id);
                                                        if (!agent) return null;
                                                        return (
                                                            <div key={id} className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-100 rounded-lg shadow-sm">
                                                                <span className="text-[10px] font-bold text-gray-700">{agent.name}</span>
                                                                <button onClick={() => setEditingClient({ ...editingClient, assignedAgents: editingClient.assignedAgents.filter(cid => cid !== id) })} className="p-0.5 hover:bg-rose-50 hover:text-rose-600 rounded transition-colors"><X className="w-3 h-3" /></button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-[10px] font-bold text-gray-300 italic px-2">No agents linked.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div className="flex flex-col space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Toolbox Access</h4>
                                    <div className="flex-1 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm grid grid-cols-1 gap-3">
                                        {[
                                            { label: 'AI Product Fetching', key: 'allowAiFetching', desc: 'Auto-scan & analyze images', color: 'peer-checked:bg-indigo-600' },
                                            { label: 'eBay Marketplace Import', key: 'allowEbayImport', desc: 'Import live listing data', color: 'peer-checked:bg-emerald-600' },
                                            { label: 'Direct API Publication', key: 'allowApiListing', desc: 'Push directly to eBay servers', color: 'peer-checked:bg-blue-600' },
                                            { label: 'Chrome Extension Link', key: 'allowExtensionListing', desc: 'Sync via browser extension', color: 'peer-checked:bg-purple-600' }
                                        ].map((item) => (
                                            <label key={item.label} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-transparent cursor-pointer hover:bg-gray-50 transition-all group">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-gray-900 tracking-tight">{item.label}</span>
                                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">{item.desc}</span>
                                                </div>
                                                <div className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={editingClient[item.key]} onChange={(e) => setEditingClient({...editingClient, [item.key]: e.target.checked})} className="peer sr-only" />
                                                    <div className={`w-10 h-5 bg-gray-200 rounded-full peer ${item.color} transition-all after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 shadow-inner`}></div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: LISTING GENERATION RULES */}
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Sparkles className="w-4 h-4" /></div>
                                        <div>
                                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Master Rule Strategies</h4>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Configure multiple fetch behaviors for agents</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 mb-8 p-4 bg-gray-50/50 border border-gray-100 rounded-[1.5rem] flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            placeholder="Enter rule name to save..." 
                                            value={ruleSaveName}
                                            onChange={(e) => setRuleSaveName(e.target.value)}
                                            className="w-full h-9 pl-4 pr-4 bg-white border border-gray-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-500 shadow-sm transition-all"
                                        />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={resetRuleFields}
                                        className="h-9 px-4 bg-white border border-gray-200 text-gray-500 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest shadow-sm"
                                        title="Clear All Fields"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Clear Fields
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                                    {/* Title Construction */}
                                    <div className="flex flex-col space-y-3">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title Construction</h4>
                                        <div className="flex-1 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-4">
                                            <div>
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1 mb-2 block">Quick-Add Fields</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {BASE_TITLE_FIELDS.map(f => (
                                                        <button key={f} onClick={() => addFieldToSequence(f)} className="px-2.5 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-black text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-all">+ {f}</button>
                                                    ))}
                                                    <button onClick={addCustomTitleFieldRow} className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-black text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">+ Custom</button>
                                                </div>
                                            </div>

                                            {editingClient.defaultRules.custom_title_fields?.length > 0 && (
                                                <div className="space-y-2 py-2 border-y border-gray-50">
                                                    {editingClient.defaultRules.custom_title_fields.map((field, idx) => (
                                                        <div key={`custom-${idx}`} className="flex items-center gap-2">
                                                            <input value={field} onChange={(e) => updateCustomTitleField(idx, e.target.value)} className="flex-1 h-8 px-3 rounded-lg border border-gray-200 text-[11px] font-bold outline-none focus:border-emerald-500 shadow-sm" placeholder="Text..." />
                                                            <button onClick={() => addFieldToSequence(field)} className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest">Use</button>
                                                            <button onClick={() => removeCustomTitleField(idx)} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"><X className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <Reorder.Group
                                                axis="x"
                                                values={editingClient.defaultRules?.title_sequence || []}
                                                onReorder={(next) => setEditingClient({ ...editingClient, defaultRules: { ...editingClient.defaultRules, title_sequence: next } })}
                                                className="flex flex-wrap gap-1.5"
                                            >
                                                {(editingClient.defaultRules?.title_sequence || []).map((field, idx) => (
                                                    <Reorder.Item key={field} value={field} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md cursor-grab active:cursor-grabbing">
                                                        <span className="text-[10px] font-black uppercase tracking-wider">{idx + 1}. {field}</span>
                                                        <X onClick={() => removeFieldFromSequence(field)} className="w-3 h-3 cursor-pointer hover:scale-125 transition-transform" />
                                                    </Reorder.Item>
                                                ))}
                                            </Reorder.Group>
                                        </div>
                                    </div>

                                    {/* AI & Condition */}
                                    <div className="flex flex-col space-y-3">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AI & Condition</h4>
                                        <div className="flex-1 bg-gray-50/50 p-6 rounded-[1.5rem] border border-gray-100 flex flex-col space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Global AI Instructions</label>
                                                <textarea 
                                                    rows="3"
                                                    value={editingClient.defaultRules.description_prompt}
                                                    onChange={(e) => setEditingClient({...editingClient, defaultRules: {...editingClient.defaultRules, description_prompt: e.target.value}})}
                                                    className="w-full p-4 bg-white border border-gray-100 rounded-[1.5rem] text-[13px] font-medium focus:border-indigo-500 outline-none transition-all resize-none shadow-sm"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-900 uppercase tracking-widest px-1">Condition Notes</label>
                                                <CustomSelect 
                                                    icon={ShieldCheck}
                                                    options={[...DEFAULT_CONDITION_NOTES.map(n => ({ label: n, value: n })), { label: '+ Custom Note...', value: CUSTOM_NOTE_OPTION }]}
                                                    value={conditionSelection === CUSTOM_NOTE_OPTION ? CUSTOM_NOTE_OPTION : conditionSelection}
                                                    onSelect={(val) => {
                                                        setConditionSelection(val);
                                                        if (val === CUSTOM_NOTE_OPTION) {
                                                            setEditingClient({...editingClient, defaultRules: {...editingClient.defaultRules, condition_note: ''}});
                                                        } else {
                                                            setEditingClient({...editingClient, defaultRules: {...editingClient.defaultRules, condition_note: val, custom_condition_note: ''}});
                                                        }
                                                    }}
                                                />
                                                {conditionSelection === CUSTOM_NOTE_OPTION && (
                                                    <textarea 
                                                        rows="2"
                                                        value={editingClient.defaultRules.custom_condition_note}
                                                        onChange={(e) => setEditingClient({...editingClient, defaultRules: {...editingClient.defaultRules, custom_condition_note: e.target.value}})}
                                                        placeholder="Type client-specific note..."
                                                        className="w-full p-4 bg-white border border-gray-100 rounded-[1.5rem] text-[13px] font-medium focus:border-indigo-500 outline-none transition-all resize-none shadow-sm"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rule Actions Footer */}
                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-end gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowRuleModal(true)}
                                        className="h-9 px-5 bg-white border border-gray-200 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm"
                                    >
                                        <Database className="w-3.5 h-3.5" /> View Rules
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleSaveCurrentAsRule}
                                        disabled={isSavingRule}
                                        className="h-9 px-6 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-100 hover:translate-y-[-1px] transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSavingRule ? 'Saving...' : <><Save className="w-3.5 h-3.5" /> Save Rule</>}
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
                            <button onClick={() => setShowEditModal(false)} className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Discard</button>
                            <button
                                onClick={handleUpdateClient}
                                className="px-12 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:translate-y-[-2px] transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Deploy Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal (Simple) */}
            {showAddModal && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowAddModal(false)}
                >
                    <div 
                        className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900">New Client Profile</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleAddClient} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Client / Business Name</label>
                                    <input required type="text" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="Enter business name" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                        <input type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="email@example.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Mobile Number</label>
                                        <input type="text" value={newClient.mobileNumber} onChange={(e) => setNewClient({ ...newClient, mobileNumber: e.target.value })} className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="+1..." />
                                    </div>
                                </div>

                                <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-4">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5" /> eBay Login Credentials (Optional)
                                    </p>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">eBay ID / Username</label>
                                            <input type="text" value={newClient.ebayAccountName} onChange={(e) => setNewClient({ ...newClient, ebayAccountName: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="eBay Username" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">eBay Password</label>
                                            <input type="password" value={newClient.ebayPassword} onChange={(e) => setNewClient({ ...newClient, ebayPassword: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-indigo-100 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:translate-y-[-2px] transition-all active:scale-95"
                            >
                                Create Profile
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Rule Management Modal */}
            {showRuleModal && editingClient && (
                <RuleManagementModal 
                    clientId={editingClient._id}
                    clientName={editingClient.name}
                    onClose={() => setShowRuleModal(false)}
                />
            )}

            {/* View Details Modal */}
            {showViewModal && viewingClient && (
                <div 
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={() => setShowViewModal(false)}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative h-32 bg-indigo-600 p-8 flex items-end">
                            <div className="absolute top-6 right-6">
                                <button onClick={() => setShowViewModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                                    <Globe className="w-8 h-8 text-indigo-600" />
                                </div>
                                <div className="text-white">
                                    <h3 className="text-2xl font-black tracking-tight">{viewingClient.name}</h3>
                                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Client Strategic Profile</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="w-3 h-3" /> Email Address
                                    </label>
                                    <p className="text-sm font-bold text-gray-900">{viewingClient.email || 'Not Provided'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Phone className="w-3 h-3" /> Mobile Number
                                    </label>
                                    <p className="text-sm font-bold text-gray-900">{viewingClient.mobileNumber || 'Not Provided'}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-6">
                                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Marketplace Access Credentials</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <AtSign className="w-3 h-3" /> eBay Username
                                        </label>
                                        <p className="text-sm font-bold text-gray-900">{viewingClient.ebayAccountName || 'Not Set'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Key className="w-3 h-3" /> Password
                                        </label>
                                        <p className="text-sm font-bold text-gray-900 tracking-widest">••••••••</p>
                                        <button className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Show Password</button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Workforce Team</label>
                                <div className="flex flex-wrap gap-2">
                                    {viewingClient.assignedAgents?.length > 0 ? (
                                        viewingClient.assignedAgents.map(a => (
                                            <div key={a._id} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
                                                <User className="w-3 h-3 text-indigo-600" />
                                                <span className="text-[11px] font-bold text-indigo-700">{a.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs font-bold text-gray-400 italic">No agents assigned.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                            <button onClick={() => setShowViewModal(false)} className="px-10 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:translate-y-[-2px] transition-all">Close Profile View</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ClientList;
