import React, { useEffect, useMemo, useState } from 'react';
import { Reorder } from 'framer-motion';
import { Pencil, Plus, Save, Search, Trash2, X, Sparkles, ChevronDown, Check } from 'lucide-react';
import {
    createFetchRule,
    deleteFetchRule,
    getFetchRules,
    getSavedConditionNotes,
    updateFetchRule
} from '../services/api';
import { useToast } from './Toast';

const BASE_TITLE_FIELDS = [
    'Brand',
    'Product Type',
    'Model / Series',
    'Size',
    'Size word with Size',
    'Color',
    'Material',
    'Style / Use Case',
    'Gender / Department'
];

const DEFAULT_CONDITION_NOTES = [
    'Pre-owned In Excellent Condition.',
    'Pre-owned In Good Condition.',
    'Pre-owned In Good Condition. Please See Pictures.',
    'Brand New With Tags.',
    'Brand New Without Tags.'
];

const CUSTOM_NOTE_OPTION = '__custom_note__';

const getEmptyForm = (clientId) => ({
    rule_name: '',
    title_sequence: [...BASE_TITLE_FIELDS],
    description_prompt: '',
    condition_note_mode: 'fixed',
    condition_note: '',
    custom_title_fields: [],
    custom_condition_note: '',
    clientId: clientId || null
});

const mapRuleToForm = (rule) => ({
    rule_name: rule?.rule_name || '',
    title_sequence: Array.isArray(rule?.title_sequence) && rule.title_sequence.length > 0
        ? rule.title_sequence
        : [...BASE_TITLE_FIELDS],
    description_prompt: rule?.description_prompt || '',
    condition_note_mode: rule?.condition_note_mode || 'fixed',
    condition_note: rule?.condition_note || '',
    custom_title_fields: Array.isArray(rule?.custom_title_fields) ? rule.custom_title_fields : [],
    custom_condition_note: rule?.custom_condition_note || '',
    clientId: rule?.clientId || null
});

const normalizePayload = (form) => ({
    rule_name: String(form.rule_name || '').trim(),
    title_sequence: [...new Set((form.title_sequence || []).map((v) => String(v || '').trim()).filter(Boolean))],
    description_prompt: String(form.description_prompt || '').trim(),
    condition_note_mode: 'fixed',
    condition_note: String(form.condition_note || '').trim(),
    custom_title_fields: [...new Set((form.custom_title_fields || []).map((v) => String(v || '').trim()).filter(Boolean))],
    custom_condition_note: String(form.custom_condition_note || '').trim(),
    clientId: form.clientId || null
});

