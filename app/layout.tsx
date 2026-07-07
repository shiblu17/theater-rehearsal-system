import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PWARegistration from '@/components/PWARegistration';
import BottomNavigation from '@/components/BottomNavigation';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'রক্তকরবী - থিয়েটার প্রচার ও স্বয়ংক্রিয় মহড়া হাজিরা',
  description: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয় নাটক ও নাট্যতত্ত্ব বিভাগ ৫২তম আবর্তন-এর রবীন্দ্র নাট্যোৎসব উপস্থাপনা রক্তকরবী।',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'রক্তকরবী',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <PWARegistration />
        <Navbar />
        <main className="flex-1 w-full flex flex-col pb-20 md:pb-0">{children}</main>
        <BottomNavigation />
        <Footer />
      </body>
    </html>
  );
}
