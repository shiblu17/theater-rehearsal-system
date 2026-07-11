import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Define TS Interfaces
export interface Member {
  id: string;
  roll: string;
  name: string;
  role: string;
  character_name?: string; // ক্যারেক্টার ম্যাপিং (যেমন: নন্দিনী, রাজা)
  avatar_url?: string;
  password?: string; // কুশীলব ড্যাশবোর্ড সেশন অথ
  production_fee_paid?: number; // প্রোডাকশন ফি
  snacks_fee_paid?: number; // নাস্তার টাকা
}

export interface Ticket {
  id: string;
  name: string;
  email: string;
  phone: string;
  seats: number;
  is_verified: boolean; // ভেরিফাইড কি না
  created_at: string;
}

export interface Attendance {
  id: string;
  member_id: string;
  check_in_time: string;
  is_late: boolean;
  status: string; // 'present' | 'late' | 'absent'
  session?: string; // 'morning' | 'afternoon'
  member?: Member;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Rehearsal {
  id: string;
  title: string;
  date: string;
  time: string;
  description?: string;
  required_cast: string;
}

export interface RehearsalNote {
  id: string;
  date: string;
  content: string;
}

// Check if Supabase env variables are configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Mock database file path
const MOCK_DB_FILE = path.join(process.cwd(), 'mock-db.json');

// Default Seed Data
const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', roll: '1041', name: 'সীমান্ত সূত্রধর সুমন', role: 'অভিনেতা', character_name: 'ফাগুলাল', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm2', roll: '1042', name: 'হৃদয় রায়', role: 'অভিনেতা', character_name: 'অধ্যাপক', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm3', roll: '1043', name: 'নাহিয়ান কাব্য', role: 'অভিনেতা', character_name: 'রঞ্জন', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm4', roll: '1045', name: 'সাহিদুল ইসলাম', role: 'অভিনেতা', character_name: 'গোকুল', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm5', roll: '1046', name: 'নাসিম পারভেজ প্রভাত', role: 'অভিনেতা', character_name: 'মোড়ল', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm6', roll: '1047', name: 'আতিকুজ্জামান শিবলু', role: 'অভিনেতা', character_name: 'রাজা', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm7', roll: '1048', name: 'শেখ ফারদিন ইসলাম জিম', role: 'অভিনেতা', character_name: 'অধিকারী', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm8', roll: '1049', name: 'মোঃ নাফিজ-উল-আলম', role: 'অভিনেতা', character_name: 'বিশু পাগল', avatar_url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm9', roll: '1050', name: 'অপূর্ব বিশ্বাস', role: 'অভিনেতা', character_name: 'কিশোর', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm10', roll: '1051', name: 'তৌহিদ মোস্তাক নীল', role: 'অভিনেতা', character_name: 'পড়ুয়া', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm11', roll: '1052', name: 'নীল কমল লাল খাঁ', role: 'অভিনেতা', character_name: 'খনি সর্দার', avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm12', roll: '1053', name: 'বিশ্বাসের মাধুর্য রিফাত', role: 'অভিনেতা', character_name: 'দ্বারপাল', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm13', roll: '1054', name: 'মোঃ শাফায়েত জামিল লিজান', role: 'অভিনেতা', character_name: 'রাজপ্রহরী', avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm14', roll: '1055', name: 'সজীব হোসেন দোলন', role: 'অভিনেতা', character_name: 'খোদাইকর', avatar_url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm15', roll: '1057', name: 'উম্মে মারিয়াম', role: 'অভিনেত্রী', character_name: 'চন্দ্রা', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm16', roll: '1059', name: 'স্নেহা বান্টা', role: 'অভিনেত্রী', character_name: 'নন্দিনী', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm17', roll: '1061', name: 'মুশফিকা নওশিন ঐতিহ্য', role: 'অভিনেত্রী', character_name: 'রূপমঞ্জরী', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm18', roll: '1062', name: 'মিথিলা তাসফিয়া সাজ্জাদ', role: 'অভিনেত্রী', character_name: 'সংগীতি', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm19', roll: '1063', name: 'সাজিদা সামিহা', role: 'অভিনেত্রী', character_name: 'নৃত্যশিল্পী', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm20', roll: '1064', name: 'প্রিয়ন্তী চক্রবর্তী', role: 'অভিনেত্রী', character_name: 'নেপথ্য গায়িকা', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm21', roll: '1065', name: 'দেবব্রতা সরকার অহনা', role: 'অভিনেত্রী', character_name: 'অদিতি', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm22', roll: '1066', name: 'জেসমিন রীমা', role: 'অভিনেত্রী', character_name: 'নর্তকী', avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' },
  { id: 'm23', roll: '1070', name: 'মারিয়া আক্তার রায়শা', role: 'অভিনেত্রী', character_name: 'প্রহরিণী', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', password: 'roktokorobi52' }
];

export interface SystemSettings {
  morning_cutoff: string; // e.g. "11:30"
  afternoon_cutoff: string; // e.g. "15:00"
  session_transition: string; // e.g. "13:30"
}

interface MockDB {
  members: Member[];
  tickets: Ticket[];
  attendance: Attendance[];
  subscriptions: PushSubscriptionData[];
  rehearsals: Rehearsal[];
  notes: RehearsalNote[];
  settings?: SystemSettings;
}

function readMockDB(): MockDB {
  try {
    if (fs.existsSync(MOCK_DB_FILE)) {
      const data = fs.readFileSync(MOCK_DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return {
        members: parsed.members || DEFAULT_MEMBERS,
        tickets: parsed.tickets || [],
        attendance: parsed.attendance || [],
        subscriptions: parsed.subscriptions || [],
        rehearsals: parsed.rehearsals || [],
        notes: parsed.notes || [],
        settings: parsed.settings || { morning_cutoff: '11:30', afternoon_cutoff: '15:00', session_transition: '13:30' }
      };
    }
  } catch (error) {
    console.error('Error reading mock DB file:', error);
  }

  // Create default DB
  const defaultDB: MockDB = {
    members: DEFAULT_MEMBERS,
    tickets: [],
    attendance: [],
    subscriptions: [],
    rehearsals: [],
    notes: [],
    settings: { morning_cutoff: '11:30', afternoon_cutoff: '15:00', session_transition: '13:30' }
  };
  writeMockDB(defaultDB);
  return defaultDB;
}

function writeMockDB(data: MockDB) {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing mock DB file:', error);
  }
}

// Database helper functions
export async function getMembers(): Promise<Member[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('members').select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('⚠️ Supabase tables not found. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  return db.members;
}

export async function getTickets(): Promise<Ticket[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('⚠️ Supabase tickets query failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  return db.tickets;
}

export async function bookTicket(ticketData: Omit<Ticket, 'id' | 'created_at' | 'is_verified'>): Promise<Ticket> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('tickets').insert([{ ...ticketData, is_verified: false }]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase ticket booking failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const newTicket: Ticket = {
    ...ticketData,
    id: 't_' + Math.random().toString(36).substr(2, 9),
    is_verified: false,
    created_at: new Date().toISOString()
  };
  db.tickets.unshift(newTicket);
  writeMockDB(db);
  return newTicket;
}

export async function verifyTicket(ticketId: string): Promise<Ticket> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('tickets').update({ is_verified: true }).eq('id', ticketId).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase ticket verification failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const ticket = db.tickets.find(t => t.id === ticketId);
  if (!ticket) {
    throw new Error('এই টিকিট নম্বরটি পাওয়া যায়নি।');
  }
  ticket.is_verified = true;
  writeMockDB(db);
  return ticket;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const defaultSettings: SystemSettings = { morning_cutoff: '11:30', afternoon_cutoff: '15:00', session_transition: '13:30' };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('system_settings').select('*');
      if (!error && data && data.length > 0) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value;
        });
        return {
          morning_cutoff: settingsMap['morning_cutoff'] || '11:30',
          afternoon_cutoff: settingsMap['afternoon_cutoff'] || '15:00',
          session_transition: settingsMap['session_transition'] || '13:30'
        };
      }
    } catch (err) {
      console.warn('⚠️ Supabase system_settings query failed. Falling back.');
    }
  }

  const db = readMockDB();
  return db.settings || defaultSettings;
}

