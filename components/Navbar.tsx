'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Ticket, LayoutDashboard, QrCode } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'হোম', href: '/', icon: Sparkles },
    { name: 'টিকিট বুকিং', href: '/tickets', icon: Ticket },
    { name: 'নির্দেশক পোর্টাল', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-50 !rounded-none !border-t-0 !border-x-0 bg-opacity-70 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff7979] to-[#e056fd] flex items-center justify-center shadow-lg shadow-[#ff7979]/20">
          <span className="font-bold text-white text-lg">র</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#ff7979] to-[#e056fd] bg-clip-text text-transparent">
            রক্তকরবী
          </h1>
          <p className="text-[10px] text-gray-400 font-medium">জাবি নাটক ও নাট্যতত্ত্ব বিভাগ</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#e056fd] to-[#be2edd] text-white shadow-md shadow-[#e056fd]/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
