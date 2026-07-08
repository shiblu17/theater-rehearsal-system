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
  const [isSynopsisOpen, setIsSynopsisOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = async () => {
    try {
      const [membersRes, rehearsalsRes, notesRes, leaderboardRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/rehearsals'),
        fetch('/api/rehearsal-notes'),
        fetch('/api/leaderboard')
      ]);

      const membersData = await membersRes.json();
      const rehearsalsData = await rehearsalsRes.json();
      const notesData = await notesRes.json();
      const leaderboardData = await leaderboardRes.json();

      if (Array.isArray(membersData)) setMembers(membersData);
      if (Array.isArray(notesData)) setNotes(notesData.slice(0, 2));
      if (Array.isArray(leaderboardData)) setLeaderboard(leaderboardData);
      
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
      <section className="section-wrapper min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e056fd]/10 rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff7979]/10 rounded-full filter blur-[120px] pointer-events-none"></div>

        <div className="content-container hero-layout w-full relative z-10">
          <div className="hero-text-block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#ff7979]">
              <SparklesIcon className="w-3.5 h-3.5 animate-pulse" />
              ৫২তম আবর্তন • নাটক ও নাট্যতত্ত্ব বিভাগ
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              রক্তকরবী
            </h1>
            <p className="hero-subtitle">
              রবীন্দ্রনাথ ঠাকুরের কালজয়ী প্রতীকী নাটক
            </p>
            
            <p className="hero-description">
              যক্ষপুরীর খনিতে মানুষের লোভ, শোষণ এবং বন্দিদশার বিপরীতে নন্দিনীর প্রেম, রক্তকরবী ফুল ও মানবিক মুক্তির লড়াই। মানবাত্মার বন্দিত্ব বনাম স্বাধীনতার অমোঘ সংঘাতকে মূর্ত করে তোলার জাহাঙ্গীরনগর বিশ্ববিদ্যালয়ের নাটক ও নাট্যতত্ত্ব বিভাগের বার্ষিক নাট্যোৎসবের এক নান্দনিক প্রযোজনা।
            </p>

            {/* Quick Meta Details */}
            <div className="meta-grid pt-2">
              <div className="glass-panel meta-box">
                <Calendar className="text-[#ff7979]" size={20} />
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
            <div className="glass-panel w-full max-w-[360px] p-5 bg-opacity-40 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#06060c] via-transparent to-transparent opacity-90 z-10"></div>
              
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-900 shadow-inner">
                <img 
                  src="/roktokorobi_icon.jpg" 
                  alt="রক্তকরবী নাটকের লাল ফুল থিম লোগো" 
                  className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-700"
                />
                
                <div className="absolute bottom-6 left-6 right-6 z-20 space-y-2 text-left">
                  <span className="text-[10px] font-bold tracking-widest text-[#ff7979] uppercase">প্রযোজনা</span>
                  <h3 className="text-2xl font-black text-white leading-tight">রক্তকরবী</h3>
                  <p className="text-[10px] text-gray-300">নাটক ও নাট্যতত্ত্ব বিভাগ, জাবি</p>
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
            <div className="font-mono text-sm md:text-base font-extrabold text-white tracking-wide flex items-center justify-center gap-3">
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
        <section className="section-wrapper bg-gradient-to-r from-[#ff7979]/5 to-transparent border-y border-white/5 py-12">
          <div className="content-container">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#ff7979]/15 flex items-center justify-center text-[#ff7979]">
                <AlertCircle size={20} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">নির্দেশক শিবলু ভাইয়ের মহড়া ডায়েরি 📝</h3>
                <p className="text-xs text-gray-400">সর্বশেষ মহড়ার ফিডব্যাক ও বিশেষ নোটিশ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map(n => (
                <div key={n.id} className="glass-panel p-5 bg-black/40 border-white/5 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2 text-gray-400">
                    <span className="font-bold text-[#ff7979] uppercase">হালনাগাদ ফিডব্যাক</span>
                    <span>{n.date}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed pt-1 whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
         Accordion Section (কাহিনী সংক্ষেপ, রূপক তত্ত্ব, মহড়া সময়সূচী)
         ------------------------------------------------------------- */}
      <section className="section-wrapper bg-black/10 py-10 border-t border-white/5">
        <div className="content-container max-w-4xl space-y-4">
          
          {/* Accordion 1: কাহিনী সংক্ষেপ */}
          <div className="border border-white/5 rounded-2xl bg-[#12121c]/50 overflow-hidden transition-all duration-300">
            <button 
              type="button"
              onClick={() => setIsSynopsisOpen(!isSynopsisOpen)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5 focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#ff7979]">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">কাহিনী সংক্ষেপ</h3>
                  <p className="text-xs text-gray-400">যক্ষপুরের জটিল খনি ও নন্দিনীর আগমনের মূল গল্প</p>
                </div>
              </div>
              <span className={`transform transition-transform duration-300 text-gray-400 ${isSynopsisOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
              </span>
            </button>
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{ 
                maxHeight: isSynopsisOpen ? '1000px' : '0px', 
                opacity: isSynopsisOpen ? 1 : 0,
                visibility: isSynopsisOpen ? 'visible' : 'hidden'
              }}
            >
              <div className="p-6 border-t border-white/5 bg-black/20 text-sm text-gray-300 leading-relaxed">
                রক্তকরবী নাটকের মূলে রয়েছে যক্ষপুরী নামক একটি যান্ত্রিক খনি শহর। এখানে মানুষ সোনার লোভে অন্ধ হয়ে খনির গর্ভে মাটির নিচে প্রাণহীন পাথর খুঁড়ছে। রাজা স্বয়ং নিজেকে এক জটিল জালের আড়ালে বন্দি করে রেখেছেন এবং মানুষকে শুধু উৎপাদনের যন্ত্রে পরিণত করেছেন। এই শ্বাসরুদ্ধকর পরিবেশের মাঝে রক্তকরবী ফুলের মতো রাঙা রূপ আর অফুরন্ত প্রাণশক্তি নিয়ে হাজির হয় নন্দিনী। তার উপস্থিতি খনির শ্রমিকদের অসাড় চেতনায় মুক্তির কম্পন জাগায় এবং শেষ পর্যন্ত অত্যাচারী ও জটিল শাসন ব্যবস্থার ভিত কাঁপিয়ে দেয়।
              </div>
            </div>
          </div>

          {/* Accordion 2: রূপক তত্ত্ব ও বিশ্লেষণ */}
          <div className="border border-white/5 rounded-2xl bg-[#12121c]/50 overflow-hidden transition-all duration-300">
            <button 
              type="button"
              onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5 focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#e056fd]">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">রূপক তত্ত্ব ও বিশ্লেষণ</h3>
                  <p className="text-xs text-gray-400">প্রতীকীবাদ, রক্তকরবী ফুল ও রূপকের গূঢ় অর্থ</p>
                </div>
              </div>
              <span className={`transform transition-transform duration-300 text-gray-400 ${isAnalysisOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
              </span>
            </button>
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{ 
                maxHeight: isAnalysisOpen ? '1000px' : '0px', 
                opacity: isAnalysisOpen ? 1 : 0,
                visibility: isAnalysisOpen ? 'visible' : 'hidden'
              }}
            >
              <div className="p-6 border-t border-white/5 bg-black/20 text-sm text-gray-300 leading-relaxed">
                রক্তকরবী রবীন্দ্রনাথের অন্যতম শ্রেষ্ঠ রূপক ও প্রতীকী নাটক (Symbolic Drama)। এখানে প্রতিটি চরিত্র ও অনুষঙ্গ এক একটি দর্শনের প্রতিনিধিত্ব করে। যেমন- 'নন্দিনী' হলো অকৃত্রিম প্রকৃতি ও সৌন্দর্যের প্রতীক; 'রাজা' হলো অন্ধ পুঁজিবাদ, শোষণ ও একাকিত্বের প্রতীক; 'রক্তকরবী ফুল' হলো ওজস্বী যৌবনের জাগরণ এবং আত্মদানের প্রতীক। ৫২তম আবর্তনের এই মঞ্চায়নে আধুনিক আলোকসম্পাত, শক্তিশালী আবহসংগীত এবং গ্লাসমরফিক কোরিওগ্রাফির মাধ্যমে চিরায়ত রূপক নাটকের সাথে রিয়ালিজমের এক চমৎকার যুগলবন্দী ফুটিয়ে তোলা হয়েছে।
              </div>
            </div>
          </div>

          {/* Accordion 3: মহড়ার সময়সূচী */}
          <div className="border border-white/5 rounded-2xl bg-[#12121c]/50 overflow-hidden transition-all duration-300">
            <button 
              type="button"
              onClick={() => setIsScheduleOpen(!isScheduleOpen)}
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5 focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#22a6b3]">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">মহড়ার সময়সূচী</h3>
                  <p className="text-xs text-gray-400">আসন্ন মহড়া ক্যালেন্ডার ও প্রয়োজনীয় কাস্টের বিবরণ</p>
                </div>
              </div>
              <span className={`transform transition-transform duration-300 text-gray-400 ${isScheduleOpen ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
              </span>
            </button>
            <div 
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{ 
                maxHeight: isScheduleOpen ? '1500px' : '0px', 
                opacity: isScheduleOpen ? 1 : 0,
                visibility: isScheduleOpen ? 'visible' : 'hidden'
              }}
            >
              <div className="p-6 border-t border-white/5 bg-black/20">
                {rehearsals.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500 max-w-xl mx-auto">
                    সময়সূচী এখনও প্রকাশিত হয়নি
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rehearsals.map(r => (
                      <div key={r.id} className="border border-white/5 p-5 bg-black/30 rounded-xl flex flex-col justify-between text-left hover:border-[#e056fd]/30 transition-all">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-[9px] text-[#e056fd] font-bold tracking-widest uppercase">
                            <span>রিহার্সাল অ্যালার্ট</span>
                            <span className="bg-[#e056fd]/10 py-0.5 px-2 rounded-full border border-[#e056fd]/25">UPCOMING</span>
                          </div>
                          <h3 className="text-base font-bold text-white">{r.title}</h3>
                          {r.description && <p className="text-xs text-gray-400 leading-relaxed">{r.description}</p>}
                        </div>
                        
                        <div className="border-t border-white/5 mt-5 pt-4 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar size={12} className="text-[#ff7979]" />
                            <span>তারিখ: {r.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock size={12} className="text-[#e056fd]" />
                            <span>সময়: {r.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Users size={12} className="text-[#22a6b3]" />
                            <span>চরিত্র: <span className="font-semibold text-white">{r.required_cast}</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* -------------------------------------------------------------
         Casting Board Section (চরিত্র বণ্টন)
         ------------------------------------------------------------- */}
      <section className="section-wrapper">
        <div className="content-container">
          <div className="section-header">
            <h2>চরিত্র বণ্টন বোর্ড (Casting Grid)</h2>
            <p>{isAllCastingTbd ? "কাস্টিং চলছে" : "নাটকের চরিত্র পরিচিতি ও কুশীলব ম্যাপিং"}</p>
            <TraditionalDivider />
          </div>

          {isAllCastingTbd ? (
            <div className="glass-panel p-10 text-center text-sm text-gray-500 max-w-xl mx-auto border-white/5">
              চরিত্র বণ্টন প্রক্রিয়া চলমান রয়েছে। খুব শীঘ্রই কুশীলবদের তালিকা এখানে প্রকাশ করা হবে।
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {majorCharacters.map((char) => {
                const charNameOnly = char.title.split(' ')[0]; // e.g. "নন্দিনী"
                const actor = getCastingActor(charNameOnly);
                
                return (
                  <div key={char.title} className="glass-panel p-5 text-left flex flex-col justify-between hover:border-[#ff7979]/20 transition-all group relative overflow-hidden">
                    
                    {/* Dynamic Achievement Badge at the top right of the card */}
                    {actor?.badge && (
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${actor.badge.className}`}>
                          <span>{actor.badge.icon}</span>
                          <span>{actor.badge.text}</span>
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="font-black text-white text-base group-hover:text-[#ff7979] transition-colors pr-16">{char.title}</h3>
                      <p className="text-[10px] text-gray-400 leading-normal">{char.desc}</p>
                    </div>

                    <div className="border-t border-white/5 mt-4 pt-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5">
                        {actor?.avatar_url ? (
                          <img src={actor.avatar_url} alt={actor.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">TBD</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">অভিনয়ে</p>
                        <h4 className="text-xs font-bold text-white truncate max-w-full">{actor?.name || 'আসন্ন নির্বাচন'}</h4>
                        {actor && <p className="text-[9px] text-gray-400">রোল: {actor.roll} • উপস্থিত: {actor.totalPresent} দিন</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Script & Audio Assets Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
            <div className="glass-panel p-5 bg-gradient-to-r from-red-500/5 to-transparent flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff7979]/15 flex items-center justify-center text-[#ff7979]">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">রক্তকরবী লিব্রেটো (PDF Script)</h4>
                  <p className="text-[10px] text-gray-400">বার্ষিক উৎসবের মূল স্ক্রিপ্ট ও ব্লক-বুক লিব্রেটো ডাউনলোড করুন।</p>
                </div>
              </div>
              <a 
                href="https://sanskritbooks.org/rabindranath-tagore-books-pdf/Rakta-Karabi-Rabindranath-Tagore.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-glass py-2 px-4 text-xs shrink-0 flex items-center gap-1"
              >
                <Download size={12} />
                <span>ডাউনলোড</span>
              </a>
            </div>

            <div className="glass-panel p-5 bg-gradient-to-r from-indigo-500/5 to-transparent flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#e056fd]/15 flex items-center justify-center text-[#e056fd]">
                  <Music size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">বিশু পাগলের গান (Rehearsal Tracks)</h4>
                  <p className="text-[10px] text-gray-400">মহড়ায় ব্যবহৃত ব্যাকগ্রাউন্ড আবহসংগীত ও গান অনুশীলনের ফাইলসমূহ।</p>
                </div>
              </div>
              <a 
                href="https://www.youtube.com/results?search_query=raktakarabi+rabindrasangeet" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-glass py-2 px-4 text-xs shrink-0 flex items-center gap-1"
              >
                <Music size={12} />
                <span>প্লেলিস্ট</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
         Cast & Crew List Section (কুশীলব ও কলাকুশলী)
         ------------------------------------------------------------- */}
      <section className="section-wrapper bg-black/30">
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
                <div key={member.id} className="glass-panel flex flex-col items-center text-center group">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-white/5 group-hover:border-[#e056fd]/50 transition-all duration-300 shadow-md">
                    <img 
                      src={member.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-300"
                    />
                  </div>
                  <span className="badge badge-role text-[8px] mb-2">{member.role}</span>
                  <h4 className="font-bold text-white text-xs truncate max-w-full">{member.name}</h4>
                  <p className="text-[9px] text-gray-500 mt-1 font-semibold">রোল: {member.roll}</p>
                </div>
              ))}
            </div>
          )}

          {/* Rehearsal backstage teaser */}
          <div className="glass-panel teaser-panel">
            <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white shadow-inner shrink-0">
                <Users size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">মহড়ার গতিবিধি ও হাজিরা ট্র্যাকার</h4>
                <p className="text-xs text-gray-400">সব কলাকুশলীদের হাজিরার লাইভ ডেটা ও পাংচুয়ালিটি লিডারবোর্ড দেখুন নির্দেশক পোর্টালে।</p>
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