export async function updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Upsert settings keys
      await supabase.from('system_settings').upsert({ key: 'morning_cutoff', value: settings.morning_cutoff });
      await supabase.from('system_settings').upsert({ key: 'afternoon_cutoff', value: settings.afternoon_cutoff });
      await supabase.from('system_settings').upsert({ key: 'session_transition', value: settings.session_transition });
      return settings;
    } catch (err) {
      console.warn('⚠️ Supabase settings upsert failed. Falling back.');
    }
  }

  const db = readMockDB();
  db.settings = settings;
  writeMockDB(db);
  return settings;
}

export async function checkIn(rollNumber: string): Promise<{ attendance: Attendance; member: Member }> {
  const members = await getMembers();
  const member = members.find(m => m.roll === rollNumber);

  if (!member) {
    throw new Error('এই রোল নম্বরটি তালিকায় পাওয়া যায়নি।');
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Load dynamic settings for cutoff times and session transitions
  const settings = await getSystemSettings();
  const [transitionHour, transitionMin] = (settings.session_transition || '13:30').split(':').map(Number);
  const session = currentHour < transitionHour || (currentHour === transitionHour && currentMinute < transitionMin) ? 'morning' : 'afternoon';

  const [morningHour, morningMin] = (settings.morning_cutoff || '11:30').split(':').map(Number);
  const [afternoonHour, afternoonMin] = (settings.afternoon_cutoff || '15:00').split(':').map(Number);

  // Determine cutoff for lateness
  let isLate = false;
  if (session === 'morning') {
    isLate = currentHour > morningHour || (currentHour === morningHour && currentMinute > morningMin);
  } else {
    isLate = currentHour > afternoonHour || (currentHour === afternoonHour && currentMinute > afternoonMin);
  }

  const status = isLate ? 'late' : 'present';

  // Check duplicate check-in today for the same session
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
  const todayStr = now.toDateString();

  if (isSupabaseConfigured && supabase) {
    try {
      // Query existing check-ins for this member today
      const { data: existingLogs, error: fetchError } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', member.id)
        .gte('check_in_time', todayStart)
        .lte('check_in_time', todayEnd);

      if (!fetchError && existingLogs && existingLogs.length > 0) {
        const duplicate = existingLogs.find(log => (log.session || 'morning') === session);
        if (duplicate) {
          throw new Error(`আপনি ইতিমধ্যে ${session === 'afternoon' ? 'লাঞ্চ পরবর্তী' : 'সকালের প্রথম'} সেশনের হাজিরা দিয়েছেন!`);
        }
      }

      // Insert check-in with session column
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ member_id: member.id, is_late: isLate, status, session }])
        .select()
        .single();

      if (error) {
        // Retrying without session column if it doesn't exist yet on database
        if (error.code === '42703') {
          console.warn('⚠️ Supabase "session" column is missing. Retrying check-in without it.');
          const { data: retryData, error: retryError } = await supabase
            .from('attendance')
            .insert([{ member_id: member.id, is_late: isLate, status }])
            .select()
            .single();
          if (retryError) throw retryError;
          return { attendance: { ...retryData, session: 'morning' }, member };
        }
        throw error;
      }
      return { attendance: data, member };
    } catch (err: any) {
      if (err.message && err.message.includes('আপনি ইতিমধ্যে')) {
        throw err;
      }
      console.warn('⚠️ Supabase check-in failed or threw error. Falling back to mock-db.', err);
    }
  }

  // Mock-DB Fallback
  const db = readMockDB();
  const existingMockLogs = db.attendance.filter(a => {
    return a.member_id === member.id && new Date(a.check_in_time).toDateString() === todayStr;
  });

  const duplicateMock = existingMockLogs.find(log => (log.session || 'morning') === session);
  if (duplicateMock) {
    throw new Error(`আপনি ইতিমধ্যে ${session === 'afternoon' ? 'লাঞ্চ পরবর্তী' : 'সকালের প্রথম'} সেশনের হাজিরা দিয়েছেন!`);
  }

  const newAttendance: Attendance = {
    id: 'a_' + Math.random().toString(36).substr(2, 9),
    member_id: member.id,
    check_in_time: now.toISOString(),
    is_late: isLate,
    status,
    session
  };
  db.attendance.push(newAttendance);
  writeMockDB(db);
  return { attendance: newAttendance, member };
}

