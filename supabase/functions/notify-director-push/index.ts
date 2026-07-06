// Supabase Edge Function: notify-director-push
// Triggers on insert to "attendance" table and sends Web Push notifications to subscribed devices.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push@3.6.6"

// Types
interface AttendanceWebhookPayload {
  type: 'INSERT'
  table: string
  schema: string
  record: {
    id: string
    member_id: string
    check_in_time: string
    is_late: boolean
    status: string
  }
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? ""
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? ""

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing Supabase env credentials" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Parse the webhook payload from Supabase
    const payload: AttendanceWebhookPayload = await req.json()
    const record = payload.record

    if (!record) {
      return new Response(JSON.stringify({ error: "Empty record in payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    // 1. Fetch Member details
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('id', record.member_id)
      .single()

    if (memberError || !member) {
      throw memberError || new Error("Member not found")
    }

    // 2. Fetch push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (subError) throw subError

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No active push subscriptions found" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    }

    // 3. Setup web-push details
    if (vapidPublicKey && vapidPrivateKey) {
      webpush.setVapidDetails(
        'mailto:atiqur@example.com',
        vapidPublicKey,
        vapidPrivateKey
      )

      // Format time in 12-hour format
      const checkInDate = new Date(record.check_in_time)
      let hours = checkInDate.getHours()
      const minutes = checkInDate.getMinutes()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12
      const strMinutes = minutes < 10 ? '0' + minutes : minutes
      const formattedTime = `${hours}:${strMinutes} ${ampm}`

      const notificationPayload = JSON.stringify({
        title: 'মহড়া হাজিরা অ্যালার্ট',
        body: `${member.name} মহড়াকক্ষে প্রবেশ করেছেন। সময়: ${formattedTime} ${record.is_late ? '(লেট)' : ''}`,
        url: '/dashboard'
      })

      // Send to all subscribers in parallel
      const sendPromises = subscriptions.map(async (sub: any) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh
            }
          }, notificationPayload)
        } catch (err: any) {
          console.error("Failed to notify subscription endpoint:", sub.endpoint, err)
          // If status is 410 (Gone) or 404 (Not Found), remove expired subscription
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id)
            console.log("Deleted expired subscription:", sub.id)
          }
        }
      })

      await Promise.all(sendPromises)
    }

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })

  } catch (error: any) {
    console.error("Error in Edge Function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
