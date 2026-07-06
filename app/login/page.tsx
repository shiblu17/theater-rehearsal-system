'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, KeyRound, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [roll, setRoll] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roll || !password) {
      setError('রোল নম্বর এবং পাসওয়ার্ড উভয়ই আবশ্যক।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'লগইন করতে ব্যর্থ হয়েছে।');
      }

      // Redirect to actor dashboard on success
      router.push('/dashboard/actor');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden min-h-[85vh]">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#e056fd]/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#ff7979]/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-panel p-8 bg-opacity-40 text-center space-y-6">
          
          {/* Logo Header */}
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff7979] to-[#e056fd] flex items-center justify-center shadow-lg shadow-[#ff7979]/20 mx-auto">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white pt-2">রক্তকরবী পোর্টাল</h2>
            <p className="text-xs text-gray-400 font-medium">কুশীলব (অভিনেতা/অভিনেত্রী) লগইন স্ক্রিন</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2.5 text-xs font-semibold leading-relaxed animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Roll Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">রোল নম্বর</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="যেমন: ১০৫৯"
                  value={roll}
                  onChange={(e) => setRoll(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e056fd] transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">পাসওয়ার্ড</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="password"
                  placeholder="ডিফল্ট পাসওয়ার্ড: roktokorobi52"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/30 border border-white/5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#e056fd] transition-all font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-6"
            >
              <span>{loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Prompt */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-gray-500">
              * প্রথমবার প্রবেশের জন্য আপনার রোল নম্বর ও ডিফল্ট পাসওয়ার্ড ব্যবহার করুন। কোনো সাহায্য লাগলে নির্দেশক প্যানেলে যোগাযোগ করুন।
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
