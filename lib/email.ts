export interface EmailTicketPayload {
  id: string;
  name: string;
  email: string;
  phone: string;
  seats: number;
}

export async function sendTicketEmail(ticket: EmailTicketPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is not defined. Skipping email dispatch.');
    return false;
  }

  // Parse structured data from name and phone fields
  const seatMatch = ticket.name.match(/\((?:Seat|আসন):\s*([^)]+)\)/);
  const cleanName = ticket.name.replace(/\s*\((?:Seat|আসন):\s*([^)]+)\)/, '');
  const seatLabels = seatMatch ? seatMatch[1] : `${ticket.seats}টি আসন`;

  // Parse transaction details from phone: "01317982413 (bKash Sender: 01711122233, TrxID: BK29X8Z10)"
  const payMatch = ticket.phone.match(/\(([^)]+)\)/);
  const cleanPhone = ticket.phone.replace(/\s*\(([^)]+)\)/, '');
  const paymentDetails = payMatch ? payMatch[1] : 'ফ্রি এন্ট্রি পাস';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>রক্তকরবী টিকিট বুকিং নিশ্চিতকরণ</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid #e3dbcc;
          }
          .header {
            background: linear-gradient(135deg, #d35400, #c0392b);
            padding: 30px;
            text-align: center;
            color: #ffffff;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 12px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .title {
            font-size: 18px;
            font-weight: 700;
            color: #2a1f1a;
            margin-bottom: 20px;
            border-bottom: 1px solid #f1f0ea;
            padding-bottom: 10px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            font-size: 14px;
          }
          .detail-label {
            color: #6b5c54;
            font-weight: bold;
          }
          .detail-value {
            color: #2a1f1a;
            font-weight: 800;
          }
          .divider {
            border-top: 1px dashed #e3dbcc;
            margin: 25px 0;
          }
          .entry-pass {
            background-color: #fbf9f4;
            border: 1px solid #e3dbcc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
          }
          .entry-pass h3 {
            margin: 0 0 10px 0;
            color: #2a1f1a;
            font-size: 16px;
          }
          .pass-id {
            font-family: monospace;
            font-size: 14px;
            background: #ffffff;
            padding: 8px 15px;
            border-radius: 6px;
            border: 1px solid #e3dbcc;
            display: inline-block;
            margin-bottom: 10px;
            font-weight: bold;
            color: #c0392b;
          }
          .footer {
            background-color: #fbf9f4;
            padding: 20px;
            text-align: center;
            font-size: 11px;
            color: #6b5c54;
            border-top: 1px solid #f1f0ea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>রক্তকরবী (রবীন্দ্র নাট্যোৎসব)</h1>
            <p>নাটক ও নাট্যতত্ত্ব বিভাগ (৫২তম আবর্তন), জাহাঙ্গীরনগর বিশ্ববিদ্যালয়</p>
          </div>
          <div class="content">
            <div class="title">ডিজিটাল প্রবেশপত্র বুকিং নিশ্চিতকরণ 🎟️</div>
            
            <div class="detail-row">
              <span class="detail-label">দর্শকের নাম:</span>
              <span class="detail-value">${cleanName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">মোবাইল নম্বর:</span>
              <span class="detail-value">${cleanPhone}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">তারিখ ও সময়:</span>
              <span class="detail-value">৩০ জুন ২০২৬, সকাল ১১:৩০</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">আসন সংখ্যা:</span>
              <span class="detail-value">${ticket.seats} টি</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">নির্বাচিত আসন (Seats):</span>
              <span class="detail-value" style="color: #27ae60;">${seatLabels}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">পেমেন্ট বিবরণ:</span>
              <span class="detail-value" style="color: #d35400;">${paymentDetails}</span>
            </div>

            <div class="divider"></div>

            <div class="entry-pass">
              <h3>ডিজিটাল প্রবেশ পাস</h3>
              <div class="pass-id">${ticket.id}</div>
              <p style="margin: 0; font-size: 11px; color: #6b5c54; font-weight: bold;">
                * হল প্রবেশের সময় গেটে এই ইমেইল অথবা টিকিট আইডিটি প্রদর্শন করুন।
              </p>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0; font-weight: bold;">রক্তকরবী নাট্য প্রযোজনা কমিটি ২০২৬</p>
            <p style="margin: 5px 0 0 0;">কোনো জিজ্ঞাসায় যোগাযোগ করুন: ০১৩১৭৯৮২৪১৩</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'রক্তকরবী টিকিট <onboarding@resend.dev>',
        to: ticket.email,
        subject: 'রক্তকরবী নাটকের প্রবেশ টিকিট বুকিং নিশ্চিতকরণ 🎟️',
        html: htmlContent,
      }),
    });

    const resData = await res.json();
    if (!res.ok) {
      console.error('❌ Resend API Error Response:', resData);
      return false;
    }

    console.log('✓ Email sent successfully to:', ticket.email, 'Response ID:', (resData as any).id);
    return true;
  } catch (error) {
    console.error('❌ Resend email dispatch failed:', error);
    return false;
  }
}
