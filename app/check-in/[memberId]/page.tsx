'use client';

import { useEffect, useState, use } from 'react';
import { CheckCircle2, User, Clock, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Member } from '@/lib/db';

interface PageProps {
  params: Promise<{ memberId: string }>;
}

export default function CheckInPage({ params }: PageProps) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const rollNumber = resolvedParams.memberId;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<any>(null);

  // Fetch member info on load to personalize check-in page
  useEffect(() => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((m) => m.roll === rollNumber);
          if (found) {
            setMember(found);
          } else {
            setError('এই আইডি নম্বরের কোনো সদস্য খুঁজে পাওয়া যায়নি।');
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('সদস্য ভেরিফিকেশন ব্যর্থ হয়েছে।');
        setLoading(false);
      });
  }, [rollNumber]);

  const handleCheckIn = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roll: rollNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'চেক-ইন ব্যর্থ হয়েছে।');
      }

      setSuccessData(data);
    } catch (err: any) {
      setError(err.message || 'নেটওয়ার্কের সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 app-container flex items-center justify-center min-h-[80vh]">
      {/* Glow ambient background */}
      <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-[#e056fd]/10 rounded-full filter blur-[100px] pointer-events-none transform -translate-x-1/2"></div>

      <div className="w-full max-w-md relative z-10">
        
        {loading ? (
          <div className="glass-panel p-8 text-center">
            <div className="w-10 h-10 border-4 border-[#ff7979]/30 border-t-[#ff7979] rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-400 mt-4">আইডি যাচাইকরণ চলছে...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-8 text-center space-y-4 border-red-500/30">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-bold text-white text-base">যাচাইকরণ ব্যর্থ</h3>
            <p className="text-xs text-gray-400">{error}</p>
            <div className="pt-2">
              <a href="/" className="btn-glass text-xs">হোম পেজে ফিরে যান</a>
            </div>
          </div>
        ) : successData ? (
          /* Check-In Success State */
          <div className="glass-panel p-8 text-center space-y-6 border-[#6ab04c]/30 shadow-lg shadow-[#6ab04c]/5">
            <div className="w-16 h-16 rounded-full bg-[#6ab04c]/10 text-[#6ab04c] flex items-center justify-center mx-auto border border-[#6ab04c]/30 animate-scaleUp">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">চেক-ইন সফল হয়েছে!</h3>
              <p className="text-xs text-gray-400">আপনার উপস্থিতি ডিরেক্টরের কাছে পৌঁছানো হয়েছে।</p>
            </div>

            {/* Display logged details */}
            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-left space-y-3 text-xs">
              <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                <img 
                  src={member?.avatar_url} 
                  alt={member?.name} 
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="font-bold text-white">{member?.name}</h4>
                  <p className="text-[10px] text-gray-500">রোল: {member?.roll} • {member?.role}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock size={12} />
                  <span>চেক-ইন সময়</span>
                </div>
                <span className="font-bold text-white">
                  {new Date(successData.attendance.check_in_time).toLocaleTimeString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-gray-400">হাজিরা স্ট্যাটাস</span>
                <span className={`badge ${successData.attendance.is_late ? 'badge-late' : 'badge-present'} text-[8px]`}>
                  {successData.attendance.is_late ? 'বিলম্বিত (Late)' : 'সময়নিষ্ঠ (On Time)'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-gray-500 mb-4">নিরাপদে মহড়ায় অংশগ্রহণ করুন। রক্তকরবী জয়ী হোক।</p>
              <button 
                onClick={() => window.close()} 
                className="btn-glass text-xs w-full justify-center"
              >
                ট্যাব বন্ধ করুন
              </button>
            </div>
          </div>
        ) : (
          /* Check-In Action State */
          <div className="glass-panel p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#e056fd]/10 text-[#e056fd] flex items-center justify-center mx-auto border border-[#e056fd]/20">
              <ShieldCheck size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white">ডিজিটাল মহড়া উপস্থিতি</h3>
              <p className="text-xs text-gray-400">১-ট্যাপের মাধ্যমে মহড়াকক্ষে আপনার উপস্থিতি নিশ্চিত করুন।</p>
            </div>

            {/* Member Card preview */}
            {member && (
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                <img 
                  src={member.avatar_url} 
                  alt={member.name} 
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{member.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{member.role}</p>
                  <p className="text-[10px] text-gray-500">জাহাঙ্গীরনগর বিশ্ববিদ্যালয় • রোল {member.roll}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckIn}
              disabled={isSubmitting}
              className="btn-secondary w-full justify-center py-4 text-sm font-bold shadow-lg shadow-[#ff7979]/20"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>১-ট্যাপে হাজিরা দিন (Check In)</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
