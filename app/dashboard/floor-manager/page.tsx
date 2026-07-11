'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, Users, ArrowRight, ShieldCheck, CheckCircle, 
  Calendar, Clock, Volume2, AlertCircle, ArrowLeft, QrCode, Ticket, Settings, RefreshCw,
  Download, Award
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { Member, Attendance } from '@/lib/db';

interface TicketVerifyResponse {
  success: boolean;
  message?: string;
  ticket?: {
    id: string;
    name: string;
    phone: string;
    seats: number;
    is_verified: boolean;
  };
}

export default function FloorManagerDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  
  // Ticket scanner state
  const [scannerTickId, setScannerTickId] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [verifyStatusMessage, setVerifyStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Leaderboard & Attendance Sheet Tab States
  const [activeTab, setActiveTab] = useState<'live' | 'logs' | 'leaderboard'>('live');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [sheetDate, setSheetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceView, setAttendanceView] = useState<'tabular' | 'morning' | 'afternoon'>('tabular');
  const attendanceSheetRef = useRef<HTMLDivElement>(null);

  const downloadAsPng = async () => {
    if (!attendanceSheetRef.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(attendanceSheetRef.current, {
        backgroundColor: '#09090b', // Match zinc-950 background of panel
        style: {
          borderRadius: '0px'
        }
      });
      const link = document.createElement('a');
      link.download = `দৈনিক_হাজিরা_শিট_${sheetDate}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error downloading PNG:', e);
      alert('ইমেজ ডাউনলোড করতে ব্যর্থ হয়েছে।');
    }
  };

  // Dynamic Settings states
  const [morningCutoff, setMorningCutoff] = useState('11:30');
  const [afternoonCutoff, setAfternoonCutoff] = useState('15:00');
  const [sessionTransition, setSessionTransition] = useState('13:30');
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchData = async () => {
    try {
      const [membersRes, attendanceRes, settingsRes, leaderboardRes] = await Promise.all([
        fetch('/api/members', { cache: 'no-store' }),
        fetch('/api/attendance', { cache: 'no-store' }),
        fetch('/api/settings', { cache: 'no-store' }),
        fetch('/api/leaderboard', { cache: 'no-store' })
      ]);
      const membersData = await membersRes.json();
      const attendanceData = await attendanceRes.json();
      const settingsData = await settingsRes.json();
      const leaderboardData = await leaderboardRes.json();

      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(attendanceData)) setAttendance(attendanceData);
      if (Array.isArray(leaderboardData)) setLeaderboard(leaderboardData);
      if (settingsData) {
        if (settingsData.morning_cutoff) setMorningCutoff(settingsData.morning_cutoff);
        if (settingsData.afternoon_cutoff) setAfternoonCutoff(settingsData.afternoon_cutoff);
        if (settingsData.session_transition) setSessionTransition(settingsData.session_transition);
      }
    } catch (e) {
      console.error('Error loading floor manager data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio chime failed:', e);
    }
  };

  const playErrorBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3 low beep
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error('Error beep failed:', e);
    }
  };

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
      
      setSelectedMemberId('');
      fetchData();
      playChime();
      alert(`${member.name}-এর হাজিরা সফলভাবে এন্ট্রি হয়েছে!`);
    } catch (err: any) {
      playErrorBeep();
      alert(err.message || 'চেক-ইন প্রসেস করা যায়নি।');
    } finally {
      setIsSubmitting(false);
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
        alert('হাজিরা সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!');
        setIsEditingSettings(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'সেটিংস সেভ করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('একটি নেটওয়ার্ক ত্রুটি ঘটেছে।');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleVerifyTicket = async (ticketId: string) => {
    if (!ticketId || !ticketId.trim()) return;
    setIsSubmitting(true);
    setVerifyStatusMessage(null);

    try {
      const res = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticketId.trim() }),
      });

      const data: TicketVerifyResponse = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'টিকিট যাচাই করতে ব্যর্থ হয়েছে।');
      }

      setVerifyStatusMessage({
        type: 'success',
        text: `টিকিট সফলভাবে ভেরিফাই হয়েছে! নাম: ${data.ticket?.name}, আসন সংখ্যা: ${data.ticket?.seats}টি`,
      });
      playChime();
      setScannerTickId('');
    } catch (error: any) {
      playErrorBeep();
      setVerifyStatusMessage({
        type: 'error',
        text: error.message || 'টিকিটটি ভেরিফাই করা যায়নি বা এটি ইতিমধ্যে ব্যবহৃত হয়েছে।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toDateString();
  const todaysAttendance = attendance.filter(a => {
    const timeVal = a.check_in_time || (a as any).created_at;
    return timeVal && new Date(timeVal).toDateString() === todayStr;
  });

  const morningAttendance = todaysAttendance.filter(l => (l.session || 'morning') === 'morning');
  const afternoonAttendance = todaysAttendance.filter(l => l.session === 'afternoon');

  // Tabular / Daily attendance sheet filtering & calculations
  const selectedDateStr = new Date(sheetDate).toDateString();
  const selectedDateLogs = attendance.filter(log => {
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
    <div className="section-wrapper min-h-screen py-10 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2ecc71]/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3498db]/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="content-container max-w-6xl relative z-10 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-white/5 pb-6">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">প্যানেল নির্বাচন</Link>
              <span className="text-xs text-gray-600">/</span>
              <span className="text-xs text-[#2ecc71] font-bold">ফ্লোর ম্যানেজার</span>
            </div>
            <h2 className="text-3xl font-black text-white">রক্তকরবী ফ্লোর ম্যানেজার ড্যাশবোর্ড 📋</h2>
            <p className="text-sm text-gray-400">মহড়াকক্ষ হাজিরা ও গেট টিকিট ভেরিফিকেশন প্যানেল</p>
          </div>

          <button 
            onClick={fetchData} 
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Workspace Dual Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
          
          {/* LEFT COLUMN: Quick Check-in Form (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel text-left">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2ecc71]/10 border border-[#2ecc71]/20 flex items-center justify-center text-[#2ecc71]">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">কুশীলব কুইক চেক-ইন</h3>
                  <p className="text-[10px] text-gray-400">ম্যানুয়ালি হাজিরা এন্ট্রি দিন</p>
                </div>
              </div>

              <form onSubmit={handleQuickCheckIn} className="space-y-6">
                <div className="form-group mb-0">
                  <label className="form-label text-[10px] font-bold text-gray-300">কুশীলব নির্বাচন করুন (Select Member)</label>
                  <select 
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    className="form-input py-3 text-xs w-full bg-zinc-950 border border-white/10 rounded-xl px-3 text-gray-300 appearance-none cursor-pointer"
                  >
                    <option value="">কুশীলবের নাম সিলেক্ট করুন...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (রোল: {m.roll}) - {m.character_name || 'নেপথ্য'}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !selectedMemberId} 
                  className="w-full justify-center py-3.5 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-[#2ecc71] to-[#3498db] hover:opacity-95 shadow-md shadow-[#2ecc71]/10 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed border-0"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>চেক-ইন এন্ট্রি দিন</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Dynamic Attendance Session Guidelines & Inline settings editor */}
            {!isEditingSettings ? (
              <div className="glass-panel p-5 bg-gradient-to-br from-[#2ecc71]/5 to-transparent border-white/5 space-y-3 text-left relative group">
                <button 
                  onClick={() => setIsEditingSettings(true)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer border-0"
                  title="সেটিংস সম্পাদনা করুন"
                  type="button"
                >
                  <Settings size={14} />
                </button>
                
                <h4 className="font-bold text-xs text-[#2ecc71] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle size={13} /> হাজিরা সেশন নির্দেশিকা
                </h4>
                <ul className="text-[10px] text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
                  <li>দুপুর <strong className="font-bold text-white">{sessionTransition}</strong>-এর আগে হাজিরা দিলে সেটি স্বয়ংক্রিয়ভাবে <strong className="font-bold text-[#2ecc71]">সকালের প্রথম সেশন</strong> হিসেবে এন্ট্রি হবে।</li>
                  <li>দুপুর <strong className="font-bold text-white">{sessionTransition}</strong> বা তারপরে হাজিরা দিলে সেটি <strong className="font-bold text-[#3498db]">লাঞ্চ পরবর্তী সেশন</strong> হিসেবে সেভ হবে।</li>
                  <li>কোনো কুশীলব একই সেশনে দিনে একবারের বেশি হাজিরা এন্ট্রি করতে পারবেন না।</li>
                  <li>সকালের লেট কাট-অফ: <strong className="font-bold text-white">{morningCutoff} AM</strong> | দুপুরের লেট কাট-অফ: <strong className="font-bold text-white">{afternoonCutoff} PM</strong></li>
                </ul>
              </div>
            ) : (
              <div className="glass-panel p-5 border-[#2ecc71]/20 bg-gradient-to-br from-[#2ecc71]/5 to-transparent space-y-4 text-left">
                <h4 className="font-bold text-xs text-[#2ecc71] uppercase tracking-wider flex items-center gap-1.5">
                  <Settings size={13} /> হাজিরা সেশন সেটিংস ⚙️
                </h4>
                
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="space-y-3">
                    <div className="form-group mb-0">
                      <label className="form-label text-[9px] font-bold text-gray-300">সেশন পরিবর্তন সময়সীমা (Transition Time)</label>
                      <input 
                        type="time" 
                        value={sessionTransition}
                        onChange={e => setSessionTransition(e.target.value)}
                        className="form-input py-2 text-xs w-full bg-zinc-950 border border-white/10 rounded-xl px-3 text-gray-300"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="form-group mb-0">
                        <label className="form-label text-[9px] font-bold text-gray-300">সকাল লেট কাট-অফ</label>
                        <input 
                          type="time" 
                          value={morningCutoff}
                          onChange={e => setMorningCutoff(e.target.value)}
                          className="form-input py-2 text-xs w-full bg-zinc-950 border border-white/10 rounded-xl px-3 text-gray-300"
                          required
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="form-label text-[9px] font-bold text-gray-300">দুপুর লেট কাট-অফ</label>
                        <input 
                          type="time" 
                          value={afternoonCutoff}
                          onChange={e => setAfternoonCutoff(e.target.value)}
                          className="form-input py-2 text-xs w-full bg-zinc-950 border border-white/10 rounded-xl px-3 text-gray-300"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      disabled={isSavingSettings}
                      className="btn-primary py-2 px-4 text-[10px] bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-lg cursor-pointer border-0"
                    >
                      {isSavingSettings ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditingSettings(false)}
                      className="btn-glass py-2 px-4 text-[10px] border-white/10 hover:bg-white/5 text-gray-400 rounded-lg cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Ticket Verification (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel text-left">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#3498db]/10 border border-[#3498db]/20 flex items-center justify-center text-[#3498db]">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">গেট টিকিট পাস ভেরিফাই</h3>
                  <p className="text-[10px] text-gray-400">দর্শকদের এন্ট্রি টিকিট যাচাই করুন</p>
                </div>
              </div>

              {verifyStatusMessage && (
                <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border ${verifyStatusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/25 text-green-400' : 'bg-red-500/10 border-red-500/25 text-red-400'}`}>
                  <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  <span className="text-xs font-semibold leading-relaxed">{verifyStatusMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="form-group mb-0">
                    <label className="form-label text-[10px] font-bold text-gray-300">টিকিট আইডি (Ticket ID)</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="উদা: t_xxxxxxxxx" 
                        value={scannerTickId}
                        onChange={e => setScannerTickId(e.target.value)}
                        className="form-input py-2.5 text-xs w-full bg-zinc-950 border border-white/10 rounded-xl px-3"
                      />
                      <button 
                        onClick={() => handleVerifyTicket(scannerTickId)} 
                        disabled={isSubmitting || !scannerTickId.trim()}
                        className="btn-secondary px-6 shrink-0 text-xs rounded-xl"
                      >
                        যাচাই
                      </button>
                    </div>
                  </div>
                </div>

                <div className="glass-panel border-white/5 bg-black/40 p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-4 min-h-[160px]">
                  <QrCode className="text-[#3498db] animate-pulse" size={32} />
                  <div>
                    <h4 className="font-bold text-xs text-white">কিউআর কোড স্ক্যানার সিমুলেটর</h4>
                    <p className="text-[9px] text-gray-400">ক্যামেরা সিমুলেশন স্ক্যানার প্যানেল</p>
                  </div>
                  <button 
                    onClick={() => setIsScannerOpen(!isScannerOpen)} 
                    className="btn-glass text-[10px] py-2 px-4 flex items-center gap-1.5 border-white/10 rounded-xl"
                  >
                    <Volume2 size={12} />
                    <span>{isScannerOpen ? 'সিমুলেটর বন্ধ করুন' : 'সিমুলেটর চালু করুন'}</span>
                  </button>
                </div>
              </div>

              {isScannerOpen && (
                <div className="mt-6 border border-white/10 rounded-2xl overflow-hidden bg-black/80 p-6 flex flex-col items-center justify-center text-center gap-4 relative">
                  <div className="absolute top-4 right-4 text-xs font-bold text-[#2ecc71] flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 bg-[#2ecc71] rounded-full"></span> CAMERA ACTIVE
                  </div>
                  <div className="w-48 h-48 border-2 border-dashed border-[#3498db] rounded-xl flex items-center justify-center relative overflow-hidden bg-zinc-900/60 shadow-inner">
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#3498db] shadow-[0_0_10px_#3498db] animate-bounce"></div>
                    <QrCode className="text-white/20" size={64} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">ক্যামেরা স্ক্যানিং এরিয়া</p>
                    <p className="text-[10px] text-gray-500">স্বেচ্ছাসেবকদের ফিজিক্যাল কিউআর কোড স্ক্যানিং করার জন্য এটি ব্যবহার করা হবে।</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* TABBED PANEL FOR ATTENDANCE & LEADERBOARD */}
        <div className="space-y-6">
          
          {/* Tab Selection Row */}
          <div className="flex border-b border-white/5 overflow-x-auto gap-2">
            <button 
              onClick={() => setActiveTab('live')} 
              className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'live' ? 'border-[#2ecc71] text-[#2ecc71]' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              আজকের লাইভ হাজিরা
            </button>
            <button 
              onClick={() => setActiveTab('logs')} 
              className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'logs' ? 'border-[#2ecc71] text-[#2ecc71]' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              দৈনিক হাজিরা শিট 📋
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')} 
              className={`pb-4 px-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${activeTab === 'leaderboard' ? 'border-[#2ecc71] text-[#2ecc71]' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              সময়নিষ্ঠা লিডারবোর্ড 🏆
            </button>
          </div>

          {/* TAB 1: Live Split Updates */}
          {activeTab === 'live' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Morning Session Table */}
              <div className="glass-panel text-left">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2ecc71]/10 border border-[#2ecc71]/20 flex items-center justify-center text-[#2ecc71]">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">আজকের সকালের হাজিরা ({morningAttendance.length} জন)</h3>
                      <p className="text-[10px] text-gray-400">আজকে সকালের সেশনের রিয়েল-টাইম তালিকা</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={fetchData} 
                    className="btn-glass text-[10px] py-1.5 px-3 rounded-lg border-white/5 flex items-center gap-1"
                  >
                    রিফ্রেশ করুন
                  </button>
                </div>

                {loading ? (
                  <p className="text-center py-10 text-gray-500 text-xs">ডাটা লোড হচ্ছে...</p>
                ) : morningAttendance.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 text-xs">আজকে সকালের সেশনে এখনও কেউ হাজিরা দেননি।</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3">কুশীলব</th>
                          <th className="pb-3 text-center">রোল</th>
                          <th className="pb-3 text-center">সময়</th>
                          <th className="pb-3 text-right">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody>
                        {morningAttendance.map((log) => {
                          const member = members.find(m => m.id === log.member_id);
                          const timeVal = log.check_in_time || (log as any).created_at;
                          const formattedTime = timeVal ? new Date(timeVal).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                          
                          return (
                            <tr key={log.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                              <td className="py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                  <img 
                                    src={member?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                                    alt={member?.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white">{member?.name || 'অজানা কুশীলব'}</h4>
                                  <p className="text-[9px] text-gray-500">{member?.role || 'অভিনয় দল'} • {member?.character_name || 'নেপথ্য'}</p>
                                </div>
                              </td>
                              <td className="py-3 text-center font-mono font-bold">{member?.roll || 'N/A'}</td>
                              <td className="py-3 text-center font-bold text-white">{formattedTime}</td>
                              <td className="py-3 text-right">
                                <span className={`badge ${log.is_late ? 'badge-late' : 'badge-present'} text-[8px] py-0.5 px-2`}>
                                  {log.is_late ? 'বিলম্বিত (Late)' : 'সময়মতো (On Time)'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Afternoon Session Table */}
              <div className="glass-panel text-left">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3498db]/10 border border-[#3498db]/20 flex items-center justify-center text-[#3498db]">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">আজকের দুপুরের হাজিরা ({afternoonAttendance.length} জন)</h3>
                      <p className="text-[10px] text-gray-400">লাঞ্চ পরবর্তী সেশনের রিয়েল-টাইম তালিকা</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={fetchData} 
                    className="btn-glass text-[10px] py-1.5 px-3 rounded-lg border-white/5 flex items-center gap-1"
                  >
                    রিফ্রেশ করুন
                  </button>
                </div>

                {loading ? (
                  <p className="text-center py-10 text-gray-500 text-xs">ডাটা লোড হচ্ছে...</p>
                ) : afternoonAttendance.length === 0 ? (
                  <p className="text-center py-10 text-gray-500 text-xs">আজকে দুপুরের সেশনে এখনও কেউ হাজিরা দেননি।</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3">কুশীলব</th>
                          <th className="pb-3 text-center">রোল</th>
                          <th className="pb-3 text-center">সময়</th>
                          <th className="pb-3 text-right">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody>
                        {afternoonAttendance.map((log) => {
                          const member = members.find(m => m.id === log.member_id);
                          const timeVal = log.check_in_time || (log as any).created_at;
                          const formattedTime = timeVal ? new Date(timeVal).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                          
                          return (
                            <tr key={log.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                              <td className="py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                                  <img 
                                    src={member?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                                    alt={member?.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-white">{member?.name || 'অজানা কুশীলব'}</h4>
                                  <p className="text-[9px] text-gray-500">{member?.role || 'অভিনয় দল'} • {member?.character_name || 'নেপথ্য'}</p>
                                </div>
                              </td>
                              <td className="py-3 text-center font-mono font-bold">{member?.roll || 'N/A'}</td>
                              <td className="py-3 text-center font-bold text-white">{formattedTime}</td>
                              <td className="py-3 text-right">
                                <span className={`badge ${log.is_late ? 'badge-late' : 'badge-present'} text-[8px] py-0.5 px-2`}>
                                  {log.is_late ? 'বিলম্বিত (Late)' : 'সময়মতো (On Time)'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Daily Attendance Sheet (Responsive with Date filter & PNG Download) */}
          {activeTab === 'logs' && (
            <div ref={attendanceSheetRef} className="glass-panel space-y-4" style={{ backgroundColor: '#09090b' }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/5 pb-4">
                <div className="text-left">
                  <h3 className="font-bold text-lg text-white">দৈনিক মহড়া হাজিরা শিট 📋</h3>
                  <p className="text-[10px] text-gray-400">সকাল ও দুপুরের সেশনভিত্তিক উপস্থিতি ট্র্যাকিং শিট</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  {/* PNG Download Button */}
                  <button
                    onClick={downloadAsPng}
                    className="btn-glass text-[10px] py-2 px-3 rounded-xl border-white/10 hover:bg-white/5 text-white flex items-center justify-center gap-1.5 cursor-pointer border-0 bg-transparent"
                    title="PNG ইমেজ হিসেবে ডাউনলোড করুন"
                    type="button"
                  >
                    <Download size={12} />
                    <span>পিএনজি ডাউনলোড</span>
                  </button>

                  <input 
                    type="date"
                    value={sheetDate}
                    onChange={e => setSheetDate(e.target.value)}
                    className="form-input text-xs py-2 px-3 bg-zinc-900 !text-white border border-white/10 rounded-xl outline-none"
                  />
                  
                  <div className="flex bg-zinc-900 border border-white/10 rounded-xl overflow-hidden p-0.5 w-full sm:w-auto">
                    <button
                      onClick={() => setAttendanceView('tabular')}
                      className={`flex-1 sm:flex-none text-center px-2 py-2 text-[10px] font-bold rounded-lg transition-all ${attendanceView === 'tabular' ? 'bg-[#2ecc71] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      সমন্বিত শিট
                    </button>
                    <button
                      onClick={() => setAttendanceView('morning')}
                      className={`flex-1 sm:flex-none text-center px-2 py-2 text-[10px] font-bold rounded-lg transition-all ${attendanceView === 'morning' ? 'bg-[#2ecc71] text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      সকাল ({morningLogs.length})
                    </button>
                    <button
                      onClick={() => setAttendanceView('afternoon')}
                      className={`flex-1 sm:flex-none text-center px-2 py-2 text-[10px] font-bold rounded-lg transition-all ${attendanceView === 'afternoon' ? 'bg-[#2ecc71] text-white' : 'text-gray-400 hover:text-white'}`}
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
                <div>
                  {/* Desktop View: Traditional Table Layout */}
                  <div className="hidden md:block overflow-x-auto">
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
                                <span className="text-[10px] text-gray-650 font-semibold uppercase tracking-wider">অনুপস্থিত</span>
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
                                <span className="text-[10px] text-gray-650 font-semibold uppercase tracking-wider">অনুপস্থিত</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile View: List of Cards Layout */}
                  <div className="block md:hidden flex flex-col" style={{ gap: '1.25rem' }}>
                    {tabularData.map((row) => (
                      <div 
                        key={row.member.id} 
                        className="bg-white border border-[#e3dbcc] rounded-2xl shadow-sm text-left overflow-hidden"
                        style={{ padding: '1.25rem' }}
                      >
                        {/* Top: Avatar, Name (No Roll, Role) */}
                        <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e3dbcc] shrink-0 shadow-sm">
                            <img 
                              src={row.member.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                              alt={row.member.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-[#2a1f1a] text-sm truncate">{row.member.name}</h4>
                          </div>
                        </div>

                        {/* Bottom: Shift Attendance Statuses */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e3dbcc]/60">
                          <div className="bg-[#fbf9f4] p-3 rounded-xl border border-[#e3dbcc]/80 flex flex-col justify-center items-center text-center">
                            <span className="text-[10px] text-[#6b5c54] font-bold mb-1">সকাল</span>
                            {row.morning ? (
                              <div className="flex flex-col items-center">
                                <span className="font-mono font-bold text-[#2a1f1a] text-[10px]">
                                  {new Date(row.morning.check_in_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${row.morning.is_late ? 'bg-yellow-50 text-yellow-750 border border-yellow-200' : 'bg-emerald-55 text-emerald-800 border border-emerald-200'}`}>
                                  {row.morning.is_late ? 'বিলম্বিত' : 'সময়মতো'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-3 py-0.5 rounded-full font-extrabold mt-1.5">অনুপস্থিত</span>
                            )}
                          </div>

                          <div className="bg-[#fbf9f4] p-3 rounded-xl border border-[#e3dbcc]/80 flex flex-col justify-center items-center text-center">
                            <span className="text-[10px] text-[#6b5c54] font-bold mb-1">দুপুর</span>
                            {row.afternoon ? (
                              <div className="flex flex-col items-center">
                                <span className="font-mono font-bold text-[#2a1f1a] text-[10px]">
                                  {new Date(row.afternoon.check_in_time).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${row.afternoon.is_late ? 'bg-yellow-55 text-yellow-750 border border-yellow-200' : 'bg-emerald-55 text-emerald-800 border border-emerald-200'}`}>
                                  {row.afternoon.is_late ? 'বিলম্বিত' : 'সময়মতো'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[9px] bg-red-50 text-red-700 border border-red-200 px-3 py-0.5 rounded-full font-extrabold mt-1.5">অনুপস্থিত</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                              src={members.find(m => m.id === log.member_id)?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                              alt={members.find(m => m.id === log.member_id)?.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{members.find(m => m.id === log.member_id)?.name || 'অজ্ঞাত কুশীলব'}</h4>
                            <p className="text-[10px] text-gray-400">রোল: {members.find(m => m.id === log.member_id)?.roll} • ক্যারেক্টার: {members.find(m => m.id === log.member_id)?.character_name || 'নেপথ্য'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`badge ${log.is_late ? 'badge-late' : 'badge-present'} text-[9px] mb-1`}>
                            {log.is_late ? 'লেট চেক-ইন' : 'সময়মতো উপস্থিত'}
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

          {/* TAB 3: Punctuality Leaderboard */}
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
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-[#2ecc71]">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{m.name}</h4>
                            {m.badge && (
                              <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${m.badge.className}`}>
                                <span>{m.badge.icon}</span>
                                <span>{m.badge.text}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">রোল: {m.roll} • ক্যারেক্টার: <span className="text-[#3498db] font-semibold">{m.character_name || 'নাই'}</span></p>
                        </div>
                      </div>

                      {/* 14-Day Heatmap */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
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

                        {/* Punctuality Rate stats */}
                        <div className="flex gap-4 text-right">
                          <div>
                            <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-wider">উপস্থিতি</span>
                            <span className="text-xs font-mono font-bold text-white">{m.present_count} দিন</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-gray-500 font-bold uppercase tracking-wider">সময়নিষ্ঠা</span>
                            <span className="text-xs font-mono font-bold text-[#2ecc71]">{m.punctuality_rate}%</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}