export async function getAttendanceLogs(): Promise<Attendance[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, members(*)')
        .order('check_in_time', { ascending: false });
      if (error) throw error;
      return data.map((item: any) => ({
        ...item,
        member: item.members
      })) || [];
    } catch (err) {
      console.warn('⚠️ Supabase logs query failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  return db.attendance
    .map(att => ({
      ...att,
      member: db.members.find(m => m.id === att.member_id)
    }))
    .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
}

export async function getWeeklyStats(): Promise<any[]> {
  const logs = await getAttendanceLogs();
  const members = await getMembers();
  const rehearsals = await getRehearsals();
  const totalMembersCount = members.length || 1;

  const weeklyStats = [];
  const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'];

  // Last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    
    // Check if there was any check-in
    const dayLogs = logs.filter(l => new Date(l.check_in_time).toDateString() === dateStr);
    const rate = Math.round((dayLogs.length / totalMembersCount) * 100);
    
    weeklyStats.push({
      label: dayNames[d.getDay()],
      rate: Math.min(rate, 100),
      count: dayLogs.length,
      date: d.toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })
    });
  }

  return weeklyStats;
}

export async function getLeaderboard(): Promise<any[]> {
  const members = await getMembers();
  const logs = await getAttendanceLogs();
  const rehearsals = await getRehearsals();

  // Last 14 days array for heatmap calculation
  const heatmapDates: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    heatmapDates.push(d.toDateString());
  }

  const rehearsalDates = rehearsals.map(r => new Date(r.date).toDateString());

  const stats = members.map(m => {
    const memberLogs = logs.filter(log => log.member_id === m.id);
    const totalPresent = memberLogs.length;
    const lateCount = memberLogs.filter(log => log.is_late).length;
    const onTimeCount = totalPresent - lateCount;
    const punctualityRate = totalPresent > 0 ? Math.round((onTimeCount / totalPresent) * 100) : 0;

    // Badges Allocation
    let badgeText = 'নেপথ্যে';
    let badgeClass = 'bg-zinc-800 text-zinc-400 border-zinc-700/50';
    let badgeIcon = '🎭';

    if (totalPresent > 0) {
      if (totalPresent >= 5 && lateCount === 0) {
        badgeText = 'সময়ের প্রতীক';
        badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        badgeIcon = '⏱️';
      } else if (punctualityRate >= 90 && totalPresent >= 2) {
        badgeText = 'যক্ষপুরের রঞ্জন';
        badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        badgeIcon = '🌟';
      } else if ((lateCount / totalPresent) > 0.4) {
        badgeText = 'বিশু পাগল';
        badgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        badgeIcon = '🪕';
      } else {
        badgeText = 'সক্রিয় করবী';
        badgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
        badgeIcon = '🌺';
      }
    }

    // Heatmap Array Calculation
    const memberLogDates = memberLogs.map(log => ({
      date: new Date(log.check_in_time).toDateString(),
      isLate: log.is_late
    }));

    const heatmap = heatmapDates.map(dateStr => {
      const hasRehearsal = rehearsalDates.includes(dateStr);
      // Fallback: If no explicit rehearsals are scheduled but logs exist on that day, count it as rehearsal day
      const hasLogsOnDay = logs.some(l => new Date(l.check_in_time).toDateString() === dateStr);
      
      if (!hasRehearsal && !hasLogsOnDay) return 'none';

      const dayLogs = memberLogDates.filter(l => l.date === dateStr);
      if (dayLogs.length > 0) {
        const hasLate = dayLogs.some(l => l.isLate);
        return hasLate ? 'late' : 'present';
      } else {
        // If rehearsal was scheduled but actor didn't check in, marked absent
        return 'absent';
      }
    });

    return {
      member_id: m.id,
      roll: m.roll,
      name: m.name,
      role: m.role,
      character_name: m.character_name,
      avatar_url: m.avatar_url,
      totalPresent,
      onTimeCount,
      punctualityRate,
      badge: { text: badgeText, className: badgeClass, icon: badgeIcon },
      heatmap
    };
  });

  return stats.sort((a, b) => {
    if (b.punctualityRate !== a.punctualityRate) {
      return b.punctualityRate - a.punctualityRate;
    }
    return b.totalPresent - a.totalPresent;
  });
}


