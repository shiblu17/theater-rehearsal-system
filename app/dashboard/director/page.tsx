'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  Bell, 
  BellOff, 
  QrCode, 
  RefreshCw, 
  ExternalLink,
  Calendar,
  BookOpen,
  CheckCircle,
  Plus,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Search,
  Volume2,
  TrendingUp,
  Settings,
  ArrowRight
} from 'lucide-react';
import { Member, Attendance, Rehearsal, RehearsalNote, Ticket } from '@/lib/db';
import Link from 'next/link';

export default function DirectorDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [logs, setLogs] = useState<Attendance[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [notes, setNotes] = useState<RehearsalNote[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'logs' | 'scheduler' | 'verify' | 'diary' | 'settings'>('leaderboard');

  // Dynamic Cutoff Settings state
  const [morningCutoff, setMorningCutoff] = useState('11:30');
  const [afternoonCutoff, setAfternoonCutoff] = useState('15:00');
  const [sessionTransition, setSessionTransition] = useState('13:30');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Attendance Sheets filtering states
  const [sheetDate, setSheetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceView, setAttendanceView] = useState<'tabular' | 'morning' | 'afternoon'>('tabular');

  // Input states
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [newRehearsal, setNewRehearsal] = useState({ title: '', date: '', time: '', description: '', required_cast: '' });
  const [newNote, setNewNote] = useState<string>('');
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>('');
  const [verifyStatusMessage, setVerifyStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // QR Camera scanner simulation state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTickId, setScannerTickId] = useState('');

  // Refs for tracking changes
  const prevLogsCountRef = useRef<number>(0);
  const isFirstLoadRef = useRef<boolean>(true);

  // Play synthesized web audio bell sound
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5 note
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio chime failed:', e);
    }
  };

  // Fetch all dashboard data
  const fetchData = async () => {
    try {
      const [membersRes, logsRes, leaderboardRes, rehearsalsRes, notesRes, ticketsRes, statsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/attendance'),
        fetch('/api/leaderboard'),
        fetch('/api/rehearsals'),
        fetch('/api/rehearsal-notes'),
        fetch('/api/tickets'),
        fetch('/api/weekly-stats')
      ]);

      const membersData = await membersRes.json();
      const logsData = await logsRes.json();
      const leaderboardData = await leaderboardRes.json();
      const rehearsalsData = await rehearsalsRes.json();
      const notesData = await notesRes.json();
      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();

      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(rehearsalsData)) setRehearsals(rehearsalsData);
      if (Array.isArray(notesData)) setNotes(notesData);
      if (Array.isArray(ticketsData)) setTickets(ticketsData);
      if (Array.isArray(statsData)) setWeeklyStats(statsData);
      
      if (Array.isArray(logsData)) {
        setLogs(logsData);
        // Play notification sound on new check-in
        if (!isFirstLoadRef.current && logsData.length > prevLogsCountRef.current) {
          playChime();
        }
        prevLogsCountRef.current = logsData.length;
        isFirstLoadRef.current = false;
      }
      
      if (Array.isArray(leaderboardData)) setLeaderboard(leaderboardData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.morning_cutoff) setMorningCutoff(data.morning_cutoff);
      if (data.afternoon_cutoff) setAfternoonCutoff(data.afternoon_cutoff);
      if (data.session_transition) setSessionTransition(data.session_transition);
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          morning_cutoff: morningCutoff, 
          afternoon_cutoff: afternoonCutoff,
          session_transition: sessionTransition
        }),
      });
      if (res.ok) {
        alert('হাজিরা সময়সীমা সেটিংস সফলভাবে আপডেট হয়েছে!');
      } else {
        const err = await res.json();
        alert(err.error || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert('একটি নেটওয়ার্ক ত্রুটি ঘটেছে।');
    } finally {
      setIsSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSettings();
    
    // Poll data every 5 seconds for real-time check-ins
    const interval = setInterval(fetchData, 5000);

    // Check Notification API support
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        setNotificationStatus('unsupported');
      } else {
        setNotificationStatus(Notification.permission as any);
      }
    }

    return () => clearInterval(interval);
  }, []);

  // Web push activation
  const enableNotifications = async () => {
    if (notificationStatus === 'unsupported') return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      
      // Fetch public key
      const keyRes = await fetch('/api/vapid-public-key');
      const { publicKey } = await keyRes.json();
      if (!publicKey) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Notification subscription error:', error);
    }
  };

  // Convert VAPID base64 key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Quick manually check-in check
  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll: member.roll }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'চেক-ইন ব্যর্থ হয়েছে।');
      
      fetchData();
      playChime();
    } catch (err: any) {
      alert(err.message || 'চেক-ইন প্রসেস করা যায়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRehearsal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRehearsal.date || !newRehearsal.time) {
      alert('মহড়ার তারিখ এবং সময় অবশ্যই প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: newRehearsal.title.trim() || 'মহড়া',
        date: newRehearsal.date,
        time: newRehearsal.time,
        description: newRehearsal.description,
        required_cast: newRehearsal.required_cast.trim() || 'সকল কুশীলব'
      };

      const res = await fetch('/api/rehearsals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewRehearsal({ title: '', date: '', time: '', description: '', required_cast: '' });
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || 'মহড়া শিডিউল তৈরি করা যায়নি।');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete rehearsal
  const handleDeleteRehearsal = async (id: string) => {
    if (!confirm('আপনি কি সত্যিই এই মহড়া শিডিউলটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/rehearsals?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add director note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/rehearsal-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote })
      });
      if (res.ok) {
        setNewNote('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify ticket manually
  const handleVerifyTicket = async (ticketId: string) => {
    if (!ticketId.trim()) return;
    setVerifyStatusMessage(null);
    try {
      const res = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyStatusMessage({ type: 'success', text: `সফল! দর্শক: ${data.ticket.name}, আসন: ${data.ticket.seats}টি বুকিং যাচাই করা হয়েছে।` });
        playChime();
        fetchData();
      } else {
        setVerifyStatusMessage({ type: 'error', text: data.error || 'এই টিকিট আইডিটি বৈধ নয় বা পূর্বেই ব্যবহৃত হয়েছে।' });
      }
    } catch (err) {
      setVerifyStatusMessage({ type: 'error', text: 'কানেকশন ইরর, আবার চেষ্টা করুন।' });
    }
  };

  // Filtered tickets list for search
  const filteredTickets = tickets.filter(t => 
    t.id.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(ticketSearchQuery.toLowerCase()) ||
    t.phone.includes(ticketSearchQuery)
  );

  // Attendance sheets processing based on selected sheetDate
  const selectedDateStr = new Date(sheetDate).toDateString();
  const selectedDateLogs = logs.filter(log => {
    const timeVal = log.check_in_time || (log as any).created_at;
    return timeVal && new Date(timeVal).toDateString() === selectedDateStr;
  });

  const morningLogs = selectedDateLogs.filter(l => (l.session || 'morning') === 'morning');
  const afternoonLogs = selectedDateLogs.filter(l => l.session === 'afternoon');

  const tabularData = members.map(m => {
    const morningLog = morningLogs.find(l => l.member_id === m.id);
    const afternoonLog = afternoonLogs.find(l => l.member_id === m.id);
    return {
      member: m,
      morning: morningLog,
      afternoon: afternoonLog
    };
  });

  return (
    <div className="section-wrapper min-h-screen">
      <div className="content-container">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">প্যানেল নির্বাচন</Link>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-[#ff7979] font-bold">নির্দেশক পোর্টাল</span>
            </div>
            <h2 className="text-3xl font-black text-white">রক্তকরবী নির্দেশক পোর্টাল 🎭</h2>
            <p className="text-sm text-gray-400">শিবলু ভাইয়ের নির্দেশক ও সমন্বয়কারী ড্যাশবোর্ড</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData} 
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            {notificationStatus === 'default' && (
              <button 
                onClick={enableNotifications} 
                className="btn-primary py-2.5 text-xs bg-gradient-to-r from-[#e056fd] to-[#ff7979] text-white"
              >
                <Bell size={14} />
                <span>পুশ নোটিফিকেশন সচল করুন</span>
              </button>
            )}
            {notificationStatus === 'granted' && (
              <span className="px-3.5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck size={14} />
                <span>পুশ অ্যালার্ট সচল আছে</span>
              </span>
            )}
          </div>
        </div>

        {/* Weekly Attendance Trend Bar Chart */}
        {weeklyStats.length > 0 && (
          <div className="glass-panel p-6 mb-8 text-left space-y-6">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp size={18} className="text-[#ff7979]" />
              <h3 className="font-bold text-sm">সাপ্তাহিক কাস্ট হাজিরার গড় রেকর্ড (Weekly Trend)</h3>
            </div>
            
            {/* Visual SVG/CSS Graph representation */}
            <div className="flex items-end justify-between h-28 gap-4 pt-4 border-b border-white/10 px-2">
              {weeklyStats.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-zinc-950 border border-white/10 px-2 py-1 rounded text-[9px] text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-20">
                    {day.rate}% গড় হাজিরা ({day.count} জন)
                  </div>

                  {/* Dynamic Colored Bar */}
                  <div 
                    style={{ height: `${Math.max(day.rate, 6)}%` }} 
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 hover:brightness-110 ${day.rate >= 80 ? 'bg-emerald-500' : day.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  ></div>
                  
                  <span className="text-[10px] text-gray-400 font-bold mt-2 pt-1">{day.label}</span>
                  <span className="text-[8px] text-gray-500 font-medium">{day.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#ff7979]/10 border border-[#ff7979]/20 flex items-center justify-center text-[#ff7979]">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">মোট কুশীলব</p>
              <h3 className="text-2xl font-black text-white">{members.length} জন</h3>
            </div>
          </div>

          <div className="glass-panel p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">আজকে উপস্থিত</p>
              <h3 className="text-2xl font-black text-white">
                {logs.filter(l => {
                  const checkDate = new Date(l.check_in_time).toDateString();
                  const today = new Date().toDateString();
                  return checkDate === today && l.status === 'present';
                }).length} জন
              </h3>
            </div>
          </div>

          <div className="glass-panel p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#e056fd]/10 border border-[#e056fd]/20 flex items-center justify-center text-[#e056fd]">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">আজকে লেট</p>
              <h3 className="text-2xl font-black text-white">
                {logs.filter(l => {
                  const checkDate = new Date(l.check_in_time).toDateString();
                  const today = new Date().toDateString();
                  return checkDate === today && l.status === 'late';
                }).length} জন
              </h3>
            </div>
          </div>

          <div className="glass-panel p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-[#22a6b3]/10 border border-[#22a6b3]/20 flex items-center justify-center text-[#22a6b3]">
              <QrCode size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">ভেরিফাইড টিকিট</p>
              <h3 className="text-2xl font-black text-white">
                {tickets.filter(t => t.is_verified).length} / {tickets.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Workspace Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* MAIN COLUMN: Controls & Forms */}
          <div className="lg:col-span-12 space-y-6">
            
            {/* Dashboard Tabs Selector */}
            <div className="flex border-b border-white/5 overflow-x-auto gap-2">
              <button 
                onClick={() => setActiveTab('leaderboard')} 
                className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'leaderboard' ? 'border-[#ff7979] text-[#ff7979]' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                সময়নিষ্ঠা লিডারবোর্ড
              </button>
              <button 
                onClick={() => setActiveTab('logs')} 
                className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'logs' ? 'border-[#ff7979] text-[#ff7979]' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                দৈনিক হাজিরা শিট 📋
              </button>
              <button 
                onClick={() => setActiveTab('scheduler')} 
                className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'scheduler' ? 'border-[#ff7979] text-[#ff7979]' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                মহড়া শিডিউলার ({rehearsals.length})
              </button>
              <button 
                onClick={() => setActiveTab('verify')} 
                className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'verify' ? 'border-[#ff7979] text-[#ff7979]' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                গেট টিকিট ভেরিফাই
              </button>
              <button 
                onClick={() => setActiveTab('diary')} 
                className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'diary' ? 'border-[#ff7979] text-[#ff7979]' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                নির্দেশক ডায়েরি
              </button>
              <button 
                onClick={() => setActiveTab('settings')} 
                className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'settings' ? 'border-[#ff7979] text-[#ff7979]' : 'border-transparent text-gray-400 hover:text-white'}`}
              >
                হাজিরা সেটিংস ⚙️
              </button>
            </div>

            {/* TAB CONTENT: LEADERBOARD WITH HEATMAP & BADGES */}
            {activeTab === 'leaderboard' && (
              <div className="glass-panel space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-white">সময়নিষ্ঠা রেটিং ও কাস্ট অ্যাক্টিভিটি 🏆</h3>
                    <p className="text-[10px] text-gray-400">রোল ক্যারেক্টার, রবীন্দ্র ফান ব্যাজ এবং গত ১৪ দিনের হাজিরা কন্সিস্টেন্সি গ্রিড</p>
                  </div>
                  
                  {/* Heatmap Legend */}
                  <div className="flex gap-2 text-[8px] text-gray-400 font-bold bg-white/5 p-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500"></span> অন-টাইম</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-500"></span> লেট</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span> এবসেন্ট</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-zinc-800 border border-zinc-700/30"></span> মহড়া নাই</div>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-10 text-gray-500">লোডিং হচ্ছে...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">এখনও কোনো হাজিরার তথ্য পাওয়া যায়নি।</div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((m, idx) => (
                      <div key={m.member_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl transition-all gap-4 text-left">
                        
                        {/* Member Details */}
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-[#ff7979]">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{m.name}</h4>
                              
                              {/* Dynamic Achievement Badge */}
                              {m.badge && (
                                <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${m.badge.className}`}>
                                  <span>{m.badge.icon}</span>
                                  <span>{m.badge.text}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400">রোল: {m.roll} • ক্যারেক্টার: <span className="text-[#e056fd] font-semibold">{m.character_name || 'নাই'}</span></p>
                          </div>
                        </div>

                        {/* 14-Day GitHub style Heatmap & Stats */}
                        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                          
                          {/* Heatmap Box Grid */}
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">গত ১৪ দিন:</span>
                            <div className="flex gap-1">
                              {m.heatmap && m.heatmap.map((status: string, heatIdx: number) => {
                                let bgClass = 'bg-zinc-800 border border-zinc-700/30';
                                if (status === 'present') bgClass = 'bg-green-500';
                                if (status === 'late') bgClass = 'bg-yellow-500';
                                if (status === 'absent') bgClass = 'bg-red-500';

                                return (
                                  <div 
                                    key={heatIdx} 
                                    className={`w-2.5 h-2.5 rounded-sm transition-transform hover:scale-125 duration-100 ${bgClass}`}
                                    title={`Day ${heatIdx + 1}: ${status === 'none' ? 'No Rehearsal' : status}`}
                                  ></div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Stats text */}
                          <div className="text-right">
                            <div className="text-xs font-black text-white">{m.punctualityRate}% পাংচুয়াল</div>
                            <div className="text-[9px] text-gray-400">হাজির: {m.totalPresent} দিন (লেট: {m.totalPresent - m.onTimeCount} দিন)</div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: HISTORY LOGS / ATTENDANCE SHEETS */}
            {activeTab === 'logs' && (
              <div className="glass-panel space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/5 pb-4">
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-white">দৈনিক মহড়া হাজিরা শিট 📋</h3>
                    <p className="text-[10px] text-gray-400">সকাল ও দুপুরের সেশনভিত্তিক উপস্থিতি ট্র্যাকিং শিট</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <input 
                      type="date"
                      value={sheetDate}
                      onChange={e => setSheetDate(e.target.value)}
                      className="form-input text-xs py-2 px-3 bg-zinc-950 text-gray-300 border border-white/10 rounded-xl"
                    />
                    
                    <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden p-0.5">
                      <button
                        onClick={() => setAttendanceView('tabular')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${attendanceView === 'tabular' ? 'bg-[#ff7979] text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        সমন্বিত শিট
                      </button>
                      <button
                        onClick={() => setAttendanceView('morning')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${attendanceView === 'morning' ? 'bg-[#ff7979] text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        সকাল ({morningLogs.length})
                      </button>
                      <button
                        onClick={() => setAttendanceView('afternoon')}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${attendanceView === 'afternoon' ? 'bg-[#ff7979] text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        দুপুর ({afternoonLogs.length})
                      </button>
                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="text-center py-10 text-gray-500">লোডিং হচ্ছে...</div>
                ) : attendanceView === 'tabular' ? (
                  /* Tabular Grid representing both morning & afternoon */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3">কুশীলব</th>
                          <th className="pb-3 text-center">রোল</th>
                          <th className="pb-3 text-center">সকালের সেশন ({morningLogs.length} জন)</th>
                          <th className="pb-3 text-center">দুপুরের সেশন ({afternoonLogs.length} জন)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabularData.map((row) => (
                          <tr key={row.member.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                            <td className="py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                <img 
                                  src={row.member.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                                  alt={row.member.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{row.member.name}</h4>
                                <p className="text-[9px] text-gray-500">{row.member.role} • {row.member.character_name || 'নেপথ্য'}</p>
                              </div>
                            </td>
                            <td className="py-3 text-center font-mono font-bold">{row.member.roll}</td>
                            
                            {/* Morning check-in status */}
                            <td className="py-3 text-center">
                              {row.morning ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-bold text-white text-[10px]">
                                    {new Date(row.morning.check_in_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${row.morning.is_late ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                    {row.morning.is_late ? 'বিলম্বিত' : 'সময়মতো'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">অনুপস্থিত</span>
                              )}
                            </td>

                            {/* Afternoon check-in status */}
                            <td className="py-3 text-center">
                              {row.afternoon ? (
                                <div className="inline-flex flex-col items-center">
                                  <span className="font-bold text-white text-[10px]">
                                    {new Date(row.afternoon.check_in_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${row.afternoon.is_late ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                    {row.afternoon.is_late ? 'বিলম্বিত' : 'সময়মতো'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">অনুপস্থিত</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Morning or Afternoon list feed */
                  <div className="space-y-3">
                    {(attendanceView === 'morning' ? morningLogs : afternoonLogs).length === 0 ? (
                      <div className="text-center py-10 text-gray-500">এই সেশনে কোনো চেক-ইন রেকর্ড নেই।</div>
                    ) : (
                      (attendanceView === 'morning' ? morningLogs : afternoonLogs).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                              <img 
                                src={log.member?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                                alt={log.member?.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm">{log.member?.name || 'অজ্ঞাত কুশীলব'}</h4>
                              <p className="text-[10px] text-gray-400">রোল: {log.member?.roll} • ক্যারেক্টার: {log.member?.character_name || 'নেপথ্য'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`badge ${log.status === 'late' ? 'badge-late' : 'badge-present'} text-[9px] mb-1`}>
                              {log.status === 'late' ? 'লেট চেক-ইন' : 'সময়মতো উপস্থিত'}
                            </span>
                            <p className="text-[9px] text-gray-400">
                              {new Date(log.check_in_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ATTENDANCE CUTOFF SETTINGS */}
            {activeTab === 'settings' && (
              <div className="glass-panel text-left">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ff7979]/10 border border-[#ff7979]/20 flex items-center justify-center text-[#ff7979]">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">হাজিরা সময়সীমা সেটিংস (Cutoff Settings) ⚙️</h3>
                    <p className="text-xs text-gray-400">সকাল ও দুপুরের সেশনে বিলম্বে উপস্থিতির সময়সীমা নির্ধারণ করুন</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="form-group mb-0">
                      <label className="form-label text-xs font-bold text-gray-300">সকালের সেশনের কাট-অফ সময়</label>
                      <input 
                        type="time" 
                        value={morningCutoff}
                        onChange={e => setMorningCutoff(e.target.value)}
                        className="form-input py-3 bg-zinc-950 border border-white/10 rounded-xl px-3 w-full text-gray-300"
                        required
                      />
                      <p className="text-[10px] text-gray-500 mt-2">এই সময়ের পর চেক-ইন করলে তার উপস্থিতি "বিলম্বিত (Late)" হিসেবে রেকর্ড হবে।</p>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label text-xs font-bold text-gray-300">সেশন পরিবর্তনের সময় (Transition)</label>
                      <input 
                        type="time" 
                        value={sessionTransition}
                        onChange={e => setSessionTransition(e.target.value)}
                        className="form-input py-3 bg-zinc-950 border border-white/10 rounded-xl px-3 w-full text-gray-300"
                        required
                      />
                      <p className="text-[10px] text-gray-500 mt-2">এই সময়ের আগের হাজিরাকে সকালের সেশন এবং পরের হাজিরাকে দুপুরের সেশন ধরা হবে।</p>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label text-xs font-bold text-gray-300">দুপুরের সেশনের কাট-অফ সময়</label>
                      <input 
                        type="time" 
                        value={afternoonCutoff}
                        onChange={e => setAfternoonCutoff(e.target.value)}
                        className="form-input py-3 bg-zinc-950 border border-white/10 rounded-xl px-3 w-full text-gray-300"
                        required
                      />
                      <p className="text-[10px] text-gray-500 mt-2">দুপুরের খাবারের বিরতির পর এই সময়ের পর চেক-ইন করলে উপস্থিতি "বিলম্বিত" হবে।</p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSavingSettings}
                    className="btn-secondary px-6 font-bold py-3 text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    {isSavingSettings ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>সেটিংস সংরক্ষণ করুন</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: SCHEDULER */}
            {activeTab === 'scheduler' && (
              <div className="space-y-6">
                <div className="glass-panel">
                  <h3 className="font-bold text-lg text-white mb-6">নতুন মহড়া শিডিউল তৈরি করুন 🗓️</h3>
                  <form onSubmit={handleAddRehearsal} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="form-group mb-0">
                        <label className="form-label">মহড়ার শিরোনাম (ঐচ্ছিক)</label>
                        <input 
                          type="text" 
                          placeholder="উদা: দৃশ্য ২ এবং ৩ ড্রাফটিং" 
                          value={newRehearsal.title}
                          onChange={e => setNewRehearsal({ ...newRehearsal, title: e.target.value })}
                          className="form-input py-2.5"
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">তারিখ</label>
                        <input 
                          type="date" 
                          value={newRehearsal.date}
                          onChange={e => setNewRehearsal({ ...newRehearsal, date: e.target.value })}
                          className="form-input py-2.5 text-gray-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                      <div className="form-group mb-0">
                        <label className="form-label">সময় (Time)</label>
                        <input 
                          type="time" 
                          value={newRehearsal.time}
                          onChange={e => setNewRehearsal({ ...newRehearsal, time: e.target.value })}
                          className="form-input py-2.5 text-gray-400"
                          required
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label">কাদের উপস্থিত থাকতে হবে (ঐচ্ছিক)</label>
                        <input 
                          type="text" 
                          placeholder="উদা: নন্দিনী, রাজা, বিশু পাগল (বা অল কাস্ট)" 
                          value={newRehearsal.required_cast}
                          onChange={e => setNewRehearsal({ ...newRehearsal, required_cast: e.target.value })}
                          className="form-input py-2.5"
                        />
                      </div>
                    </div>

                    <div className="form-group text-left">
                      <label className="form-label">মহড়ার বর্ণনা (ঐচ্ছিক)</label>
                      <textarea 
                        rows={2}
                        placeholder="মহড়ার মূল ফোকাস বা প্রয়োজনীয় নির্দেশনা..."
                        value={newRehearsal.description}
                        onChange={e => setNewRehearsal({ ...newRehearsal, description: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                      <Plus size={16} />
                      <span>শিডিউল তৈরি করুন</span>
                    </button>
                  </form>
                </div>

                <div className="glass-panel text-left">
                  <h3 className="font-bold text-lg text-white mb-4">আসন্ন মহড়াসমূহ</h3>
                  {rehearsals.length === 0 ? (
                    <p className="text-center py-10 text-gray-500 text-sm">কোনো আসন্ন মহড়ার শিডিউল দেওয়া নেই।</p>
                  ) : (
                    <div className="space-y-4">
                      {rehearsals.map((r) => (
                        <div key={r.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-white text-base">{r.title}</h4>
                            <p className="text-xs text-gray-300">{r.description || 'কোনো বিবরণ নেই।'}</p>
                            <div className="flex flex-wrap gap-4 pt-1">
                              <span className="text-[10px] text-[#ff7979] font-semibold flex items-center gap-1">
                                <Calendar size={10} /> তারিখ: {r.date}
                              </span>
                              <span className="text-[10px] text-[#e056fd] font-semibold flex items-center gap-1">
                                <Clock size={10} /> সময়: {r.time}
                              </span>
                              <span className="text-[10px] text-[#22a6b3] font-semibold">
                                কুশীলব: {r.required_cast}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteRehearsal(r.id)} 
                            className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-all self-end md:self-auto"
                            title="শিডিউল মুছুন"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: TICKET CHECK-IN VERIFICATION */}
            {activeTab === 'verify' && (
              <div className="space-y-6">
                <div className="glass-panel text-left">
                  <h3 className="font-bold text-lg text-white mb-6">ゲটে টিকিট ভেরিফাই করুন (Gate Ticket Pass) 🎟️</h3>
                  
                  {verifyStatusMessage && (
                    <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${verifyStatusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/25 text-green-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
                      <AlertCircle className="shrink-0 mt-0.5" size={16} />
                      <span className="text-sm font-semibold leading-relaxed">{verifyStatusMessage.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      <div className="form-group mb-0">
                        <label className="form-label">টিকিট আইডি (Ticket ID)</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            placeholder="উদা: t_xxxxxxxxx" 
                            value={scannerTickId}
                            onChange={e => setScannerTickId(e.target.value)}
                            className="form-input py-2.5"
                          />
                          <button 
                            onClick={() => handleVerifyTicket(scannerTickId)} 
                            className="btn-secondary px-6 shrink-0"
                          >
                            যাচাই
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2">টিকিটে প্রিন্ট করা ইউনিক আইডি লিখে যাচাই করুন।</p>
                      </div>
                    </div>

                    <div className="glass-panel border-white/5 bg-black/40 p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-4 min-h-[160px]">
                      <QrCode className="text-[#ff7979] animate-pulse" size={32} />
                      <div>
                        <h4 className="font-bold text-sm text-white">কিউআর কোড স্ক্যানার (সিমুলেটর)</h4>
                        <p className="text-[10px] text-gray-400">স্বেচ্ছাসেবকদের গেট ক্যামেরা দিয়ে স্ক্যানিং প্যানেল</p>
                      </div>
                      <button 
                        onClick={() => setIsScannerOpen(!isScannerOpen)} 
                        className="btn-glass text-xs py-2 px-4 flex items-center gap-1.5"
                      >
                        <Volume2 size={12} />
                        <span>{isScannerOpen ? 'ক্যামেরা প্যানেল বন্ধ করুন' : 'ক্যামেরা স্ক্যানার চালু করুন'}</span>
                      </button>
                    </div>
                  </div>

                  {isScannerOpen && (
                    <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden bg-black/80 p-6 flex flex-col items-center justify-center text-center gap-4 relative">
                      <div className="absolute top-4 right-4 text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> LIVE
                      </div>
                      <div className="w-48 h-48 border-2 border-dashed border-[#ff7979] rounded-xl flex items-center justify-center relative overflow-hidden bg-zinc-900/60 shadow-inner">
                        <div className="absolute inset-x-0 top-0 h-1 bg-[#ff7979] shadow-[0_0_10px_#ff7979] animate-bounce"></div>
                        <p className="text-[10px] text-gray-400 font-semibold px-4">ক্যামেরার সামনে টিকিট কিউআর ধরুন</p>
                      </div>
                      
                      <div className="w-full max-w-sm space-y-2">
                        <p className="text-[10px] text-gray-400">সিমুলেশনের জন্য বুক করা পেন্ডিং টিকিট থেকে একটি সিলেক্ট করুন:</p>
                        <select 
                          onChange={(e) => {
                            setScannerTickId(e.target.value);
                            handleVerifyTicket(e.target.value);
                          }}
                          className="form-input text-xs py-2 bg-zinc-900 text-gray-300 outline-none"
                          defaultValue=""
                        >
                          <option value="" disabled>টিকিট আইডি সিলেক্ট করুন...</option>
                          {tickets.filter(t => !t.is_verified).map(t => (
                            <option key={t.id} value={t.id}>{t.name} (আসন: {t.seats}টি) [{t.id}]</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-panel text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h3 className="font-bold text-lg text-white">বুকিং করা টিকিটের ডেটাবেজ</h3>
                    <div className="relative w-full sm:max-w-xs">
                      <input 
                        type="text" 
                        placeholder="নাম, ফোন বা আইডি খুজুন..." 
                        value={ticketSearchQuery}
                        onChange={e => setTicketSearchQuery(e.target.value)}
                        className="form-input py-2 pl-9 pr-4 text-xs"
                      />
                      <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
                    </div>
                  </div>

                  {filteredTickets.length === 0 ? (
                    <p className="text-center py-10 text-gray-500 text-sm">কোনো টিকিট বুকিং ডেটা পাওয়া যায়নি।</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-gray-400 font-bold">
                            <th className="pb-3 pr-2">টিকিট আইডি</th>
                            <th className="pb-3 pr-2">দর্শক</th>
                            <th className="pb-3 pr-2">ফোন</th>
                            <th className="pb-3 text-center">আসন</th>
                            <th className="pb-3 text-center">স্ট্যাটাস</th>
                            <th className="pb-3 text-right">যাচাই</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTickets.map((t) => (
                            <tr key={t.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                              <td className="py-3 font-mono text-[10px] text-gray-400">{t.id}</td>
                              <td className="py-3 font-semibold text-white">{t.name}</td>
                              <td className="py-3">{t.phone}</td>
                              <td className="py-3 text-center font-bold text-white">{t.seats}</td>
                              <td className="py-3 text-center">
                                <span className={`badge ${t.is_verified ? 'badge-present' : 'badge-role bg-zinc-950'} text-[8px] py-0.5 px-2`}>
                                  {t.is_verified ? 'ভেরিফাইড' : 'পেন্ডিং'}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                {!t.is_verified && (
                                  <button 
                                    onClick={() => handleVerifyTicket(t.id)} 
                                    className="px-2.5 py-1 rounded bg-[#ff7979]/10 border border-[#ff7979]/20 text-[#ff7979] hover:bg-[#ff7979]/25 text-[10px] transition-all font-semibold"
                                  >
                                    চেক-ইন
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: DIARY */}
            {activeTab === 'diary' && (
              <div className="space-y-6">
                <div className="glass-panel">
                  <h3 className="font-bold text-lg text-white mb-6">আজকের মহড়ার মন্তব্য লিখুন (Director Note) ✍️</h3>
                  <form onSubmit={handleAddNote} className="space-y-4">
                    <div className="form-group text-left">
                      <label className="form-label">শিবলু ভাইয়ের মন্তব্য / নোটিশ</label>
                      <textarea 
                        rows={4}
                        placeholder="মহড়া শেষে অভিনয়ের ইমপ্রুভমেন্ট, পোশাক সজ্জা, আবহ মিউজিক অথবা দৃশ্যভিত্তিক ভুলত্রুটি সংশোধনীর বিবরণ..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-secondary w-full justify-center">
                      <BookOpen size={16} />
                      <span>মন্তব্য পোস্ট করুন</span>
                    </button>
                  </form>
                </div>

                <div className="glass-panel text-left">
                  <h3 className="font-bold text-lg text-white mb-4">পূর্ববর্তী মন্তব্যসমূহ</h3>
                  {notes.length === 0 ? (
                    <p className="text-center py-10 text-gray-500 text-sm">কোনো নির্দেশক ডায়েরি মন্তব্য পোস্ট করা নেই।</p>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((n) => (
                        <div key={n.id} className="p-5 bg-white/5 border border-white/5 rounded-2xl relative space-y-2 hover:border-white/10 transition-all text-left">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] text-[#ff7979] font-bold uppercase tracking-wider">রক্তকরবী মহড়া ডায়েরি</span>
                            <span className="text-[10px] text-gray-400 font-bold">{n.date}</span>
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed pt-2 white-space-pre-wrap">{n.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>



        </div>

      </div>
    </div>
  );
}
