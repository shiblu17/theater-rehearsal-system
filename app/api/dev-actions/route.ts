import { NextResponse } from 'next/server';
import { 
  clearAllMockData, 
  reseedDefaultMembers, 
  generateDemoData, 
  getPushSubscriptions, 
  testSupabaseConnection 
} from '@/lib/db';
import { getVAPIDKeys } from '@/lib/vapid';
import webPush from 'web-push';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'অ্যাকশন নির্ধারণ করা হয়নি।' }, { status: 400 });
    }

    if (action === 'clear') {
      await clearAllMockData();
      return NextResponse.json({ success: true, message: 'লোকাল মক ডাটা সফলভাবে মুছে ফেলা হয়েছে।' });
    }

    if (action === 'reseed') {
      await reseedDefaultMembers();
      return NextResponse.json({ success: true, message: 'কুশীলব তালিকা রিসেট সম্পন্ন হয়েছে।' });
    }

    if (action === 'demo') {
      await generateDemoData();
      return NextResponse.json({ success: true, message: 'ডেমো ডেটা জেনারেট করা হয়েছে।' });
    }

    if (action === 'status') {
      const dbStatus = await testSupabaseConnection();
      const subscriptions = await getPushSubscriptions();
      const vapidKeys = getVAPIDKeys();
      return NextResponse.json({ 
        success: true, 
        dbStatus, 
        pushSubscriptionsCount: subscriptions.length,
        vapidPublicKey: vapidKeys.publicKey 
      });
    }

    if (action === 'push_test') {
      const subscriptions = await getPushSubscriptions();
      if (subscriptions.length === 0) {
        return NextResponse.json({ success: false, message: 'কোনো ব্রাউজার নোটিফিকেশন সাবস্ক্রিপশন পাওয়া যায়নি।' });
      }

      const vapidKeys = getVAPIDKeys();
      webPush.setVapidDetails(
        'mailto:atiqur@example.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );

      const payload = JSON.stringify({
        title: 'ডেভেলপার টেস্ট অ্যালার্ট 🚀',
        body: `এটি একটি ম্যানুয়াল টেস্ট নোটিফিকেশন। রক্তকরবী সিস্টেমে নোটিফিকেশন সঠিকভাবে কাজ করছে!`,
        url: '/dashboard'
      });

      let successCount = 0;
      let failCount = 0;

      const promises = subscriptions.map(sub => 
        webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keys.auth,
            p256dh: sub.keys.p256dh
          }
        }, payload)
        .then(() => { successCount++; })
        .catch(err => {
          console.error('Push test send error:', err);
          failCount++;
        })
      );

      await Promise.all(promises);
      return NextResponse.json({ 
        success: true, 
        message: `টেস্ট পুশ পাঠানো হয়েছে। সফল: ${successCount}, ব্যর্থ: ${failCount}` 
      });
    }

    return NextResponse.json({ error: 'অবৈধ অ্যাকশন।' }, { status: 400 });
  } catch (error: any) {
    console.error('Developer action error:', error);
    return NextResponse.json({ error: error.message || 'ডেভেলপার অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে।' }, { status: 500 });
  }
}