// Rehearsal Scheduler helper functions
export async function getRehearsals(): Promise<Rehearsal[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rehearsals').select('*').order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('⚠️ Supabase rehearsals failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  return db.rehearsals.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function addRehearsal(rehearsal: Omit<Rehearsal, 'id'>): Promise<Rehearsal> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rehearsals').insert([rehearsal]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase add rehearsal failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const newRehearsal: Rehearsal = {
    ...rehearsal,
    id: 'r_' + Math.random().toString(36).substr(2, 9)
  };
  db.rehearsals.push(newRehearsal);
  writeMockDB(db);
  return newRehearsal;
}

export async function deleteRehearsal(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('rehearsals').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('⚠️ Supabase delete rehearsal failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  db.rehearsals = db.rehearsals.filter(r => r.id !== id);
  writeMockDB(db);
}

// Rehearsal Notes helper functions
export async function getRehearsalNotes(): Promise<RehearsalNote[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rehearsal_notes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('⚠️ Supabase rehearsal notes failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  return db.notes.sort((a, b) => b.id.localeCompare(a.id));
}

export async function addRehearsalNote(content: string): Promise<RehearsalNote> {
  const noteData = {
    date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
    content
  };
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rehearsal_notes').insert([noteData]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase add note failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const newNote: RehearsalNote = {
    id: 'n_' + Date.now(),
    date: noteData.date,
    content
  };
  db.notes.unshift(newNote);
  writeMockDB(db);
  return newNote;
}

// Push subscriptions
export async function subscribePush(subscription: PushSubscriptionData): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('push_subscriptions').insert([{
        endpoint: subscription.endpoint,
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh
      }]);
      if (error && error.code !== '23505') throw error;
      return;
    } catch (err) {
      console.warn('⚠️ Supabase subscribe failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  if (!db.subscriptions.some(s => s.endpoint === subscription.endpoint)) {
    db.subscriptions.push(subscription);
    writeMockDB(db);
  }
}

