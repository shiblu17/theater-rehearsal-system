import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-gray-500 mt-auto bg-black/40">
      <div className="max-w-7xl mx-auto px-6 space-y-4">
        <div className="flex justify-center items-center gap-6">
          <Link href="/" className="hover:text-white transition-colors">হোম</Link>
          <Link href="/tickets" className="hover:text-white transition-colors">টিকিট বুকিং</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">নির্দেশক পোর্টাল</Link>
        </div>
        <p className="font-semibold text-gray-400">রক্তকরবী (রবীন্দ্রনাথ ঠাকুর)</p>
        <p className="mt-1">নাটক ও নাট্যতত্ত্ব বিভাগ (৫২তম আবর্তন), জাহাঙ্গীরনগর বিশ্ববিদ্যালয়</p>
        <p className="mt-3 text-gray-600">© ২০২৬ সর্বস্বত্ব সংরক্ষিত</p>
      </div>
    </footer>
  );
}
