'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ClipboardList, Users, ArrowRight, ShieldCheck, CheckCircle, 
  Calendar, Clock, Volume2, AlertCircle, ArrowLeft, QrCode, Ticket 
} from 'lucide-react';
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

  const fetchData = async () => {
    try {
      const [membersRes, attendanceRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/attendance')
      ]);
      const membersData = await membersRes.json();
      const attendanceData = await attendanceRes.json();

      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(attendanceData)) setAttendance(attendanceData);
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

  // Filter only today's attendance logs
  const todayStr = new Date().toDateString();
  const todaysAttendance = attendance.filter(a => {
    const timeVal = a.check_in_time || (a as any).created_at;
    return timeVal && new Date(timeVal).toDateString() === todayStr;
  });

  const morningAttendance = todaysAttendance.filter(l => (l.session || 'morning') === 'morning');
  const afternoonAttendance = todaysAttendance.filter(l => l.session === 'afternoon');

  return (
    <div className="section-wrapper min-h-screen py-10 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2ecc71]/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3498db]/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="content-container max-w-6xl relative z-10 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="space-y-2 text-left">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={12} />
              <span>ড্যাশবোর্ড পোর্টালে ফিরুন</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ecc71] to-[#3498db] flex items-center justify-center text-white shadow-md">
                <ClipboardList size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">ফ্লোর ম্যানেজার ড্যাশবোর্ড</h1>
                <p className="text-xs text-gray-400">মহড়াকক্ষ হাজিরা ও গেট টিকিট পাস ভেরিফিকেশন প্যানেল</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Calendar size={13} className="text-[#2ecc71]" />
              <span>আজকের তারিখ: {new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Core Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Quick Check-in (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel text-left">
              <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#2ecc71]/10 border border-[#2ecc71]/20 flex items-center justify-center text-[#2ecc71]">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">কুশীলব কুইক চেক-ইন</h3>
                  <p className="text-[10px] text-gray-400">ম্যানুয়ালি যেকোনো কুশীলবের হাজিরা এন্ট্রি করুন</p>
                </div>
              </div>

              <form onSubmit={handleQuickCheckIn} className="space-y-5">
                <div className="form-group mb-0">
                  <label className="form-label text-[10px] font-bold text-gray-300">কুশীলবের নাম সিলেক্ট করুন</label>
                  <select 
                    value={selectedMemberId}
                    onChange={e => setSelectedMemberId(e.target.value)}
                    className="form-input text-xs bg-zinc-950 text-gray-300 outline-none w-full border border-white/10 rounded-xl p-3"
                    required
                  >
                    <option value="" disabled>কুশীলবের নাম...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>[{m.roll}] {m.name} ({m.role})</option>
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

            <div className="glass-panel p-5 bg-gradient-to-br from-[#2ecc71]/5 to-transparent border-white/5 space-y-3 text-left">
              <h4 className="font-bold text-xs text-[#2ecc71] uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={13} /> হাজিরা সেশন নির্দেশিকা
              </h4>
              <ul className="text-[10px] text-gray-400 space-y-2 list-disc pl-4 leading-relaxed">
                <li>দুপুর **১:৩০-এর আগে** হাজিরা দিলে সেটি স্বয়ংক্রিয়ভাবে **সকালের প্রথম সেশন** হিসেবে এন্ট্রি হবে।</li>
                <li>দুপুর **১:৩০ বা তারপরে** হাজিরা দিলে সেটি **লাঞ্চ পরবর্তী সেশন** হিসেবে সেভ হবে।</li>
                <li>কোনো কুশীলব একই সেশনে দিনে একবারের বেশি হাজিরা এন্ট্রি করতে পারবেন না।</li>
              </ul>
            </div>
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
                    <p className="text-[9px] text-gray-500 mt-2">টিকিট প্রিন্টআউট বা মোবাইলে থাকা ইউনিক আইডি দিয়ে চেক করুন।</p>
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

        {/* BOTTOM SECTION: Split Morning & Afternoon Live Updates */}
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

      </div>
    </div>
  );
}