export async function getPushSubscriptions(): Promise<PushSubscriptionData[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('push_subscriptions').select('*');
      if (error) throw error;
      return (data || []).map((s: any) => ({
        endpoint: s.endpoint,
        keys: {
          auth: s.auth,
          p256dh: s.p256dh
        }
      }));
    } catch (err) {
      console.warn('⚠️ Supabase get push subs failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  return db.subscriptions;
}

// Developer Portal Diagnostic Helper Actions
export async function testSupabaseConnection(): Promise<{ healthy: boolean; details: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { healthy: false, details: 'সুপাবেস এনভায়রনমেন্ট ক্রেডেনশিয়াল সেট করা নেই।' };
  }
  try {
    const { data, error } = await supabase.from('members').select('count');
    if (error) throw error;
    return { healthy: true, details: `সফলভাবে সুপাবেস কানেক্ট হয়েছে।` };
  } catch (err: any) {
    return { healthy: false, details: `কানেকশন ইরর: ${err.message || err}` };
  }
}

export async function clearAllMockData(): Promise<void> {
  const db = readMockDB();
  db.tickets = [];
  db.attendance = [];
  db.rehearsals = [];
  db.notes = [];
  writeMockDB(db);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('tickets').delete().neq('name', 'dummy_non_existent');
      await supabase.from('rehearsals').delete().neq('title', 'dummy_non_existent');
      await supabase.from('rehearsal_notes').delete().neq('content', 'dummy_non_existent');
      await supabase.from('attendance').delete().neq('status', 'dummy_non_existent');
    } catch (err) {
      console.error('Supabase clear database error:', err);
    }
  }
}

export async function reseedDefaultMembers(): Promise<void> {
  const db = readMockDB();
  db.members = DEFAULT_MEMBERS;
  writeMockDB(db);
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('members').delete().neq('roll', 'dummy');
      await supabase.from('members').insert(DEFAULT_MEMBERS.map(m => ({
        roll: m.roll,
        name: m.name,
        role: m.role,
        character_name: m.character_name,
        avatar_url: m.avatar_url
      })));
    } catch (err) {
      console.error('Supabase reseed members error:', err);
    }
  }
}

