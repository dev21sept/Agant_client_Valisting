import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Settings } from 'lucide-react';
import AiProductForm from '../components/AiProductForm';
import AiFetchSection from '../components/AiFetchSection';
import { createProduct, listProduct } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShieldCheck, Check, Search } from 'lucide-react';

const EBAY_CONDITIONS = [
    { label: 'New', value: '1000' },
    { label: 'Used', value: '3000' },
    { label: 'New other', value: '1500' },
    { label: 'Manufacturer refurbished', value: '2000' },
    { label: 'Seller refurbished', value: '2500' }
];

// --- PREMIUM CUSTOM SELECT COMPONENT ---
const CustomSelect = ({ options = [], value, onSelect, placeholder = 'Select...', icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayLabel = (value && typeof value === 'object') ? (value.label || value.name) : value;

    return (
        <div className="relative w-full md:w-64" ref={wrapperRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-9 px-3 bg-gray-50 border-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-indigo-600 bg-white ring-4 ring-indigo-50 shadow-sm' : 'border-transparent hover:border-indigo-100 hover:bg-white'}`}
            >
                <div className="flex items-center gap-2 flex-1 truncate">
                    {Icon && <Icon className={`w-3.5 h-3.5 ${isOpen ? 'text-indigo-600' : 'text-gray-400'}`} />}
                    <span className={`text-[10px] font-bold truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
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
                        className="absolute top-full right-0 w-64 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-[1000] overflow-hidden flex flex-col"
                    >
                        <div className="max-h-48 overflow-y-auto py-1">
                            {options.map((opt, i) => {
                                const label = typeof opt === 'object' ? opt.label : opt;
                                const val = typeof opt === 'object' ? (opt.value || opt) : opt;
                                const isSelected = displayLabel === label;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => { onSelect(val); setIsOpen(false); }}
                                        className={`px-4 py-2 text-[10px] font-bold flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                                    >
                                        <span className="truncate flex-1 pr-2">{label}</span>
                                        {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
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

import { useToast } from '../components/Toast';

const AiFetching = ({ user }) => {
    const navigate = useNavigate();
    const { showConfirm, addToast } = useToast();
    const [isFetching, setIsFetching] = useState(false);
    const [scrapedData, setScrapedData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [authStatus, setAuthStatus] = useState(null);

    const [selectedCondition, setSelectedCondition] = useState('3000'); // Default to Used

    const handleAiDataFetched = (data) => {
        // Automatically apply the selected condition to the fetched data
        setScrapedData({
            ...data,
            condition_id: selectedCondition
        });
        setIsAnalyzing(false);
    };

    const handleAnalyzingStart = () => {
        setIsAnalyzing(true);
        setScrapedData(null); // Clear old data when starting new analysis
    };

    const handleSaveProduct = async (formData, isDirectList = false, isDraft = false) => {
        try {
            setIsFetching(true);
            const productWithSource = {
                ...formData,
                source: 'ai',
                agentId: user?.role === 'agent' ? user.id : undefined,
                clientId: user?.role === 'agent' ? user.clientId : formData.clientId
            };
            
            const response = await createProduct(productWithSource);
            let targetId = response.productId || response.id;
            
            if (response.duplicate) {
                const ok = await showConfirm('This product already exists! Overwrite and continue?');
                if (ok) {
                    const updateRes = await createProduct({ ...productWithSource, overwrite: true });
                    targetId = updateRes.productId || updateRes.id;
                } else {
                    setIsFetching(false);
                    return;
                }
            }

            if (isDirectList || isDraft) {
                setAuthStatus(isDraft ? "Saving as Draft on eBay API..." : "Listing directly on eBay API...");
                const listRes = await listProduct(targetId, isDraft);
                addToast(`${listRes.message}${listRes.listingId ? ' (ID: ' + listRes.listingId + ')' : ''}`, 'success');
            } 
            
            // Stay on page and clear data for next scan
            setScrapedData(null); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
            addToast("Product Saved Successfully! You can now scan the next item.", 'success');
        } catch (err) {
            console.error('Save/List error:', err);
            const isAuthError = err.response?.status === 401 || (err.response?.data?.details && err.response.data.details.includes('401'));
            
            if (isAuthError) {
                addToast('EBAY SESSION EXPIRED! Please re-login in sidebar.', 'error');
            } else {
                addToast('Failed: ' + (err.response?.data?.details || err.message), 'error');
            }
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom duration-500 max-w-7xl mx-auto md:px-4 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI Product Fetching</h1>
                    <p className="text-gray-400 mt-1 font-medium italic text-sm">Scan images and detect details automatically.</p>
                </div>
            </div>

            {/* Client Rules Row - ONLY FOR AGENTS */}
            {user?.role === 'agent' && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-[2rem]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <Settings className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Active Configuration</p>
                            <p className="text-sm font-bold text-gray-700">Rules fetched according to client: <span className="text-indigo-600 font-black">{user?.clientName || 'Default'}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Session Condition:</span>
                        <CustomSelect 
                            icon={ShieldCheck}
                            options={EBAY_CONDITIONS}
                            value={EBAY_CONDITIONS.find(c => c.value === selectedCondition)}
                            onSelect={(val) => setSelectedCondition(val)}
                        />
                    </div>
                </div>
            )}

            {/* AI Fetching Section - Exactly as it was */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <AiFetchSection user={user} onDataFetched={handleAiDataFetched} onAnalyzingStart={handleAnalyzingStart} />
            </div>

            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-indigo-50 shadow-sm"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <Sparkles className="w-6 h-6 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <h3 className="mt-6 text-lg font-black text-gray-900 tracking-tight">AI Vision is Analyzing...</h3>
                        <p className="text-sm text-gray-400 font-medium italic mt-1 uppercase tracking-widest text-[9px]">Detecting brand, category, specifics, and more</p>
                    </motion.div>
                )}

                {scrapedData && !isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="animate-in fade-in duration-700"
                    >
                        <AiProductForm
                            initialData={scrapedData}
                            user={user}
                            onSubmit={handleSaveProduct}
                            isFetching={isFetching}
                            onReset={() => setScrapedData(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AiFetching;