const RuleForm = ({ initialRule, savedNotes, submitLabel, onSubmit, onCancel }) => {
    const [form, setForm] = useState(mapRuleToForm(initialRule));
    const [conditionSelection, setConditionSelection] = useState(
        initialRule?.custom_condition_note ? CUSTOM_NOTE_OPTION : (initialRule?.condition_note || '')
    );

    useEffect(() => {
        setForm(mapRuleToForm(initialRule));
        setConditionSelection(
            initialRule?.custom_condition_note ? CUSTOM_NOTE_OPTION : (initialRule?.condition_note || '')
        );
    }, [initialRule]);

    const conditionNoteOptions = useMemo(
        () => [...new Set([...DEFAULT_CONDITION_NOTES, ...(savedNotes || [])])],
        [savedNotes]
    );

    const addFieldToSequence = (value) => {
        const field = String(value || '').trim();
        if (!field) return;
        setForm((prev) => {
            if (prev.title_sequence.includes(field)) return prev;
            return { ...prev, title_sequence: [...prev.title_sequence, field] };
        });
    };

    const removeFieldFromSequence = (value) => {
        setForm((prev) => ({
            ...prev,
            title_sequence: prev.title_sequence.filter((field) => field !== value)
        }));
    };

    const addCustomTitleFieldRow = () => {
        setForm((prev) => ({ ...prev, custom_title_fields: [...prev.custom_title_fields, ''] }));
    };

    const updateCustomTitleField = (index, value) => {
        setForm((prev) => ({
            ...prev,
            custom_title_fields: prev.custom_title_fields.map((field, i) => (i === index ? value : field))
        }));
    };

    const removeCustomTitleField = (index) => {
        setForm((prev) => ({
            ...prev,
            custom_title_fields: prev.custom_title_fields.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = normalizePayload(form);
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rule Name</label>
                    <input
                        value={form.rule_name}
                        onChange={(e) => setForm((p) => ({ ...p, rule_name: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-gray-100 text-sm font-bold outline-none focus:border-indigo-500 bg-gray-50/30"
                        placeholder="Rule name"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Condition Note</label>
                    <select
                        value={conditionSelection}
                        onChange={(e) => {
                            const value = e.target.value;
                            setConditionSelection(value);
                            if (value === CUSTOM_NOTE_OPTION) {
                                setForm((p) => ({ ...p, condition_note: '' }));
                            } else {
                                setForm((p) => ({ ...p, condition_note: value }));
                            }
                        }}
                        className="w-full h-10 px-3 rounded-xl border border-gray-100 text-sm font-bold outline-none focus:border-indigo-500 bg-gray-50/30"
                    >
                        <option value="">Select saved condition note</option>
                        {conditionNoteOptions.map((note) => (
                            <option key={note} value={note}>{note}</option>
                        ))}
                        <option value={CUSTOM_NOTE_OPTION}>Add Custom Condition Note...</option>
                    </select>
                    {conditionSelection === CUSTOM_NOTE_OPTION && (
                        <textarea
                            rows={2}
                            value={form.custom_condition_note}
                            onChange={(e) => setForm((p) => ({ ...p, custom_condition_note: e.target.value }))}
                            className="w-full mt-2 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:border-indigo-500"
                            placeholder="Type custom condition note"
                        />
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title Sequence</label>
                <div className="flex flex-wrap gap-2">
                    {BASE_TITLE_FIELDS.map((field) => (
                        <button
                            key={field}
                            type="button"
                            onClick={() => addFieldToSequence(field)}
                            className="px-2.5 py-1.5 rounded-lg text-[9px] font-black border border-indigo-100 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all"
                        >
                            {field}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={addCustomTitleFieldRow}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-black border border-emerald-100 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all"
                    >
                        + Custom Field
                    </button>
                </div>

                {form.custom_title_fields.length > 0 && (
                    <div className="space-y-2 bg-gray-50/50 border border-gray-100 rounded-2xl p-3">
                        {form.custom_title_fields.map((field, idx) => (
                            <div key={`custom-${idx}`} className="flex items-center gap-2">
                                <input
                                    value={field}
                                    onChange={(e) => updateCustomTitleField(idx, e.target.value)}
                                    className="flex-1 h-9 px-3 rounded-xl border border-gray-100 text-xs font-bold outline-none focus:border-emerald-500"
                                    placeholder={`Custom field ${idx + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => addFieldToSequence(field)}
                                    className="h-9 px-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest"
                                >
                                    Use
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeCustomTitleField(idx)}
                                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <Reorder.Group
                    axis="x"
                    values={form.title_sequence}
                    onReorder={(next) => setForm((p) => ({ ...p, title_sequence: next }))}
                    className="flex gap-2 overflow-x-auto py-1 no-scrollbar"
                >
                    {form.title_sequence.map((field, idx) => (
                        <Reorder.Item
                            key={field}
                            value={field}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-white whitespace-nowrap shadow-sm"
                        >
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">{idx + 1}. {field}</span>
                            <button
                                type="button"
                                onClick={() => removeFieldFromSequence(field)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description Prompt</label>
                <textarea
                    rows={4}
                    value={form.description_prompt}
                    onChange={(e) => setForm((p) => ({ ...p, description_prompt: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 text-xs font-medium outline-none focus:border-indigo-500 bg-gray-50/30"
                    placeholder="AI prompt instructions..."
                />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-10 px-4 rounded-xl border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="h-10 px-6 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-100 hover:translate-y-[-1px] transition-all"
                >
                    <Save className="w-4 h-4" />
                    {submitLabel}
                </button>
            </div>
        </form>
    );
};

const RuleManagementModal = ({ clientId, clientName, onClose }) => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [savedNotes, setSavedNotes] = useState(DEFAULT_CONDITION_NOTES);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { addToast, showConfirm } = useToast();

    const refreshRules = async () => {
        const [ruleRes, notesRes] = await Promise.all([getFetchRules(clientId), getSavedConditionNotes()]);
        setRules(ruleRes?.data || []);
        if (Array.isArray(notesRes?.data)) {
            setSavedNotes((prev) => [...new Set([...prev, ...notesRes.data])]);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                await refreshRules();
            } catch (error) {
                console.error('Failed to load rules:', error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [clientId]);

    const filteredRules = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return rules;
        return rules.filter((rule) => {
            const name = String(rule.rule_name || '').toLowerCase();
            const note = String(rule.custom_condition_note || rule.condition_note || '').toLowerCase();
            return name.includes(q) || note.includes(q);
        });
    }, [rules, searchTerm]);

    const handleCreate = async (payload) => {
        setSaving(true);
        try {
            await createFetchRule(payload);
            await refreshRules();
            setIsAddModalOpen(false);
            addToast('Rule created successfully!', 'success');
        } catch (error) {
            addToast(error?.response?.data?.error || 'Failed to create rule', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (id, payload) => {
        setSaving(true);
        try {
            await updateFetchRule(id, payload);
            await refreshRules();
            setEditingId(null);
            addToast('Rule updated successfully!', 'success');
        } catch (error) {
            addToast(error?.response?.data?.error || 'Failed to update rule', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await showConfirm('Are you sure you want to delete this rule?');
        if (!ok) return;
        try {
            await deleteFetchRule(id);
            await refreshRules();
            if (editingId === id) setEditingId(null);
            addToast('Rule deleted successfully!', 'success');
        } catch (error) {
            addToast(error?.response?.data?.error || 'Failed to delete rule', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl scale-in-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Rule Management: {clientName}</h2>
                            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Define multi-strategy fetch rules</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search rules..."
                                className="w-full h-11 pl-12 pr-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50/50 border border-gray-100 rounded-[2rem] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rule Name</th>
                                        {!clientId && <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Scope</th>}
                                        <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {loading ? (
                                        <tr><td colSpan={clientId ? 2 : 3} className="py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading rules...</td></tr>
                                    ) : filteredRules.length === 0 ? (
                                        <tr><td colSpan={clientId ? 2 : 3} className="py-12 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">No rules found</td></tr>
                                    ) : filteredRules.map((rule) => (
                                        <React.Fragment key={rule._id}>
                                            <tr className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{rule.rule_name}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter truncate max-w-[200px]">{(rule.title_sequence || []).join(' | ')}</span>
                                                    </div>
                                                </td>
                                                {!clientId && (
                                                    <td className="py-4 px-6">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${rule.clientId ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {rule.clientId ? 'Client Specific' : 'Global Rule'}
                                                        </span>
                                                    </td>
                                                )}
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() => setEditingId((prev) => (prev === rule._id ? null : rule._id))}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(rule._id)}
                                                            className="w-9 h-9 flex items-center justify-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {editingId === rule._id && (
                                                <tr>
                                                    <td colSpan={clientId ? 2 : 3} className="p-4 bg-gray-50/50 border-b border-gray-100">
                                                        <div className="bg-white border border-indigo-100 rounded-[1.5rem] p-6 shadow-xl">
                                                            <RuleForm
                                                                initialRule={rule}
                                                                savedNotes={savedNotes}
                                                                submitLabel={saving ? 'Saving...' : 'Update Rule'}
                                                                onSubmit={(payload) => handleUpdate(rule._id, payload)}
                                                                onCancel={() => setEditingId(null)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Create Rule Modal (Nested) */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl p-6 border border-indigo-50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">New Fetch Strategy</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <RuleForm
                                initialRule={getEmptyForm(clientId)}
                                savedNotes={savedNotes}
                                submitLabel={saving ? 'Saving...' : 'Create Rule'}
                                onSubmit={handleCreate}
                                onCancel={() => setIsAddModalOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RuleManagementModal;
