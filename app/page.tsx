'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowRight, Shield, Download, FileText, Music, AlertCircle, Timer, ChevronDown, BookOpen } from 'lucide-react';
import { Member, Rehearsal, RehearsalNote } from '@/lib/db';

export default function HomePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [notes, setNotes] = useState<RehearsalNote[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [nextRehearsal, setNextRehearsal] = useState<Rehearsal | null>(null);
  const [countdownText, setCountdownText] = useState<string>('');
  const [isRehearsalPassed, setIsRehearsalPassed] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);
  const [callTimeCountdown, setCallTimeCountdown] = useState<{
    label: string;
    targetTimeStr: string;
    hours: string;
    minutes: string;
    seconds: string;
    isPassed: boolean;
  }>({ label: 'হিসাব করা হচ্ছে...', targetTimeStr: '', hours: '00', minutes: '00', seconds: '00', isPassed: false });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async () => {
    try {
      const [membersRes, rehearsalsRes, notesRes, leaderboardRes, settingsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/rehearsals'),
        fetch('/api/rehearsal-notes'),
        fetch('/api/leaderboard'),
        fetch('/api/settings')
      ]);

      const membersData = await membersRes.json();
      const rehearsalsData = await rehearsalsRes.json();
      const notesData = await notesRes.json();
      const leaderboardData = await leaderboardRes.json();
      const settingsData = await settingsRes.json();

      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(notesData)) setNotes(notesData.slice(0, 2));
      if (Array.isArray(leaderboardData)) setLeaderboard(leaderboardData);
      if (settingsData) setSettings(settingsData);
      
      if (Array.isArray(rehearsalsData)) {
        setRehearsals(rehearsalsData.slice(0, 3));
        
        // Find next closest upcoming rehearsal
        const now = new Date().getTime();
        const upcoming = rehearsalsData
          .map(r => {
            const reDate = new Date(`${r.date}T${r.time === '১১:৩০' ? '11:30:00' : r.time === '০৩:০০' ? '15:00:00' : r.time + ':00'}`);
            return { ...r, timestamp: reDate.getTime() };
          })
          .filter(r => r.timestamp > now - 7200000) // keep within last 2 hours to allow counting down or just passed
          .sort((a, b) => a.timestamp - b.timestamp)[0];
        
        if (upcoming) {
          setNextRehearsal(upcoming);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching home page data:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Rehearsal Live Countdown Timer Tick Effect
  useEffect(() => {
    if (!nextRehearsal) return;

    const tick = () => {
      const now = new Date().getTime();
      const diff = (nextRehearsal as any).timestamp - now;

      if (diff <= 0) {
        setIsRehearsalPassed(true);
        // If passed by less than 2 hours, show running
        if (diff > -7200000) {
          setCountdownText('মহড়া বর্তমানে শুরু হয়েছে! চেক-ইন দিলে লেট কাউন্ট হতে পারে।');
        } else {
          setCountdownText('মহড়ার সময় অতিবাহিত হয়েছে।');
        }
      } else {
        setIsRehearsalPassed(false);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        
        let timeStr = '';
        if (hours > 0) timeStr += `${hours} ঘণ্টা `;
        timeStr += `${minutes} মিনিট ${seconds} সেকেন্ড`;
        setCountdownText(`মহড়া শুরু হতে ${timeStr} বাকি।`);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [nextRehearsal]);

  // Call Time Live Countdown Tick Effect
  useEffect(() => {
    if (!settings) return;

    const tick = () => {
      const now = new Date();
      const nowMs = now.getTime();

      // Parse morning cutoff (e.g. "11:30")
      const [mH, mM] = settings.morning_cutoff.split(':').map(Number);
      // Parse afternoon cutoff (e.g. "15:00")
      const [aH, aM] = settings.afternoon_cutoff.split(':').map(Number);

      const morningToday = new Date(now);
      morningToday.setHours(mH, mM, 0, 0);

      const afternoonToday = new Date(now);
      afternoonToday.setHours(aH, aM, 0, 0);

      let targetDate = new Date();
      let label = '';
      let targetTimeStr = '';

      if (nowMs < morningToday.getTime()) {
        targetDate = morningToday;
        label = 'আজকের সকালের শিফট কল টাইম';
        targetTimeStr = settings.morning_cutoff;
      } else if (nowMs < afternoonToday.getTime()) {
        targetDate = afternoonToday;
        label = 'আজকের দুপুরের শিফট কল টাইম';
        targetTimeStr = settings.afternoon_cutoff;
      } else {
        const morningTomorrow = new Date(now);
        morningTomorrow.setDate(morningTomorrow.getDate() + 1);
        morningTomorrow.setHours(mH, mM, 0, 0);
        targetDate = morningTomorrow;
        label = 'আগামীকালের সকালের শিফট কল টাইম';
        targetTimeStr = settings.morning_cutoff;
      }

      const diff = targetDate.getTime() - nowMs;
      if (diff <= 0) {
        setCallTimeCountdown({
          label,
          targetTimeStr,
          hours: '00',
          minutes: '00',
          seconds: '00',
          isPassed: true
        });
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        setCallTimeCountdown({
          label,
          targetTimeStr,
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0'),
          isPassed: false
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  const getCastingActor = (charName: string) => {
    return leaderboard.find(m => m.character_name === charName);
  };

  const majorCharacters = [
    { title: 'নন্দিনী (Nandini)', desc: 'যক্ষপুরীর বন্দী খনি শ্রমিকদের মাঝে সৌন্দর্যের প্রতীক ও মুক্তির প্রতীক।' },
    { title: 'রাজা (Raja)', desc: 'যক্ষপুরীর খনির অদৃশ্য মহাশক্তিশালী ও অত্যন্ত জটিল শাসনকর্তা।' },
    { title: 'বিশু পাগল (Bishu Pagol)', desc: 'নন্দিনীর গানের সাথি ও যক্ষপুরীর নিপীড়িত খনি শ্রমিকদের কণ্ঠস্বর।' },
    { title: 'রাজপ্রহরী (Rajprohori)', desc: 'যক্ষপুরীর ক্ষমতা ও শোষণ টিকিয়ে রাখতে নিয়োজিত প্রহরী।' },
    { title: 'রঞ্জন (Ranjan)', desc: 'মুক্তি ও যৌবনের জাগরণের অদৃশ্য নায়ক।' },
    { title: 'চন্দ্রা (Chandra)', desc: 'ফাগুলালের স্ত্রী ও যক্ষপুরীর খেটে খাওয়া নারী শক্তি।' },
    { title: 'ফাগুলাল (Phagulal)', desc: 'খনির শ্রমিকদের অসন্তোষ ও প্রতিবাদের প্রথম কণ্ঠ।' },
    { title: 'অধ্যাপক (Professor)', desc: 'জ্ঞানের অহংকারে অন্ধ রাজার জটিল পরামর্শক।' },
    { title: 'কিশোর (Kishore)', desc: 'নন্দিনীর প্রতি নিঃস্বার্থ ভক্ত ও আত্মত্যাগী বালক।' }
  ];

  const isAllCastingTbd = majorCharacters.every(char => {
    const charNameOnly = char.title.split(' ')[0];
    const actor = getCastingActor(charNameOnly);
    return !actor;
  });


  return (
    <div className="flex-1 space-y-4">
      
      {/* -------------------------------------------------------------
         Hero Section (Banner)
         ------------------------------------------------------------- */}
      <section className="section-wrapper !pt-6 !pb-12 min-h-[65vh] flex items-center justify-center overflow-hidden">

        <div className="content-container hero-layout w-full relative z-10">
          <div className="hero-text-block !gap-0">
            <img 
              src="/banner_52_nobg.jpg" 
              alt="৫২তম আবর্তন নাটক ও নাট্যতত্ত্ব বিভাগ" 
              className="w-full max-w-[420px] h-auto object-contain select-none pointer-events-none -mt-16 -mb-28"
            />
            <h1 className="sr-only">রক্তকরবী</h1>
            <img 
              src="/roktokorobi_title.jpg" 
              alt="রক্তকরবী" 
              className="w-full max-w-[600px] h-auto object-contain select-none pointer-events-none -ml-4 -mt-28 mb-4"
            />
            <p className="hero-subtitle">
              রবীন্দ্রনাথ ঠাকুরের কালজয়ী প্রতীকী নাটক
            </p>
            
            <p className="hero-description">
              যক্ষপুরীর খনিতে মানুষের লোভ, শোষণ এবং বন্দিদশার বিপরীতে নন্দিনীর প্রেম, রক্তকরবী ফুল ও মানবিক মুক্তির লড়াই। মানবাত্মার বন্দিত্ব বনাম স্বাধীনতার অমোঘ সংঘাতকে মূর্ত করে তোলার জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের নাটক ও নাট্যতত্ত্ব বিভাগের বার্ষিক নাট্যোৎসবের এক নান্দনিক প্রযোজনা।
            </p>

            {/* Quick Meta Details */}
            <div className="meta-grid pt-2">
              <div className="glass-panel meta-box">
                <Calendar className="text-amber-600" size={20} />
                <span className="meta-box-label">তারিখ</span>
                <span className="meta-box-value">৩০ জুন ২০২৬</span>
              </div>
              <div className="glass-panel meta-box">
                <Clock className="text-[#e056fd]" size={20} />
                <span className="meta-box-label">সময়</span>
                <span className="meta-box-value">সকাল ১১:৩০</span>
              </div>
              <div className="glass-panel meta-box">
                <MapPin className="text-[#22a6b3]" size={20} />
                <span className="meta-box-label">স্থান</span>
                <span className="meta-box-value truncate max-w-full">ল্যাব-২, জহির রায়হান অডিটোরিয়াম</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6">
              <Link href="/tickets" className="btn-secondary">
                <span>টিকিট বুক করুন</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero Poster Graphic */}
          <div className="flex justify-center w-full">
            <div className="glass-panel w-full max-w-[360px] p-5 bg-opacity-95 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#06060c] via-transparent to-transparent opacity-90 z-10"></div>
              
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-900 shadow-inner">
                <img 
                  src="/roktokorobi_icon.jpg" 
                  alt="রক্তকরবী নাটকের লাল ফুল থিম লোগো" 
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-700"
                />
                
                <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2 text-left">
                  <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">প্রযোজনা</span>
                  <h3 className="text-2xl font-black !text-white leading-tight">রক্তকরবী</h3>
                  <p className="text-[10px] !text-slate-200">নাটক ও নাট্যতত্ত্ব বিভাগ, জাবি</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
         LIVE REHEARSAL COUNTDOWN TIMER WIDGET
         ------------------------------------------------------------- */}
      {nextRehearsal && (
        <section className="content-container px-4 py-2">
          <div className="glass-panel border-l-4 border-l-[#c85122] p-4 text-center hover:transform-none">
            <div className="font-mono text-sm md:text-base font-extrabold text-slate-800 tracking-wide flex items-center justify-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#c85122] animate-pulse shrink-0"></span>
              <span>{countdownText || 'হিসাব করা হচ্ছে...'}</span>
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
         Notice Board (Director Feedback Daily Notes)
         ------------------------------------------------------------- */}
      {notes.length > 0 && (
        <section className="section-wrapper bg-gradient-to-r from-[#ff7979]/5 to-transparent border-y border-slate-200 py-12">
          <div className="content-container">
            <div className="flex items-center gap-3" style={{ marginBottom: '2.25rem' }}>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 border border-red-200">
                <AlertCircle size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-slate-900">নির্দেশক নোটিশ</h3>
                <p className="text-xs text-slate-500">সর্বশেষ মহড়ার ফিডব্যাক ও বিশেষ নোটিশ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map(n => (
                <div 
                  key={n.id} 
                  className="relative bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:transform-none transition-all space-y-4 text-left overflow-hidden"
                  style={{ paddingLeft: '2.5rem', paddingRight: '1.5rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}
                >
                  {/* Floating Crimson Accent Line with rounded ends */}
                  <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-[#851b2e] rounded-r-full"></div>
                  
                  <div className="flex justify-between items-center text-[10px] border-b border-slate-200 pb-2 text-slate-500">
                    <span className="font-bold text-amber-600 uppercase">হালনাগাদ নোটিশ</span>
                    <span>{n.date}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-loose whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

            {/* -------------------------------------------------------------
         Live Call Time Countdown Section (ফ্লোর ম্যানেজার কল টাইম কাউন্টডাউন)
         ------------------------------------------------------------- */}
      <section className="section-wrapper bg-slate-50 border-t border-slate-200 py-16">
        <div className="content-container max-w-4xl text-center space-y-8">
          
          <div className="section-header">
            <h2>⏱️ লাইভ কল টাইম কাউন্টডাউন</h2>
            <p>ফ্লোর ম্যানেজার কর্তৃক নির্ধারিত সকাল ও দুপুরের রিহার্সাল কল টাইমের রিয়েল-টাইম কাউন্টডাউন</p>
            <TraditionalDivider />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Active Schedule panel (Left) */}
            <div 
              className="md:col-span-5 relative bg-gradient-to-br from-[#fbf9f4] to-[#f4f0e6] border border-[#e3dbcc] rounded-2xl shadow-md text-left overflow-hidden"
              style={{ paddingLeft: '2.75rem', paddingRight: '1.5rem', paddingTop: '1.75rem', paddingBottom: '1.75rem' }}
            >
              {/* Floating Crimson Accent Line with rounded ends */}
              <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-[#851b2e] rounded-r-full"></div>
              
              <h4 
                className="font-extrabold text-[#2a1f1a] border-b border-[#e3dbcc] pb-2 flex items-center gap-2"
                style={{ marginBottom: '1.5rem' }}
              >
                <Clock className="text-amber-600 w-4 h-4" />
                <span>সক্রিয় কল টাইম শিডিউল</span>
              </h4>
              
              <div className="flex flex-col">
                <div 
                  className="flex justify-between items-center bg-white/80 rounded-xl border border-[#e3dbcc] shadow-sm"
                  style={{ padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}
                >
                  <span className="text-xs text-[#6b5c54] font-bold">সকালের শিফট:</span>
                  <span className="text-sm font-black text-[#2a1f1a]">{settings?.morning_cutoff || '১১:৩০'} টা (কল টাইম)</span>
                </div>
                <div 
                  className="flex justify-between items-center bg-white/80 rounded-xl border border-[#e3dbcc] shadow-sm"
                  style={{ padding: '1.1rem 1.25rem' }}
                >
                  <span className="text-xs text-[#6b5c54] font-bold">দুপুরের শিফট:</span>
                  <span className="text-sm font-black text-[#2a1f1a]">{settings?.afternoon_cutoff || '১৫:০০'} টা (কল টাইম)</span>
                </div>
              </div>
            </div>

            {/* Countdown Clock (Right) */}
            <div className="md:col-span-7 p-8 bg-gradient-to-br from-[#fbf9f4] to-[#f4f0e6] border border-[#e3dbcc] rounded-2xl shadow-md flex flex-col justify-center items-center space-y-6">
              <div className="space-y-1 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[10px] font-bold text-red-600 border border-red-100 animate-pulse">
                  ● রানিং কাউন্টডাউন
                </span>
                <h4 className="text-sm font-extrabold text-[#2a1f1a] pt-1">{callTimeCountdown.label}</h4>
                <p className="text-xs text-[#6b5c54] font-semibold">টার্গেট টাইম: <span className="text-amber-600 font-bold">{callTimeCountdown.targetTimeStr}</span> টা</p>
              </div>

              {callTimeCountdown.isPassed ? (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-sm font-bold animate-bounce text-center">
                  🚀 কল টাইম অতিক্রান্ত হয়েছে! দ্রুত মহড়া কক্ষে রিপোর্ট করুন।
                </div>
              ) : (
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#2a1f1a] border border-[#3e2e26] rounded-2xl shadow-lg flex items-center justify-center text-3xl md:text-4xl font-extrabold text-[#f59e0b] font-mono tracking-tighter">
                      {callTimeCountdown.hours}
                    </div>
                    <span className="text-[10px] font-bold text-[#6b5c54] mt-2">ঘণ্টা</span>
                  </div>

                  <span className="text-2xl font-black text-slate-400 -mt-6">:</span>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#2a1f1a] border border-[#3e2e26] rounded-2xl shadow-lg flex items-center justify-center text-3xl md:text-4xl font-extrabold text-[#f59e0b] font-mono tracking-tighter">
                      {callTimeCountdown.minutes}
                    </div>
                    <span className="text-[10px] font-bold text-[#6b5c54] mt-2">মিনিট</span>
                  </div>

                  <span className="text-2xl font-black text-slate-400 -mt-6">:</span>

                  {/* Seconds */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#2a1f1a] border border-[#3e2e26] rounded-2xl shadow-lg flex items-center justify-center text-3xl md:text-4xl font-extrabold text-[#f59e0b] font-mono tracking-tighter">
                      {callTimeCountdown.seconds}
                    </div>
                    <span className="text-[10px] font-bold text-[#6b5c54] mt-2">সেকেন্ড</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------------------
         Cast & Crew List Section (কুশীলব ও কলাকুশলী)
         ------------------------------------------------------------- */}
      <section className="section-wrapper bg-slate-50 border-t border-slate-200">
        <div className="content-container">
          <div className="section-header">
            <h2>সম্পূর্ণ কলাকুশলী দল (Class Roster)</h2>
            <p>জাহাঙ্গীরনগর বিশ্ববিদ্যালয় নাটক ও নাট্যতত্ত্ব বিভাগ ৫২তম আবর্তন</p>
            <TraditionalDivider />
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-[#ff7979]/30 border-t-[#ff7979] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid-4-col">
              {members.map((member) => (
                <div key={member.id} className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col items-center text-center group shadow-sm">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-100 group-hover:border-amber-500/50 transition-all duration-300 shadow-md">
                    <img 
                      src={member.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-300"
                    />
                  </div>
                  <span className="badge badge-role text-[8px] mb-2">{member.role}</span>
                  <h4 className="font-bold text-slate-900 text-xs truncate max-w-full">{member.name}</h4>
                  <p className="text-[9px] text-slate-500 mt-1 font-semibold">রোল: {member.roll}</p>
                </div>
              ))}
            </div>
          )}

          {/* Rehearsal backstage teaser */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 mt-12 shadow-sm">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-700 shadow-inner shrink-0">
                <Users size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">মহড়ার গতিবিধি ও হাজিরা ট্র্যাকার</h4>
                <p className="text-xs text-slate-500">সব কলাকুশলীদের হাজিরার লাইভ ডেটা ও পাংচুয়ালিটি লিডারবোর্ড দেখুন নির্দেশক পোর্টালে।</p>
              </div>
            </div>
            <Link href="/dashboard" className="btn-primary text-xs shrink-0">
              <span>লাইভ ড্যাশবোর্ড দেখুন</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
      <path d="M19 17l1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </svg>
  );
}

function TraditionalDivider() {
  return (
    <svg viewBox="0 0 100 10" className="w-full max-w-sm mx-auto my-5 opacity-90 select-none pointer-events-none" fill="none">
      {/* Center lotus/flame element (gold & rust orange) */}
      <path d="M 50 2 C 48 2, 47 4, 50 6 C 53 4, 52 2, 50 2 Z" strokeWidth="0.5" stroke="#e59f5b" fill="#e59f5b" fillOpacity="0.15"/>
      <path d="M 47 4.2 C 45 4.2, 44 6, 47 7 C 50 6, 49 4.2, 47 4.2 Z" strokeWidth="0.4" stroke="#c85122" fill="#c85122" fillOpacity="0.15"/>
      <path d="M 53 4.2 C 55 4.2, 56 6, 53 7 C 50 6, 51 4.2, 53 4.2 Z" strokeWidth="0.4" stroke="#c85122" fill="#c85122" fillOpacity="0.15"/>
      
      {/* Symmetrical traditional wave lines (slate blue) */}
      {/* Left side wave arches */}
      <path d="M 41 5 Q 43 7, 45 5 T 49 5" strokeWidth="0.4" stroke="#22a6b3" strokeLinecap="round"/>
      <path d="M 32 5 Q 34 7, 36 5 T 40 5 T 44 5" strokeWidth="0.4" stroke="#22a6b3" strokeLinecap="round" opacity="0.65"/>
      <path d="M 23 5 Q 25 7, 27 5 T 31 5 T 35 5" strokeWidth="0.4" stroke="#22a6b3" strokeLinecap="round" opacity="0.35"/>
      <path d="M 10 5 L 21 5" strokeWidth="0.2" stroke="#22a6b3" strokeLinecap="round" opacity="0.15"/>
      
      {/* Right side wave arches */}
      <path d="M 59 5 Q 57 7, 55 5 T 51 5" strokeWidth="0.4" stroke="#22a6b3" strokeLinecap="round"/>
      <path d="M 68 5 Q 66 7, 64 5 T 60 5 T 56 5" strokeWidth="0.4" stroke="#22a6b3" strokeLinecap="round" opacity="0.65"/>
      <path d="M 77 5 Q 75 7, 73 5 T 69 5 T 65 5" strokeWidth="0.4" stroke="#22a6b3" strokeLinecap="round" opacity="0.35"/>
      <path d="M 90 5 L 79 5" strokeWidth="0.2" stroke="#22a6b3" strokeLinecap="round" opacity="0.15"/>
    </svg>
  );
}
