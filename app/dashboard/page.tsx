'use client';

import Link from 'next/link';
import { Shield, Settings, Users, ArrowRight, Activity, Terminal, FileText, Calendar, Award, ClipboardList } from 'lucide-react';

export default function DashboardPortalPage() {
  return (
    <div className="section-wrapper min-h-[85vh] flex items-center justify-center relative overflow-hidden">
      {/* Background glow animations */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-[#e056fd]/10 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-[#ff7979]/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="content-container w-full max-w-6xl text-center relative z-10 px-4">
        {/* Header */}
        <div className="space-y-4 mb-16">
          <span className="badge badge-role text-xs">নিয়ন্ত্রণ কেন্দ্র • System Portal</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            রক্তকরবী ড্যাশবোর্ড পোর্টাল
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            মহড়া ব্যবস্থাপনা, কাস্ট হাজিরা ও টিকিট ভেরিফিকেশনের জন্য নির্দেশক প্যানেলে যান; অথবা ডেটাবেজ ও নোটিফিকেশন টিউনিংয়ের জন্য ডেভেলপার ল্যাবে প্রবেশ করুন।
          </p>
          <div className="divider"></div>
        </div>

        {/* Roles Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">
          
          {/* Card 1: Director Portal */}
          <div className="glass-panel group flex flex-col justify-between items-center p-8 h-full hover:border-[#ff7979]/30 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ff7979] to-[#eb4d4b] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Shield size={32} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-[#ff7979] transition-colors">
                  Director Panel
                </h3>
                <p className="text-xs text-gray-500">নির্দেশক পোর্টাল</p>
              </div>
            </div>

            <div className="w-full pt-8">
              <Link href="/dashboard/director" className="btn-secondary w-full justify-center">
                <span>প্রবেশ করুন</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Actor Portal */}
          <div className="glass-panel group flex flex-col justify-between items-center p-8 h-full hover:border-[#22a6b3]/30 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22a6b3] to-[#00d2d3] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Users size={32} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-[#22a6b3] transition-colors">
                  Actor Dashboard
                </h3>
                <p className="text-xs text-gray-500">কুশীলব পোর্টাল</p>
              </div>
            </div>

            <div className="w-full pt-8">
              <Link href="/login" className="btn-glass w-full justify-center border-[#22a6b3]/20 hover:border-[#22a6b3]/40 text-[#22a6b3] hover:bg-[#22a6b3]/5">
                <span>প্রবেশ করুন</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Floor Manager Portal */}
          <div className="glass-panel group flex flex-col justify-between items-center p-8 h-full hover:border-[#2ecc71]/30 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2ecc71] to-[#3498db] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <ClipboardList size={32} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-[#2ecc71] transition-colors">
                  Floor Manager
                </h3>
                <p className="text-xs text-gray-500">ফ্লোর ম্যানেজার</p>
              </div>
            </div>

            <div className="w-full pt-8">
              <Link href="/dashboard/floor-manager" className="btn-primary w-full justify-center bg-gradient-to-r from-[#2ecc71] to-[#3498db] hover:opacity-90 border-0">
                <span>প্রবেশ করুন</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 4: Developer Portal */}
          <div className="glass-panel group flex flex-col justify-between items-center p-8 h-full hover:border-[#e056fd]/30 transition-all duration-300">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e056fd] to-[#be2edd] flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Settings size={32} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-[#e056fd] transition-colors">
                  Developer Lab
                </h3>
                <p className="text-xs text-gray-500">ডেভেলপার প্যানেল</p>
              </div>
            </div>

            <div className="w-full pt-8">
              <Link href="/dashboard/developer" className="btn-primary w-full justify-center">
                <span>প্রবেশ করুন</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