export async function generateDemoData(): Promise<void> {
  const db = readMockDB();
  
  // Seed 5 demo tickets
  const sampleTickets: Omit<Ticket, 'id' | 'created_at'>[] = [
    { name: 'আহসান হাবিব', email: 'ahsan@example.com', phone: '01712345678', seats: 2, is_verified: false },
    { name: 'তাসনিয়া রহমান', email: 'tasnia@example.com', phone: '01812345678', seats: 3, is_verified: true },
    { name: 'ড. মোস্তাফিজুর রহমান', email: 'mustafiz@juniv.edu', phone: '01512345678', seats: 1, is_verified: false },
    { name: 'ফারজানা ববি', email: 'farjana@example.com', phone: '01912345678', seats: 4, is_verified: false },
    { name: 'তাহমিদ চৌধুরী', email: 'tahmid@example.com', phone: '01312345678', seats: 2, is_verified: false }
  ];

  db.tickets = sampleTickets.map((t, idx) => ({
    ...t,
    id: `t_demo${idx + 1}`,
    created_at: new Date(Date.now() - 3600000 * idx).toISOString()
  }));

  // Seed some rehearsals
  db.rehearsals = [
    { id: 'r_demo1', title: 'দৃশ্য ১ ও ২ ব্লকিং', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '১১:৩০', required_cast: 'নন্দিনী, রাজা, বিশু পাগল' },
    { id: 'r_demo2', title: 'বিশু পাগলের গান ও সংগীত অনুশীলন', date: new Date(Date.now() + 172800000).toISOString().split('T')[0], time: '০৩:০০', required_cast: 'বিশু পাগল, সংগীতি, নৃত্যশিল্পী' },
    { id: 'r_demo3', title: 'দৃশ্য ৪ ও ৫ শেষ রিহার্সাল', date: new Date(Date.now() + 259200000).toISOString().split('T')[0], time: '১১:৩০', required_cast: 'নন্দিনী, রাজা, কিশোর, চন্দ্রা' }
  ];

  // Seed director notes
  db.notes = [
    { id: 'n_demo1', date: '৬ জুলাই ২০২৬', content: 'বিশু পাগলের প্রবেশ দৃশ্যে আলোর ফোকাস আরেকটু উজ্জ্বল করতে হবে। চন্দ্রা এবং ফাগুলালের ডায়ালগ থ্রোয়িং বেশ জুতসই হয়েছে।' },
    { id: 'n_demo2', date: '৫ জুলাই ২০২৬', content: 'মঞ্চ সজ্জার কলাকুশলীরা আজকের মধ্যে ল্যাবের পেছনের কালো পর্দা ফিট করে দেবেন। নন্দিনীর রক্তকরবী ফুলগুলো সজীব দেখানোর জন্য ডামিগুলো লাল রং করুন।' }
  ];

  // Seed some mock check-ins
  const presentMemberIds = ['m1', 'm2', 'm3', 'm4', 'm5', 'm9', 'm10', 'm16'];
  db.attendance = presentMemberIds.map((memberId, idx) => ({
    id: `a_demo${idx + 1}`,
    member_id: memberId,
    check_in_time: new Date(Date.now() - 3600000 * 24 * idx - (idx % 2 === 0 ? 0 : 3600000)).toISOString(),
    is_late: idx % 3 === 0,
    status: idx % 3 === 0 ? 'late' : 'present'
  }));

  writeMockDB(db);

  // If Supabase is connected, write to Supabase too
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('tickets').delete().neq('name', 'dummy');
      await supabase.from('tickets').insert(db.tickets);

      await supabase.from('rehearsals').delete().neq('title', 'dummy');
      await supabase.from('rehearsals').insert(db.rehearsals);

      await supabase.from('rehearsal_notes').delete().neq('content', 'dummy');
      await supabase.from('rehearsal_notes').insert(db.notes.map(n => ({
        date: n.date,
        content: n.content
      })));

      await supabase.from('attendance').delete().neq('status', 'dummy');
      await supabase.from('attendance').insert(db.attendance.map(a => ({
        member_id: db.members.find(m => m.id === a.member_id)?.id || a.member_id,
        is_late: a.is_late,
        status: a.status
      })));
    } catch (err) {
      console.error('Supabase demo data generation error:', err);
    }
  }
}

export { isSupabaseConfigured };

