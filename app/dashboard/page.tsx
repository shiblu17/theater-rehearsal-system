'use client';

import Link from 'next/link';
import { Shield, Settings, Users, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function DashboardPortalPage() {
  return (
    <div className="section-wrapper min-h-[85vh] flex items-center justify-center relative overflow-hidden">
      {/* Background glow animations */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-[#e056fd]/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#ff7979]/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="content-container w-full max-w-4xl text-center relative z-10 px-4">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <span className="badge badge-role text-xs">নিয়ন্ত্রণ কেন্দ্র • Admin Portal</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            রক্তকরবী ড্যাশবোর্ড পোর্টাল
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            মহড়া ব্যবস্থাপনা, কাস্ট হাজিরা ও টিকিট ভেরিফিকেশনের জন্য নির্দেশক প্যানেলে যান; অথবা ডেটাবেজ ও নোটিফিকেশন টিউনিংয়ের জন্য ডেভেলপার ল্যাবে প্রবেশ করুন।
          </p>
          <div className="divider"></div>
        </div>

        {/* Roles Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Card 1: Director Portal */}
          <div className="glass-panel group flex flex-col justify-between h-full hover:border-[#ff7979]/30 transition-all duration-300">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff7979] to-[#eb4d4b] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Shield size={28} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-[#ff7979] transition-colors">
                  নির্দেশক পোর্টাল
                </h3>
                <p className="text-xs text-[#ff7979] font-semibold tracking-wider uppercase">Director Panel</p>
                <p className="text-sm text-gray-300 leading-relaxed pt-2">
                  আতিকুজ্জামান শিবলু ভাইয়ের নির্দেশনা প্যানেল। এখানে আপনি কুশীলবদের হাজিরা দেখতে পারবেন, নতুন মহড়ার দৃশ্য ও সময় নির্ধারণ করতে পারবেন, লিব্রেটো ফিডব্যাক দিতে পারবেন এবং কিউআর কোড স্ক্যান করে দর্শকদের টিকিট ভেরিফাই করবেন।
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 flex items-center gap-1">
                  <Users size={10} /> কুশীলব হাজিরা
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 flex items-center gap-1">
                  <Activity size={10} /> মহড়া শিডিউলার
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 flex items-center gap-1">
                  <Terminal size={10} /> গেট পাস স্ক্যানার
                </span>
              </div>
            </div>

            <div className="pt-8">
              <Link href="/dashboard/director" className="btn-secondary w-full justify-center">
                <span>নির্দেশক পোর্টালে প্রবেশ করুন</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Developer Portal */}
          <div className="glass-panel group flex flex-col justify-between h-full hover:border-[#e056fd]/30 transition-all duration-300">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e056fd] to-[#be2edd] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Settings size={28} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white group-hover:text-[#e056fd] transition-colors">
                  ডেভেলপার প্যানেল
                </h3>
                <p className="text-xs text-[#e056fd] font-semibold tracking-wider uppercase">Developer Lab</p>
                <p className="text-sm text-gray-300 leading-relaxed pt-2">
                  সিস্টেমের ডেটা সংযোগ ও নোটিফিকেশন ল্যাব। এখানে আপনি সুপাবেস ক্লাউড কানেকশন চেক করতে পারবেন, ১-ক্লিকে মক ডেটাবেজ পরিষ্কার বা লোড টেস্টিংয়ের ডেমো ডেটা সিড করতে পারবেন এবং পুশ নোটিফিকেশন সিস্টেম টেস্ট করতে পারবেন।
                </p>
              </div>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 flex items-center gap-1">
                  <Terminal size={10} /> সুপাবেস হেলথ চেক
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 flex items-center gap-1">
                  <Activity size={10} /> ডেমো ডেটা সিডার
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300 flex items-center gap-1">
                  <Shield size={10} /> পুশ নোটিফিকেশন টেস্ট
                </span>
              </div>
            </div>

            <div className="pt-8">
              <Link href="/dashboard/developer" className="btn-primary w-full justify-center">
                <span>ডেভেলপার ল্যাবে প্রবেশ করুন</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
