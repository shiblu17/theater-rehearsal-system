'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Ticket, LayoutDashboard } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'হোম', href: '/', icon: Sparkles },
    { name: 'টিকিট বুকিং', href: '/tickets', icon: Ticket },
    { name: 'পোর্টাল', href: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#06060c]/80 backdrop-blur-xl border-t border-white/5 shadow-[0_-4px_30px_rgba(0,0,0,0.8)]">
      <div className="flex justify-around items-center h-20 px-4 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match for home, startsWith for others
          const isActive = item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-20 h-full relative group transition-all duration-300"
            >
              {/* Active Indicator Bar (Top or Background Glow) */}
              {isActive && (
                <div className="absolute top-0 w-8 h-1 rounded-full bg-gradient-to-r from-[#ff7979] to-[#e056fd] shadow-[0_0_10px_#e056fd]" />
              )}

              {/* Icon Container with hover scaling */}
              <div 
                className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
                  isActive 
                    ? 'text-white bg-gradient-to-tr from-[#ff7979]/20 to-[#e056fd]/20 scale-110' 
                    : 'text-gray-500 group-hover:text-gray-300'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
              </div>

              {/* Label */}
              <span 
                className={`text-[10px] font-bold tracking-wide mt-1 transition-colors duration-300 ${
                  isActive ? 'bg-gradient-to-r from-[#ff7979] to-[#e056fd] bg-clip-text text-transparent' : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