// CRUD Operations for Master Developer Portal Controls
export async function createOrUpdateMember(member: Omit<Member, 'id'> & { id?: string }): Promise<Member> {
  const isNew = !member.id;
  const id = member.id || 'm_' + Math.random().toString(36).substr(2, 9);
  const updatedMember = { ...member, id } as Member;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('members').upsert([updatedMember]).select().single();
      if (error) {
        if (error.code === '42703') { // Column missing code
          console.warn('⚠️ Supabase member column missing. Retrying upsert without fee columns.');
          const { production_fee_paid, snacks_fee_paid, ...cleanMember } = updatedMember as any;
          const { data: retryData, error: retryError } = await supabase.from('members').upsert([cleanMember]).select().single();
          if (retryError) throw retryError;
          return { ...retryData, production_fee_paid, snacks_fee_paid };
        }
        throw error;
      }
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase member upsert failed. Falling back to mock-db.', err);
    }
  }

  const db = readMockDB();
  if (isNew) {
    db.members.push(updatedMember);
  } else {
    db.members = db.members.map(m => m.id === id ? updatedMember : m);
  }
  writeMockDB(db);
  return updatedMember;
}

export async function deleteMember(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('⚠️ Supabase member delete failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  db.members = db.members.filter(m => m.id !== id);
  // Cascading deletes in mock database
  db.attendance = db.attendance.filter(a => a.member_id !== id);
  writeMockDB(db);
}

export async function updateAttendance(id: string, updates: Partial<Attendance>): Promise<Attendance> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('attendance').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase attendance update failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const attIdx = db.attendance.findIndex(a => a.id === id);
  if (attIdx === -1) throw new Error('রেকর্ড পাওয়া যায়নি।');
  db.attendance[attIdx] = { ...db.attendance[attIdx], ...updates };
  writeMockDB(db);
  return db.attendance[attIdx];
}

export async function deleteAttendance(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('⚠️ Supabase attendance delete failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  db.attendance = db.attendance.filter(a => a.id !== id);
  writeMockDB(db);
}

export async function updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('tickets').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase ticket update failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const tickIdx = db.tickets.findIndex(t => t.id === id);
  if (tickIdx === -1) throw new Error('টিকিট পাওয়া যায়নি।');
  db.tickets[tickIdx] = { ...db.tickets[tickIdx], ...updates };
  writeMockDB(db);
  return db.tickets[tickIdx];
}

export async function deleteTicket(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('⚠️ Supabase ticket delete failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  db.tickets = db.tickets.filter(t => t.id !== id);
  writeMockDB(db);
}

export async function updateRehearsal(id: string, updates: Partial<Rehearsal>): Promise<Rehearsal> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rehearsals').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase rehearsal update failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const reIdx = db.rehearsals.findIndex(r => r.id === id);
  if (reIdx === -1) throw new Error('মহড়া শিডিউল পাওয়া যায়নি।');
  db.rehearsals[reIdx] = { ...db.rehearsals[reIdx], ...updates };
  writeMockDB(db);
  return db.rehearsals[reIdx];
}

export async function updateRehearsalNote(id: string, content: string): Promise<RehearsalNote> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('rehearsal_notes').update({ content }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase note update failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const noteIdx = db.notes.findIndex(n => n.id === id);
  if (noteIdx === -1) throw new Error('মন্তব্য পাওয়া যায়নি।');
  db.notes[noteIdx].content = content;
  writeMockDB(db);
  return db.notes[noteIdx];
}

export async function deleteRehearsalNote(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('rehearsal_notes').delete().eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.warn('⚠️ Supabase note delete failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  db.notes = db.notes.filter(n => n.id !== id);
  writeMockDB(db);
}

export async function updateMemberPassword(roll: string, newPassword: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('members').update({ password: newPassword }).eq('roll', roll).select();
      if (error) throw error;
      return (data && data.length > 0) ? true : false;
    } catch (err) {
      console.warn('⚠️ Supabase member password update failed. Falling back to mock-db.');
    }
  }
  const db = readMockDB();
  const mIdx = db.members.findIndex(m => m.roll === roll);
  if (mIdx === -1) return false;
  db.members[mIdx].password = newPassword;
  writeMockDB(db);
  return true;
}


