'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Award, 
  LogOut, 
  KeyRound, 
  CheckCircle, 
  AlertCircle,
  Timer,
  User,
  Activity,
  ChevronRight,
  Lock,
  Coins,
  Smile,
  Zap,
  Volume2,
  Bell,
  MessageSquare,
  Sparkle
} from 'lucide-react';

interface Member {
  id: string;
  roll: string;
  name: string;
  role: string;
  character_name: string;
  avatar_url?: string;
  production_fee_paid?: number;
  snacks_fee_paid?: number;
}

interface Rehearsal {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  required_cast: string;
}

interface RehearsalNote {
  id: string;
  date: string;
  content: string;
}

interface AttendanceLog {
  id: string;
  member_id: string;
  check_in_time: string;
  is_late: boolean;
  status: string;
}

export default function ActorDashboard() {
  const [member, setMember] = useState<Member | null>(null);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [notes, setNotes] = useState<RehearsalNote[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notices' | 'schedule' | 'attendance' | 'finance' | 'settings'>('notices');

  // Change Password state
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      // 1. Fetch Session
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      if (!sessionRes.ok || !sessionData.authenticated) {
        router.push('/login');
        return;
      }
      
      setMember(sessionData.member);
      const activeMemberId = sessionData.member.id;

      // 2. Fetch Rehearsals, Notes, and Attendance concurrently
      const [rehearsalsRes, notesRes, attendanceRes] = await Promise.all([
        fetch('/api/rehearsals'),
        fetch('/api/rehearsal-notes'),
        fetch('/api/attendance')
      ]);

      const rehearsalsData = await rehearsalsRes.json();
      const notesData = await notesRes.json();
      const attendanceData = await attendanceRes.json();

      if (Array.isArray(rehearsalsData)) setRehearsals(rehearsalsData);
      if (Array.isArray(notesData)) setNotes(notesData);
      if (Array.isArray(attendanceData)) {
        // Filter attendance for the logged-in member
        const myLogs = attendanceData.filter((log: any) => log.member_id === activeMemberId);
        setAttendance(myLogs);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 4) {
      setPasswordStatus({ type: 'error', message: 'পাসওয়ার্ডটি অন্তত ৪ অক্ষরের হতে হবে।' });
      return;
    }

    setPasswordLoading(true);
    setPasswordStatus(null);

    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছে।');
      }

      setPasswordStatus({ type: 'success', message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
      setNewPassword('');
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#e056fd]/30 border-t-[#e056fd] animate-spin"></div>
        <p className="text-sm font-semibold text-gray-400">ড্যাশবোর্ড লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!member) return null;

  // 1. Personalized Rehearsals Filter (where required_cast contains character name or is "সবাই" / "All")
  const myCharacter = member.character_name || '';
  const myRehearsals = rehearsals.filter(r => {
    const cast = r.required_cast || '';
    return (
      cast.toLowerCase().includes(myCharacter.toLowerCase()) || 
      cast.includes('সবাই') || 
      cast.includes('কলাকুশলী') ||
      cast.toLowerCase().includes('all')
    );
  });

  // Sort rehearsals by date (upcoming first)
  const upcomingRehearsals = [...myRehearsals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextRehearsal = upcomingRehearsals.find(r => new Date(r.date + 'T23:59:59').getTime() >= new Date().getTime());

  // 2. Filter High-Priority Mentioned Notices
  const characterMentionedNotes = notes.filter(n => 
    n.content.includes(myCharacter) || 
    n.content.includes(member.name)
  );

  // 3. Attendance Statistics
  const totalRehearsalLogs = attendance.length;
  const presentCount = attendance.filter(log => log.status === 'present').length;
  const lateCount = attendance.filter(log => log.status === 'late').length;
  const absentCount = attendance.filter(log => log.status === 'absent').length;
  const attendanceRate = totalRehearsalLogs > 0 
    ? Math.round(((presentCount + lateCount) / totalRehearsalLogs) * 100) 
    : 100;

  // Dynamic Badges
  const badges = [];
  if (attendanceRate >= 90 && totalRehearsalLogs >= 3) {
    badges.push({ name: 'নান্দনিক নিয়মিত', desc: '৯০% এর বেশি উপস্থিতি হার', color: 'from-[#22a6b3] to-[#00d2d3]' });
  }
  if (lateCount === 0 && totalRehearsalLogs >= 3) {
    badges.push({ name: 'সময়ানুবর্তী কুশীলব', desc: 'কোনো লেট চেক-ইন নেই', color: 'from-[#e056fd] to-[#be2edd]' });
  }
  if (totalRehearsalLogs >= 5) {
    badges.push({ name: 'মঞ্চের প্রাণ', desc: '৫টির বেশি মহড়ায় অংশগ্রহণ', color: 'from-[#ff7979] to-[#ff4757]' });
  }
  return (
    <div className="w-full min-h-screen bg-[#080d12] pb-32">
      <div className="max-w-md mx-auto px-4 pt-8 flex flex-col gap-6 text-left">
        
        {/* -------------------------------------------------------------
           ACTOR PROFILE BANNER (Slate-800 Card Layout)
           ------------------------------------------------------------- */}
        <section className="p-6 bg-[#1e293b] border border-[#475569] rounded-2xl flex flex-row items-center justify-between gap-3 text-left w-full shadow-xl shadow-black/40">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {member.avatar_url ? (
              <img 
                src={member.avatar_url} 
                alt={member.name}
                className="w-14 h-14 rounded-full border-2 border-amber-500/80 object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#c85122] to-[#e59f5b] flex items-center justify-center text-white text-lg font-black border-2 border-amber-500/80 shrink-0">
                {member.name.substring(0, 1)}
              </div>
            )}
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-sm sm:text-base font-black text-white truncate">{member.name}</h1>
              <p className="text-[10px] text-gray-400 font-semibold leading-none truncate">
                রোল: <span className="font-mono text-gray-200">{member.roll}</span>
              </p>
              <p className="text-[11px] font-black text-amber-500 leading-none truncate mt-0.5">
                {member.character_name || 'নেপথ্য'} ({member.role})
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 border border-white/15 transition-all cursor-pointer shrink-0"
          >
            <LogOut size={12} className="text-gray-400" />
            <span>Log Out</span>
          </button>
        </section>

        {/* -------------------------------------------------------------
           METRICS BAR (Sleek Circle Progress Stats - Slate-800 Layout)
           ------------------------------------------------------------- */}
        <section className="grid grid-cols-4 gap-2 bg-[#1e293b] border border-[#475569] rounded-2xl p-5 shadow-xl shadow-black/30">
          {/* Metric 1 */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-13 h-13 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-emerald-500/5 shadow-md shadow-emerald-500/10">
              <span className="text-[10px] font-black text-emerald-400">{attendanceRate}%</span>
            </div>
            <span className="text-[9px] text-gray-300 font-bold tracking-tight">উপস্থিতি</span>
          </div>
          {/* Metric 2 */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-13 h-13 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5 shadow-md">
              <span className="text-[10px] font-black text-white">{totalRehearsalLogs} দিন</span>
            </div>
            <span className="text-[9px] text-gray-300 font-bold tracking-tight">Work Days</span>
          </div>
          {/* Metric 3 */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-13 h-13 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5 shadow-md">
              <span className="text-[10px] font-black text-white">{presentCount}/{lateCount}</span>
            </div>
            <span className="text-[9px] text-gray-300 font-bold tracking-tight">Completed</span>
          </div>
          {/* Metric 4 */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-13 h-13 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/5 shadow-md">
              <span className="text-[10px] font-black text-white">{absentCount}</span>
            </div>
            <span className="text-[9px] text-gray-300 font-bold tracking-tight">Other Stats</span>
          </div>
        </section>

        {/* -------------------------------------------------------------
           URGENT TASKS (জরুরি কাজ - Slate-800 Spaced Cards)
           ------------------------------------------------------------- */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-black text-amber-500 flex items-center gap-1.5 px-0.5 tracking-wider uppercase">
            <Sparkle size={12} className="text-amber-500 animate-pulse" />
            <span>জরুরি কাজ</span>
          </h2>
          
          <div className="flex flex-col gap-3.5">
            {/* Task 1 */}
            <div className="p-4 bg-[#1e293b] border border-[#475569] rounded-2xl flex items-center gap-4 text-left shadow-xl shadow-black/20">
              <span className="text-xs font-black text-amber-500 font-mono w-4">1</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Zap size={16} className="text-amber-500" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">ল্যাব পর্দা ফিট</h4>
                <p className="text-[10px] sm:text-xs text-gray-300 font-medium leading-relaxed">ল্যাব-এর পেছনের কালো পর্দা ফিট করে দেবেন।</p>
              </div>
            </div>

            {/* Task 2 */}
            <div className="p-4 bg-[#1e293b] border border-[#475569] rounded-2xl flex items-center gap-4 text-left shadow-xl shadow-black/20">
              <span className="text-xs font-black text-amber-500 font-mono w-4">2</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Smile size={16} className="text-amber-500" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">রক্তকরবী ফুল সজীব করা</h4>
                <p className="text-[10px] sm:text-xs text-gray-300 font-medium leading-relaxed">নন্দিনীর রক্তকরবী ফুলগুলো সজীব দেখানোর জন্য কালার করা।</p>
              </div>
            </div>

            {/* Task 3 */}
            <div className="p-4 bg-[#1e293b] border border-[#475569] rounded-2xl flex items-center gap-4 text-left shadow-xl shadow-black/20">
              <span className="text-xs font-black text-amber-500 font-mono w-4">3</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Volume2 size={16} className="text-amber-500" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">বিশু পাগলের লাইটিং ফোকাস</h4>
                <p className="text-[10px] sm:text-xs text-gray-300 font-medium leading-relaxed">বিশু পাগলের প্রবেশ দৃশ্যে আলোর ফোকাস উন্নত করা।</p>
              </div>
            </div>

            {/* Task 4 */}
            <div className="p-4 bg-[#1e293b] border border-[#475569] rounded-2xl flex items-center gap-4 text-left shadow-xl shadow-black/20">
              <span className="text-xs font-black text-amber-500 font-mono w-4">4</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <MessageSquare size={16} className="text-amber-500" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">সংলাপ ভুল সংশোধন</h4>
                <p className="text-[10px] sm:text-xs text-gray-300 font-medium leading-relaxed">চন্দ্রা এবং ফাগুলালের সংলাপ ভুল সংশোধন।</p>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
           TAB NAVIGATION (Minimal Segmented Control Group - Slate-800 layout)
           ------------------------------------------------------------- */}
        <div className="flex bg-[#1e293b] p-1.5 rounded-2xl gap-1.5 w-full border border-[#475569] shadow-xl">
          {[
            { id: 'notices', name: 'নোটিশ' },
            { id: 'schedule', name: 'শিডিউল' },
            { id: 'attendance', name: 'হাজিরা' },
            { id: 'finance', name: 'ফিস' },
            { id: 'settings', name: 'সেটিংস' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 border border-amber-500 shadow-md shadow-amber-500/25' 
                    : 'text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* -------------------------------------------------------------
           TAB CONTENT (Beautiful spacious layout with distinct cards)
           ------------------------------------------------------------- */}
        <main className="min-h-[25vh] flex flex-col gap-4 pt-2">
          
          {/* 1. NOTICES TAB */}
          {activeTab === 'notices' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-black text-amber-500 flex items-center gap-1.5 px-0.5 tracking-wider uppercase">
                <Bell size={12} className="text-amber-500 animate-pulse" />
                <span>নোটিশ বোর্ড</span>
              </h2>
              {notes.length === 0 ? (
                <div className="p-10 text-center text-gray-500 text-xs border border-[#475569] rounded-2xl bg-[#1e293b]">
                  আপাতত কোনো সাধারণ নোটিশ জারি করা হয়নি।
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {notes.slice(0, 2).map((note, idx) => {
                    const isMentioned = note.content.includes(myCharacter) || note.content.includes(member.name);
                    
                    // Extract day and month name to generate header like "৫ জুলাই ডাক"
                    const dayMatch = note.date.match(/\d+\s+[ক-য়]+/);
                    const noticeTitle = isMentioned
                      ? (dayMatch ? `${dayMatch[0]} ডাক` : "জরুরি ডাক")
                      : "সাধারণ নোটিশ";

                    return (
                      <div 
                        key={note.id} 
                        className="p-5 bg-[#1e293b] border border-[#475569] rounded-2xl flex gap-3.5 text-left items-start shadow-xl shadow-black/25"
                      >
                        <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Volume2 size={16} className="text-amber-500" />
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 text-[11px] font-bold">
                            <span className="text-white font-black">{noticeTitle}</span>
                            {isMentioned && (
                              <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                @ আপনাকে মেনশন করা হয়েছে
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed font-semibold">{note.content}</p>
                          <span className="text-[9px] text-gray-500 font-bold block">{note.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        {/* 2. SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {myRehearsals.length === 0 ? (
              <div className="glass-panel p-12 text-center text-gray-500 text-sm">
                আপনার কোনো মহড়া শিডিউল নির্ধারিত নেই।
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRehearsals.map((r) => (
                  <div key={r.id} className="glass-panel p-5 bg-opacity-20 text-left space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-base">{r.title}</h4>
                      {r.description && <p className="text-xs text-gray-400 font-medium line-clamp-2">{r.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-gray-300">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                        <Calendar size={14} className="text-[#ff7979]" />
                        <span>{r.date}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                        <Clock size={14} className="text-[#e056fd]" />
                        <span>{r.time}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[10px] font-bold text-gray-400">
                      দৃশ্যভিত্তিক কাস্ট: <span className="text-white font-semibold">{r.required_cast}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. ATTENDANCE & BADGES TAB */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Badges Column */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-sm font-bold text-white text-left uppercase tracking-wider">রবীন্দ্র ব্যাজ ও অর্জন (Badges)</h4>
              
              {badges.length === 0 ? (
                <div className="glass-panel p-8 text-center text-gray-500 text-xs">
                  অন্তত ৩ দিন মহড়ার হাজিরা সম্পন্ন হলে অর্জিত ব্যাজ এখানে প্রদর্শিত হবে।
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {badges.map((badge, idx) => (
                    <div key={idx} className="glass-panel p-4 bg-opacity-30 text-left flex items-center gap-4 border-l-4 border-l-[#e056fd]">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shrink-0`}>
                        <Award size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-white text-sm">{badge.name}</h5>
                        <p className="text-[10px] text-gray-400 font-medium">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attendance Logs Column */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-bold text-white text-left uppercase tracking-wider">হাজিরা ইতিহাস (Check-in Logs)</h4>
              
              {attendance.length === 0 ? (
                <div className="glass-panel p-12 text-center text-gray-500 text-sm">
                  আপনার কোনো মহড়ার হাজিরা রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                <div className="glass-panel overflow-hidden border-white/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-semibold text-gray-300">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5 text-gray-400">
                          <th className="p-4">চেক-ইন সময়</th>
                          <th className="p-4">লেট কাউন্ট?</th>
                          <th className="p-4">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((log) => (
                          <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4 flex items-center gap-2 font-mono">
                              <Activity size={12} className="text-gray-500" />
                              <span>{new Date(log.check_in_time).toLocaleString('bn-BD', { hour12: true })}</span>
                            </td>
                            <td className="p-4">
                              {log.is_late ? (
                                <span className="text-[#ff7979]">হ্যাঁ (লেট)</span>
                              ) : (
                                <span className="text-green-400">না</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'present' ? 'bg-green-500/10 text-green-400' : log.status === 'late' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-[#ff7979]'}`}>
                                {log.status === 'present' ? 'উপস্থিত' : log.status === 'late' ? 'বিলম্বিত' : 'অনুপস্থিত'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 4. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-md mx-auto">
            <div className="glass-panel p-6 bg-opacity-30 space-y-6 text-left">
              
              <div className="space-y-1.5 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <KeyRound size={16} className="text-[#e056fd]" />
                  <span>পাসওয়ার্ড পরিবর্তন করুন</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">নিরাপত্তার স্বার্থে প্রাথমিক ডিফল্ট পাসওয়ার্ড পরিবর্তন করুন।</p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordStatus && (
                  <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5 ${passwordStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {passwordStatus.type === 'success' ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
                    <span>{passwordStatus.message}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">নতুন পাসওয়ার্ড</label>
                  <input
                    type="password"
                    placeholder="পাসওয়ার্ড লিখুন..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e056fd] transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary w-full justify-center py-3 mt-4"
                >
                  <span>{passwordLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}</span>
                </button>
              </form>

            </div>
          </div>
        )}

        {/* 5. FINANCE TAB */}
        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Section 1: Production Fee */}
            <div className="glass-panel p-6 bg-gradient-to-br from-[#ff7979]/5 to-transparent border-white/5 space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff7979]/5 rounded-full filter blur-[30px] pointer-events-none"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff7979]/10 border border-[#ff7979]/20 flex items-center justify-center text-[#ff7979]">
                  <Coins size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">প্রোডাকশন ফি (Production Fee)</h4>
                  <p className="text-[10px] text-gray-400">নাটক প্রযোজনা ও আনুষঙ্গিক ফিস</p>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">পরিশোধিত পরিমাণ (Paid Amount)</span>
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                  <span className="text-xs text-gray-400 font-normal">৳</span>
                  <span>{member.production_fee_paid || 0}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                * প্রোডাকশন ফি এর যাবতীয় খরচ নাটক মঞ্চায়নের আনুষঙ্গিক সরঞ্জাম ও সেট নির্মাণে ব্যবহৃত হয়। কোনো গরমিল থাকলে নির্দেশকের সাথে যোগাযোগ করুন।
              </p>
            </div>

            {/* Section 2: Snacks Money */}
            <div className="glass-panel p-6 bg-gradient-to-br from-[#e056fd]/5 to-transparent border-white/5 space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e056fd]/5 rounded-full filter blur-[30px] pointer-events-none"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e056fd]/10 border border-[#e056fd]/20 flex items-center justify-center text-[#e056fd]">
                  <Coins size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">নাস্তার টাকা (Snacks Money)</h4>
                  <p className="text-[10px] text-gray-400">মহড়াকালীন নাস্তা ও ক্যাটারিং ফিস</p>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">পরিশোধিত পরিমাণ (Paid Amount)</span>
                <div className="text-3xl font-black text-white flex items-baseline gap-1">
                  <span className="text-xs text-gray-400 font-normal">৳</span>
                  <span>{member.snacks_fee_paid || 0}</span>
                </div>
              </div>
              
              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                * মহড়া সেশনের দৈনিক নাস্তা ও আপ্যায়ন খরচের জন্য এই ফিস সংগৃহীত হয়। কোনো গরমিল থাকলে নির্দেশকের সাথে যোগাযোগ করুন।
              </p>
            </div>

          </div>
        )}

      </main>

      {/* -------------------------------------------------------------
         UPCOMING NEXT REHEARSAL WIDGET (Mockup Layout - Bottom)
         ------------------------------------------------------------- */}
      {nextRehearsal && (
        <section className="p-5.5 bg-[#1b232c] border border-[#334454] rounded-2xl text-left space-y-4 relative overflow-hidden shadow-xl shadow-black/30">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
            <Clock size={12} />
            <span>পরবর্তী মহড়া (NEXT REHEARSAL)</span>
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-3xl font-black text-white font-mono tracking-wide">
              {nextRehearsal.date}
            </h2>
            <h3 className="text-sm font-bold text-white">
              {nextRehearsal.title}
            </h3>
            <p className="text-xs text-gray-400">
              দৃশ্যভিত্তিক কাস্ট: <span className="text-gray-300 font-semibold">{nextRehearsal.required_cast}</span>
            </p>
          </div>
          
          <div className="border-t border-[#334454] pt-3.5 flex justify-between items-center text-[10px] text-gray-500 font-bold">
            <span>সময়: {nextRehearsal.time}</span>
            <span className="text-amber-500">আসন্ন</span>
          </div>
        </section>
      )}

      </div>
    </div>
  );
}
