import { NextRequest, NextResponse } from 'next/server';
import { checkIn, getPushSubscriptions } from '@/lib/db';
import { getVAPIDKeys } from '@/lib/vapid';
import webPush from 'web-push';

export async function POST(req: NextRequest) {
  try {
    const { roll } = await req.json();

    if (!roll) {
      return NextResponse.json({ error: 'রোল নম্বর প্রয়োজন।' }, { status: 400 });
    }

    // 1. Record the check-in
    const result = await checkIn(roll);
    const { attendance, member } = result;

    // 2. Send push notifications to Director (all registered subscriptions)
    try {
      const subscriptions = await getPushSubscriptions();
      const vapidKeys = getVAPIDKeys();

      // Configure VAPID details
      webPush.setVapidDetails(
        'mailto:atiqur@example.com',
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );

      // Format time in 12-hour format
      const checkInDate = new Date(attendance.check_in_time);
      let hours = checkInDate.getHours();
      const minutes = checkInDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      const formattedTime = `${hours}:${strMinutes} ${ampm}`;

      const payload = JSON.stringify({
        title: 'মহড়া হাজিরা অ্যালার্ট',
        body: `${member.name} মহড়াকক্ষে প্রবেশ করেছেন। সময়: ${formattedTime} ${attendance.is_late ? '(লেট)' : ''}`,
        url: '/dashboard'
      });

      // Send in parallel
      const notificationPromises = subscriptions.map(sub => 
        webPush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            auth: sub.keys.auth,
            p256dh: sub.keys.p256dh
          }
        }, payload).catch(err => {
          console.error('Error sending push notification to endpoint:', sub.endpoint, err);
          // If the endpoint is expired or invalid (410 Gone / 404 Not Found), we could delete it,
          // but for mock/demo simplicity we just catch the error.
        })
      );

      await Promise.all(notificationPromises);
    } catch (pushError) {
      console.error('Failed to process web push notifications:', pushError);
      // We don't fail the check-in request if push notification fails
    }

    return NextResponse.json({ success: true, member, attendance });
  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: error.message || 'চেক-ইন ব্যর্থ হয়েছে।' }, { status: 500 });
  }
}
