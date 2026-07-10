'use client';

import { useState } from 'react';
import { Ticket, Users, Phone, Mail, Award, CheckCircle, ArrowRight, Download, QrCode } from 'lucide-react';

export default function TicketsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [seats, setSeats] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, seats }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'টিকিট বুকিং ব্যর্থ হয়েছে।');
      }

      setSuccessTicket(data.ticket);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setSeats(1);
    } catch (err: any) {
      setError(err.message || 'নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 app-container flex items-center justify-center min-h-[80vh]">
      {/* Background glow decorations */}
      <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-[#e056fd]/10 rounded-full filter blur-[100px] pointer-events-none transform -translate-x-1/2"></div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
        
        {/* Success Modal / Display */}
        {successTicket ? (
          <div className="md:col-span-12 p-8 text-center space-y-6 max-w-lg mx-auto w-full border border-slate-200 bg-slate-50 rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#6ab04c]/10 text-[#6ab04c] flex items-center justify-center mx-auto border border-[#6ab04c]/30 animate-bounce">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">টিকিট বুকিং সফল হয়েছে!</h2>
              <p className="text-xs text-slate-500">আপনার ডিজিটাল এন্ট্রি পাসটি নিচে তৈরি করা হয়েছে। একই সাথে আপনার ইমেইল ও মোবাইল নম্বরে (SMS) কিউআর কোডসহ টিকিট পাঠানো হয়েছে।</p>
            </div>

            {/* Ticket Card visual representation */}
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden relative text-left shadow-sm">
              {/* Top accent border */}
              <div className="h-1.5 bg-gradient-to-r from-[#ff7979] to-[#e056fd]"></div>
              
              {/* Ticket Details */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">রক্তকরবী (রবীন্দ্র নাট্যোৎসব)</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">৫২তম আবর্তন • নাটক ও নাট্যতত্ত্ব বিভাগ</p>
                  </div>
                  <span className="badge badge-role text-[9px]">১ম শ্রেণীর টিকিট</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">দর্শকের নাম</span>
                    <span className="font-bold text-slate-800">{successTicket.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">ফোন নম্বর</span>
                    <span className="font-bold text-slate-800">{successTicket.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">তারিখ ও সময়</span>
                    <span className="font-bold text-[#ff7979]">৩০ জুন ২০২৬, সকাল ১১:৩০</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">আসন সংখ্যা (Seats)</span>
                    <span className="font-bold text-[#e056fd]">{successTicket.seats} টি আসন</span>
                  </div>
                </div>

                {/* Decorative cutouts */}
                <div className="flex items-center gap-2 my-4">
                  <div className="w-4 h-4 rounded-full bg-white -ml-8 border-r border-slate-200"></div>
                  <div className="flex-1 border-t border-dashed border-slate-200"></div>
                  <div className="w-4 h-4 rounded-full bg-white -mr-8 border-l border-slate-200"></div>
                </div>

                {/* QR Code section */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[9px] text-slate-500 block">ডিজিটাল টিকিট আইডি</span>
                    <code className="text-[10px] font-mono text-slate-800">{successTicket.id}</code>
                    <p className="text-[9px] text-yellow-500/70 mt-1">* হল প্রবেশের সময় এই কিউআর দেখান।</p>
                  </div>
                  
                  {/* Decorative QR Code SVG */}
                  <div className="w-16 h-16 bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-full h-full text-black" viewBox="0 0 100 100">
                      {/* Stylized custom QR representation */}
                      <rect x="5" y="5" width="25" height="25" fill="currentColor"/>
                      <rect x="10" y="10" width="15" height="15" fill="white"/>
                      <rect x="5" y="70" width="25" height="25" fill="currentColor"/>
                      <rect x="10" y="75" width="15" height="15" fill="white"/>
                      <rect x="70" y="5" width="25" height="25" fill="currentColor"/>
                      <rect x="75" y="10" width="15" height="15" fill="white"/>
                      
                      {/* Dots/Bits pattern */}
                      <rect x="40" y="15" width="10" height="10" fill="currentColor"/>
                      <rect x="55" y="5" width="10" height="15" fill="currentColor"/>
                      <rect x="45" y="45" width="20" height="20" fill="currentColor"/>
                      <rect x="75" y="45" width="15" height="10" fill="currentColor"/>
                      <rect x="15" y="45" width="10" height="20" fill="currentColor"/>
                      <rect x="40" y="75" width="25" height="10" fill="currentColor"/>
                      <rect x="80" y="75" width="15" height="15" fill="currentColor"/>
                      <rect x="55" y="90" width="10" height="5" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => window.print()} 
                className="btn-glass text-xs flex-1 justify-center"
              >
                <Download size={14} />
                <span>প্রিন্ট করুন</span>
              </button>
              <button 
                onClick={() => setSuccessTicket(null)} 
                className="btn-primary text-xs flex-1 justify-center"
              >
                <span>নতুন টিকিট বুক করুন</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Left Info Panel */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#ff7979] tracking-wider uppercase">টিকিট রিজার্ভেশন</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">ডিজিটাল টিকিট পোর্টাল</h2>
                <p className="text-sm text-slate-600">
                  নাটক ও নাট্যতত্ত্ব বিভাগ কর্তৃক আয়োজিত "রক্তকরবী" নাটকের প্রবেশ টিকিট সংগ্রহ করুন।
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-slate-200 flex items-center justify-center text-[#ff7979] shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ফ্রি এন্ট্রি পাস</h4>
                    <p className="text-xs text-slate-500 mt-0.5">বিশ্ববিদ্যালয়ের শিক্ষক-শিক্ষার্থী এবং থিয়েটারপ্রেমীদের জন্য কোনো ফি ছাড়াই আসন সংখ্যা লিমিটেড বুকিং করা যাচ্ছে।</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-slate-200 flex items-center justify-center text-[#e056fd] shrink-0">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">ডিজিটাল প্রবেশাধিকার</h4>
                    <p className="text-xs text-slate-500 mt-0.5">বুকিং শেষে তাত্ক্ষণিকভাবে একটি ডিজিটাল কিউআর কোডসহ টিকিট পাবেন। এটি আপনার ফোনে সংরক্ষণ করে হল গেটে দেখাবেন।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Panel */}
            <div className="md:col-span-7">
              <div className="p-8 border border-slate-200 bg-slate-50 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Ticket size={20} className="text-[#ff7979]" />
                  <span>টিকিট বুকিং ফর্ম</span>
                </h3>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label flex items-center gap-1.5">
                      <span>দর্শকের নাম</span>
                      <span className="text-[#ff7979]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="আপনার নাম লিখুন"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label flex items-center gap-1.5">
                        <span>মোবাইল নম্বর</span>
                        <span className="text-[#ff7979]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="০১XXXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label flex items-center gap-1.5">
                        <span>ইমেইল এড্রেস</span>
                        <span className="text-[#ff7979]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label flex items-center gap-1.5">
                      <span>আসন সংখ্যা (Seats)</span>
                      <span className="text-[#ff7979]">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-black/30">
                        <button
                          type="button"
                          disabled={seats <= 1}
                          onClick={() => setSeats(seats - 1)}
                          className="px-4 py-2.5 hover:bg-white/5 text-lg font-bold text-gray-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          -
                        </button>
                        <span className="px-6 py-2.5 font-bold text-white text-base min-w-[50px] text-center">
                          {seats}
                        </span>
                        <button
                          type="button"
                          disabled={seats >= 5}
                          onClick={() => setSeats(seats + 1)}
                          className="px-4 py-2.5 hover:bg-white/5 text-lg font-bold text-gray-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-slate-500">
                        * সর্বোচ্চ ৫টি আসন একসাথে বুক করা যাবে। (বুকিং নিশ্চিত হওয়ার পর আপনার ইমেইল ও মোবাইলে (SMS) কিউআর কোড পাঠানো হবে)
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3.5 mt-4"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>টিকিট কনফার্ম করুন</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
