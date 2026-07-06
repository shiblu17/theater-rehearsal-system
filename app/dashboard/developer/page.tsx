'use client';

import { useState, useEffect } from 'react';
import { 
  Terminal, 
  Database, 
  RefreshCw, 
  Send, 
  Trash2, 
  DatabaseBackup, 
  Activity, 
  Info, 
  ShieldAlert,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Save,
  Calendar,
  BookOpen,
  QrCode
} from 'lucide-react';
import Link from 'next/link';
import { Member, Attendance, Ticket, Rehearsal, RehearsalNote } from '@/lib/db';

export default function DeveloperDashboard() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ healthy: boolean; details: string }>({ healthy: false, details: '' });
  const [pushSubscriptionsCount, setPushSubscriptionsCount] = useState<number>(0);
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('');
  
  const [apiResponseMsg, setApiResponseMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'system' | 'members' | 'attendance' | 'tickets' | 'rehearsals' | 'notes'>('system');

  // Master Data lists
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [notes, setNotes] = useState<RehearsalNote[]>([]);

  // Editing states (stores the ID of the item being edited)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  // New Member Form state
  const [newMember, setNewMember] = useState({ roll: '', name: '', role: 'অভিনেতা', character_name: '', avatar_url: '' });

  // Fetch status and all data lists
  const fetchData = async () => {
    setLoading(true);
    setApiResponseMsg(null);
    try {
      // 1. Fetch system status
      const statusRes = await fetch('/api/dev-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      });
      const statusData = await statusRes.json();
      if (statusRes.ok && statusData.success) {
        setDbStatus(statusData.dbStatus);
        setPushSubscriptionsCount(statusData.pushSubscriptionsCount);
        setVapidPublicKey(statusData.vapidPublicKey);
      }

      // 2. Fetch all collections in parallel
      const [membersRes, logsRes, ticketsRes, rehearsalsRes, notesRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/attendance'),
        fetch('/api/tickets'),
        fetch('/api/rehearsals'),
        fetch('/api/rehearsal-notes')
      ]);

      const mData = await membersRes.json();
      const lData = await logsRes.json();
      const tData = await ticketsRes.json();
      const rData = await rehearsalsRes.json();
      const nData = await notesRes.json();

      if (Array.isArray(mData)) setMembers(mData);
      if (Array.isArray(lData)) setLogs(lData);
      if (Array.isArray(tData)) setTickets(tData);
      if (Array.isArray(rData)) setRehearsals(rData);
      if (Array.isArray(nData)) setNotes(nData);

    } catch (err) {
      setApiResponseMsg({ type: 'error', text: 'সার্ভার ডায়াগনস্টিকস কানেকশন ব্যর্থ হয়েছে।' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSystemAction = async (action: 'clear' | 'reseed' | 'demo' | 'push_test') => {
    setIsSubmitting(true);
    setApiResponseMsg(null);
    try {
      const res = await fetch('/api/dev-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApiResponseMsg({ type: 'success', text: data.message || 'অ্যাকশন সফল হয়েছে।' });
        fetchData();
      } else {
        setApiResponseMsg({ type: 'error', text: data.error || data.message || 'অ্যাকশন ব্যর্থ হয়েছে।' });
      }
    } catch (err) {
      setApiResponseMsg({ type: 'error', text: 'সার্ভার অ্যাকশন রিকোয়েস্ট ফেইলড।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CRUD OPERATIONS ---

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.roll || !newMember.name || !newMember.role) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        setNewMember({ roll: '', name: '', role: 'অভিনেতা', character_name: '', avatar_url: '' });
        setApiResponseMsg({ type: 'success', text: 'কুশীলব সফলভাবে যুক্ত করা হয়েছে।' });
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'ভুলত্রুটি হয়েছে।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item (generic helper)
  const handleDeleteItem = async (endpoint: string, id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই রেকর্ডটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/${endpoint}?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApiResponseMsg({ type: 'success', text: 'রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে।' });
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'ডিলিট করা যায়নি।');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Trigger
  const startEditing = (id: string, currentData: any) => {
    setEditingId(id);
    setEditForm({ ...currentData });
  };

  // Save Edits (generic helper)
  const handleSaveEdit = async (endpoint: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm })
      });
      if (res.ok) {
        setEditingId(null);
        setApiResponseMsg({ type: 'success', text: 'রেকর্ড আপডেট সফল হয়েছে।' });
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'আপডেট করা যায়নি।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-wrapper min-h-screen">
      <div className="content-container">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">প্যানেল নির্বাচন</Link>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-[#e056fd] font-bold">ডেভেলপার প্যানেল</span>
            </div>
            <h2 className="text-3xl font-black text-white">ডেভেলপার মাস্টার কন্ট্রোল প্যানেল ⚙️</h2>
            <p className="text-sm text-gray-400">সিস্টেম কনফিগারেশন, ডাটাবেজ এডিটর এবং পুশ অ্যালার্ট ল্যাব</p>
          </div>

          <button 
            onClick={fetchData} 
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 text-xs py-2 px-3"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>রিফ্রেশ ডেটা</span>
          </button>
        </div>

        {/* Diagnostic Response alerts */}
        {apiResponseMsg && (
          <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border text-left ${apiResponseMsg.type === 'success' ? 'bg-green-500/10 border-green-500/25 text-green-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
            <Info className="shrink-0 mt-0.5" size={16} />
            <span className="text-sm font-semibold leading-relaxed">{apiResponseMsg.text}</span>
          </div>
        )}

        {/* Master Admin Tabs */}
        <div className="flex border-b border-white/5 overflow-x-auto gap-2 mb-8">
          <button 
            onClick={() => { setActiveTab('system'); setEditingId(null); }} 
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'system' ? 'border-[#e056fd] text-[#e056fd]' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            সিস্টেম ও কানেকশন
          </button>
          <button 
            onClick={() => { setActiveTab('members'); setEditingId(null); }} 
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'members' ? 'border-[#e056fd] text-[#e056fd]' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            কুশীলব এডিটর ({members.length})
          </button>
          <button 
            onClick={() => { setActiveTab('attendance'); setEditingId(null); }} 
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'attendance' ? 'border-[#e056fd] text-[#e056fd]' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            হাজিরা এডমিন ({logs.length})
          </button>
          <button 
            onClick={() => { setActiveTab('tickets'); setEditingId(null); }} 
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'tickets' ? 'border-[#e056fd] text-[#e056fd]' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            টিকিট বুকিং ({tickets.length})
          </button>
          <button 
            onClick={() => { setActiveTab('rehearsals'); setEditingId(null); }} 
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'rehearsals' ? 'border-[#e056fd] text-[#e056fd]' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            মহড়া শিডিউল ({rehearsals.length})
          </button>
          <button 
            onClick={() => { setActiveTab('notes'); setEditingId(null); }} 
            className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'notes' ? 'border-[#e056fd] text-[#e056fd]' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            ডায়েরি নোটিস ({notes.length})
          </button>
        </div>

        {/* Loading state indicator */}
        {loading && (
          <div className="glass-panel p-16 text-center text-gray-400 text-sm">
            সার্ভার থেকে মাস্টার ফাইল ও ডেটাবেজ লোড করা হচ্ছে...
          </div>
        )}

        {/* TAB 1: SYSTEM & CONNECTION SETTINGS */}
        {!loading && activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Health monitor */}
            <div className="glass-panel text-left space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Activity className="text-[#e056fd]" size={16} />
                <span>সংযোগ ও হেলথ মনিটর</span>
              </h3>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">সুপাবেস কানেকশন স্ট্যাটাস</p>
                <div className="flex items-center gap-3">
                  {dbStatus.healthy ? (
                    <CheckCircle className="text-green-400" size={24} />
                  ) : (
                    <XCircle className="text-amber-500" size={24} />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {dbStatus.healthy ? 'সুপাবেস ক্লাউড মোড (Live)' : 'লোকাল ডেমো মোড (Mock)'}
                    </h4>
                    <p className="text-[10px] text-gray-400">সিস্টেম রিয়েল-টাইম কানেক্টিভিটি</p>
                  </div>
                </div>
                <div className="text-[10px] text-gray-300 bg-white/5 p-2.5 rounded-lg font-mono break-all leading-normal">
                  {dbStatus.details || 'চেক করা হচ্ছে...'}
                </div>
              </div>
              
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">পুশ নোটিফিকেশন সিকিউরিটি (VAPID)</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">সাবস্ক্রিপশন সংখ্যা:</span>
                    <span className="font-bold text-white">{pushSubscriptionsCount} টি ডিভাইস</span>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label text-[8px]">VAPID Public Key</label>
                    <textarea 
                      readOnly
                      rows={2}
                      value={vapidPublicKey || 'কী লোড করা হচ্ছে...'}
                      className="form-input text-[9px] font-mono p-2 bg-zinc-950 text-gray-400 resize-none outline-none select-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* DB seeders */}
            <div className="glass-panel text-left space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Database className="text-[#ff7979]" size={16} />
                <span>মাস্টার ডেটা অপারেশনস</span>
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                সিস্টেম ডেটাবেজের সিড বা সম্পূর্ণ রিসেটিং মেথডস।
              </p>
              
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-[#ff7979]" />
                  <span>কুশীলব তালিকা রিসেট (Reseed)</span>
                </h4>
                <p className="text-[10px] text-gray-400">সিস্টেমের পূর্বের সব কাস্ট সরিয়ে নতুন ২৩ জন শিক্ষার্থীর ক্যারেক্টার প্রোফাইল রিকনফিগার করবে।</p>
                <button 
                  onClick={() => handleSystemAction('reseed')}
                  disabled={isSubmitting}
                  className="btn-glass text-[10px] py-2 w-full justify-center"
                >
                  ২৩ জন শিক্ষার্থীর তালিকা সিড করুন
                </button>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Trash2 size={14} className="text-red-400" />
                  <span>ক্লিন ডাটাবেজ (Clear DB)</span>
                </h4>
                <p className="text-[10px] text-gray-400">সিস্টেমের সমস্ত টিকিট, হাজিরা, রিহার্সাল ক্যালেন্ডার ও ডায়েরি পোস্ট ডিলিট করবে।</p>
                <button 
                  onClick={() => handleSystemAction('clear')}
                  disabled={isSubmitting}
                  className="btn-glass text-[10px] py-2 w-full justify-center border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  সব ডেটা মুছে ফেলুন
                </button>
              </div>
            </div>

            {/* Test panel */}
            <div className="glass-panel text-left space-y-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Terminal className="text-[#22a6b3]" size={16} />
                <span>টেস্টিং ও ডায়াগনস্টিকস হাব</span>
              </h3>
              
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <DatabaseBackup size={14} className="text-[#22a6b3]" />
                  <span>ডেমো ডেটা লোডার</span>
                </h4>
                <p className="text-[10px] text-gray-400">সিস্টেমটি টেস্ট করার জন্য ৫টি টিকিট, ৩টি মহড়া, ২টি ডায়েরি এবং ৮টি হাজিরা জেনারেট করবে।</p>
                <button 
                  onClick={() => handleSystemAction('demo')}
                  disabled={isSubmitting}
                  className="btn-glass text-[10px] py-2 w-full justify-center text-[#22a6b3] border-[#22a6b3]/20 hover:bg-[#22a6b3]/10"
                >
                  ডেমো ডেটা প্রস্তুত করুন
                </button>
              </div>

              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Send size={14} className="text-green-400" />
                  <span>টেস্ট পুশ নোটিফিকেশন</span>
                </h4>
                <p className="text-[10px] text-gray-400">রেজিস্টার্ড ব্রাউজারগুলোতে একটি ইনস্ট্যান্ট ডিরেক্ট টেস্ট নোটিফিকেশন ফায়ার করবে।</p>
                <button 
                  onClick={() => handleSystemAction('push_test')}
                  disabled={isSubmitting || pushSubscriptionsCount === 0}
                  className="btn-primary py-2 text-[10px] w-full justify-center bg-green-600 hover:bg-green-700"
                >
                  টেস্ট পুশ নোটিফিকেশন পাঠান
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MEMBERS CRUD EDITOR */}
        {!loading && activeTab === 'members' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* Add Member Form */}
            <div className="lg:col-span-4 glass-panel space-y-5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="text-[#e056fd]" size={16} />
                <span>নতুন কুশীলব যুক্ত করুন</span>
              </h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">রোল নম্বর (Unique ID)</label>
                  <input 
                    type="text" 
                    placeholder="উদা: 1070" 
                    value={newMember.roll}
                    onChange={e => setNewMember({ ...newMember, roll: e.target.value })}
                    className="form-input text-xs py-2"
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">কুশীলবের নাম</label>
                  <input 
                    type="text" 
                    placeholder="উদা: মারুফ আহমেদ" 
                    value={newMember.name}
                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                    className="form-input text-xs py-2"
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">ভূমিকা (Role)</label>
                  <select 
                    value={newMember.role}
                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                    className="form-input text-xs py-2 bg-zinc-950 text-gray-300"
                  >
                    <option value="অভিনেতা">অভিনেতা</option>
                    <option value="অভিনেত্রী">অভিনেত্রী</option>
                    <option value="নির্দেশক">নির্দেশক</option>
                    <option value="কলাকুশলী">কলাকুশলী</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label text-[10px]">রক্তকরবী চরিত্র (Character Mapping)</label>
                  <input 
                    type="text" 
                    placeholder="উদা: রঞ্জন, ফাগুলাল (ঐচ্ছিক)" 
                    value={newMember.character_name}
                    onChange={e => setNewMember({ ...newMember, character_name: e.target.value })}
                    className="form-input text-xs py-2"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-[10px]">ছবি URL (Avatar Link)</label>
                  <input 
                    type="text" 
                    placeholder="https://images.unsplash.com/..." 
                    value={newMember.avatar_url}
                    onChange={e => setNewMember({ ...newMember, avatar_url: e.target.value })}
                    className="form-input text-xs py-2"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-secondary w-full justify-center text-xs py-2.5">
                  <Plus size={14} />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </form>
            </div>

            {/* Members List Table */}
            <div className="lg:col-span-8 glass-panel space-y-4">
              <h3 className="font-bold text-base text-white">কুশীলব ডেটাবেজ এডিটর (CRUD)</h3>
              
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold">
                      <th className="pb-3 pr-2">রোল</th>
                      <th className="pb-3 pr-2">নাম</th>
                      <th className="pb-3 pr-2">ভূমিকা</th>
                      <th className="pb-3 pr-2">চরিত্র</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(m => (
                      <tr key={m.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                        {editingId === m.id ? (
                          <>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.roll} 
                                onChange={e => setEditForm({ ...editForm, roll: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 w-16"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.name} 
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <select 
                                value={editForm.role} 
                                onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 text-gray-300 w-24"
                              >
                                <option value="অভিনেতা">অভিনেতা</option>
                                <option value="অভিনেত্রী">অভিনেত্রী</option>
                                <option value="নির্দেশক">নির্দেশক</option>
                                <option value="কলাকুশলী">কলাকুশলী</option>
                              </select>
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.character_name || ''} 
                                onChange={e => setEditForm({ ...editForm, character_name: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 w-28"
                              />
                            </td>
                            <td className="py-2 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => handleSaveEdit('members')}
                                className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/25 border border-green-500/20"
                                title="সংরক্ষণ করুন"
                              >
                                <Save size={12} />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded bg-zinc-800 text-gray-400 hover:bg-zinc-700"
                              >
                                বাতিল
                              </button>
                            </td>
                          </>
                          ) : (
                          <>
                            <td className="py-3 font-mono font-bold text-[#ff7979]">{m.roll}</td>
                            <td className="py-3 font-semibold text-white">{m.name}</td>
                            <td className="py-3">{m.role}</td>
                            <td className="py-3 font-semibold text-[#e056fd]">{m.character_name || 'নেপথ্য'}</td>
                            <td className="py-3 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => startEditing(m.id, m)}
                                className="p-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                                title="সম্পাদনা করুন"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('members', m.id)}
                                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ATTENDANCE CRUD EDITOR */}
        {!loading && activeTab === 'attendance' && (
          <div className="glass-panel text-left space-y-4">
            <h3 className="font-bold text-base text-white">হাজিরা ডায়েরি এডিটর (Attendance Logs)</h3>
            {logs.length === 0 ? (
              <p className="text-center py-10 text-gray-500 text-sm">কোনো হাজিরার তথ্য ডেটাবেজে নেই।</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold">
                      <th className="pb-3 pr-2">কুশীলব</th>
                      <th className="pb-3 pr-2">রোল</th>
                      <th className="pb-3 pr-2">চেক-ইন সময়</th>
                      <th className="pb-3 text-center">লেট (Late)</th>
                      <th className="pb-3 text-center">স্ট্যাটাস</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                        {editingId === log.id ? (
                          <>
                            <td className="py-2 pr-2 font-semibold text-white">{log.member?.name || 'অজ্ঞাত'}</td>
                            <td className="py-2 pr-2 font-mono">{log.member?.roll}</td>
                            <td className="py-2 pr-2 text-gray-400">
                              {new Date(log.check_in_time).toLocaleString('bn-BD')}
                            </td>
                            <td className="py-2 text-center">
                              <input 
                                type="checkbox" 
                                checked={editForm.is_late} 
                                onChange={e => setEditForm({ ...editForm, is_late: e.target.checked, status: e.target.checked ? 'late' : 'present' })}
                                className="accent-[#ff7979]"
                              />
                            </td>
                            <td className="py-2 text-center">
                              <select 
                                value={editForm.status} 
                                onChange={e => setEditForm({ ...editForm, status: e.target.value, is_late: e.target.value === 'late' })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 text-gray-300 w-24 mx-auto"
                              >
                                <option value="present">উপস্থিত (Present)</option>
                                <option value="late">লেট (Late)</option>
                                <option value="absent">অনুপস্থিত (Absent)</option>
                              </select>
                            </td>
                            <td className="py-2 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => handleSaveEdit('attendance')}
                                className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/25 border border-green-500/20"
                              >
                                <Save size={12} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-zinc-800 text-gray-400 hover:bg-zinc-700">
                                বাতিল
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 font-semibold text-white">{log.member?.name || 'অজ্ঞাত'}</td>
                            <td className="py-3 font-mono font-bold text-gray-400">{log.member?.roll}</td>
                            <td className="py-3 text-gray-400">
                              {new Date(log.check_in_time).toLocaleDateString('bn-BD')} {new Date(log.check_in_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-3 text-center">
                              <span className={log.is_late ? 'text-yellow-500 font-bold' : 'text-green-500 font-bold'}>
                                {log.is_late ? 'হ্যাঁ' : 'না'}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`badge ${log.status === 'late' ? 'badge-late' : log.status === 'absent' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'badge-present'} text-[8px] py-0.5 px-2`}>
                                {log.status === 'late' ? 'লেট' : log.status === 'absent' ? 'অনুপস্থিত' : 'উপস্থিত'}
                              </span>
                            </td>
                            <td className="py-3 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => startEditing(log.id, log)}
                                className="p-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('attendance', log.id)}
                                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TICKETS CRUD EDITOR */}
        {!loading && activeTab === 'tickets' && (
          <div className="glass-panel text-left space-y-4">
            <h3 className="font-bold text-base text-white">দর্শক টিকিট রিজার্ভেশন ডাটাবেজ</h3>
            {tickets.length === 0 ? (
              <p className="text-center py-10 text-gray-500 text-sm">কোনো টিকিট বুকিং পাওয়া যায়নি।</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold">
                      <th className="pb-3 pr-2">আইডি</th>
                      <th className="pb-3 pr-2">দর্শক</th>
                      <th className="pb-3 pr-2">ফোন নম্বর</th>
                      <th className="pb-3 text-center">আসন সংখ্যা</th>
                      <th className="pb-3 text-center">গেট ভেরিফাইড</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                        {editingId === t.id ? (
                          <>
                            <td className="py-2 font-mono text-gray-400">{t.id}</td>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.name} 
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.phone} 
                                onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950"
                              />
                            </td>
                            <td className="py-2 text-center pr-2">
                              <input 
                                type="number" 
                                value={editForm.seats} 
                                onChange={e => setEditForm({ ...editForm, seats: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 w-16 mx-auto text-center"
                              />
                            </td>
                            <td className="py-2 text-center">
                              <input 
                                type="checkbox" 
                                checked={editForm.is_verified} 
                                onChange={e => setEditForm({ ...editForm, is_verified: e.target.checked })}
                                className="accent-[#ff7979]"
                              />
                            </td>
                            <td className="py-2 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => handleSaveEdit('tickets')}
                                className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/25 border border-green-500/20"
                              >
                                <Save size={12} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-zinc-800 text-gray-400 hover:bg-zinc-700">
                                বাতিল
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 font-mono text-[10px] text-gray-400">{t.id}</td>
                            <td className="py-3 font-semibold text-white">{t.name}</td>
                            <td className="py-3 font-mono">{t.phone}</td>
                            <td className="py-3 text-center font-bold text-[#ff7979]">{t.seats} টি</td>
                            <td className="py-3 text-center">
                              <span className={`badge ${t.is_verified ? 'badge-present' : 'bg-zinc-850 text-gray-400 border-zinc-700/50'} text-[8px] py-0.5 px-2`}>
                                {t.is_verified ? 'ভেরিফাইড' : 'পেন্ডিং'}
                              </span>
                            </td>
                            <td className="py-3 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => startEditing(t.id, t)}
                                className="p-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('tickets', t.id)}
                                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: REHEARSALS CRUD EDITOR */}
        {!loading && activeTab === 'rehearsals' && (
          <div className="glass-panel text-left space-y-4">
            <h3 className="font-bold text-base text-white">মহড়া ক্যালেন্ডার শিডিউল লিস্ট</h3>
            {rehearsals.length === 0 ? (
              <p className="text-center py-10 text-gray-500 text-sm">কোনো মহড়া শিডিউল পাওয়া যায়নি।</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold">
                      <th className="pb-3 pr-2">মহড়ার শিরোনাম</th>
                      <th className="pb-3 pr-2">তারিখ</th>
                      <th className="pb-3 pr-2">সময়</th>
                      <th className="pb-3 pr-2">প্রয়োজনীয় কাস্ট</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rehearsals.map(r => (
                      <tr key={r.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                        {editingId === r.id ? (
                          <>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.title} 
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 w-full"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="date" 
                                value={editForm.date} 
                                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 text-gray-400"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.time} 
                                onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 w-16"
                              />
                            </td>
                            <td className="py-2 pr-2">
                              <input 
                                type="text" 
                                value={editForm.required_cast} 
                                onChange={e => setEditForm({ ...editForm, required_cast: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 w-44"
                              />
                            </td>
                            <td className="py-2 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => handleSaveEdit('rehearsals')}
                                className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/25 border border-green-500/20"
                              >
                                <Save size={12} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-zinc-800 text-gray-400 hover:bg-zinc-700">
                                বাতিল
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 font-semibold text-white">{r.title}</td>
                            <td className="py-3 font-mono">{r.date}</td>
                            <td className="py-3 font-mono text-[#ff7979]">{r.time}</td>
                            <td className="py-3 text-[#e056fd] font-semibold">{r.required_cast}</td>
                            <td className="py-3 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => startEditing(r.id, r)}
                                className="p-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('rehearsals', r.id)}
                                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: NOTES CRUD EDITOR */}
        {!loading && activeTab === 'notes' && (
          <div className="glass-panel text-left space-y-4">
            <h3 className="font-bold text-base text-white">নির্দেশক মহড়া ডায়েরি লিস্ট (Notes Admin)</h3>
            {notes.length === 0 ? (
              <p className="text-center py-10 text-gray-500 text-sm">কোনো মন্তব্য ডাটাবেজে নেই।</p>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold">
                      <th className="pb-3 pr-2">তারিখ</th>
                      <th className="pb-3 pr-2">মন্তব্য নোটিশ সামগ্রী</th>
                      <th className="pb-3 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(n => (
                      <tr key={n.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                        {editingId === n.id ? (
                          <>
                            <td className="py-2 pr-2 font-mono text-gray-400 w-28">{n.date}</td>
                            <td className="py-2 pr-2">
                              <textarea 
                                rows={2}
                                value={editForm.content} 
                                onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                                className="form-input text-xs py-1 px-2 bg-zinc-950 w-full"
                              />
                            </td>
                            <td className="py-2 text-right flex gap-1.5 justify-end">
                              <button 
                                onClick={() => handleSaveEdit('rehearsal-notes')}
                                className="p-1.5 rounded bg-green-500/10 text-green-400 hover:bg-green-500/25 border border-green-500/20"
                              >
                                <Save size={12} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 rounded bg-zinc-800 text-gray-400 hover:bg-zinc-700">
                                বাতিল
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 font-bold text-[#ff7979] w-28">{n.date}</td>
                            <td className="py-3 text-gray-200 leading-relaxed pr-6 whitespace-pre-wrap">{n.content}</td>
                            <td className="py-3 text-right flex gap-1.5 justify-end shrink-0">
                              <button 
                                onClick={() => startEditing(n.id, n)}
                                className="p-1.5 rounded bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => handleDeleteItem('rehearsal-notes', n.id)}
                                className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
