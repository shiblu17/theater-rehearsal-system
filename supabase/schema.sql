-- Database schema for Roktokorobi Rehearsal Attendance System

-- 1. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    seats INTEGER NOT NULL CHECK (seats > 0),
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Allow public to insert tickets (audience booking)
DROP POLICY IF EXISTS "Allow public insert to tickets" ON tickets;
CREATE POLICY "Allow public insert to tickets" ON tickets
    FOR INSERT WITH CHECK (true);

-- Allow public to update tickets (for verification)
DROP POLICY IF EXISTS "Allow public update tickets" ON tickets;
CREATE POLICY "Allow public update tickets" ON tickets
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow authenticated users (Director) to read tickets
DROP POLICY IF EXISTS "Allow authenticated read tickets" ON tickets;
CREATE POLICY "Allow authenticated read tickets" ON tickets
    FOR SELECT USING (auth.role() = 'authenticated');


-- 2. Members Table (Cast & Crew)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'অভিনেতা', 'নির্দেশক', 'কলাকুশলী'
    character_name TEXT, -- ক্যারেক্টার ম্যাপিং (যেমন: নন্দিনী, বিশু পাগল)
    avatar_url TEXT,
    password TEXT DEFAULT 'roktokorobi52' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Allow public to read members (for public cast & crew list)
DROP POLICY IF EXISTS "Allow public read members" ON members;
CREATE POLICY "Allow public read members" ON members
    FOR SELECT USING (true);

-- Allow public/authenticated to manage members (so dev portal can seed/reset)
DROP POLICY IF EXISTS "Allow manage members" ON members;
CREATE POLICY "Allow manage members" ON members
    FOR ALL USING (true) WITH CHECK (true);


-- 3. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_late BOOLEAN DEFAULT false NOT NULL,
    status TEXT DEFAULT 'present' NOT NULL, -- 'present', 'late', 'absent'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Allow public check-ins
DROP POLICY IF EXISTS "Allow public check-in insertion" ON attendance;
CREATE POLICY "Allow public check-in insertion" ON attendance
    FOR INSERT WITH CHECK (true);

-- Allow public to read/manage attendance (so dev portal can clear/reset)
DROP POLICY IF EXISTS "Allow manage attendance" ON attendance;
CREATE POLICY "Allow manage attendance" ON attendance
    FOR ALL USING (true) WITH CHECK (true);


-- 4. Push Subscriptions Table (for Director's device notification tokens)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT UNIQUE NOT NULL,
    auth TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for push subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow public to register subscriptions
DROP POLICY IF EXISTS "Allow anyone to register push subscriptions" ON push_subscriptions;
CREATE POLICY "Allow anyone to register push subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (true);

-- Allow public to read/delete subscriptions
DROP POLICY IF EXISTS "Allow anyone to manage push subscriptions" ON push_subscriptions;
CREATE POLICY "Allow anyone to manage push subscriptions" ON push_subscriptions
    FOR ALL USING (true) WITH CHECK (true);


-- 5. Rehearsals Table (Scheduler)
CREATE TABLE IF NOT EXISTS rehearsals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    required_cast TEXT NOT NULL, -- কমা সেপারেটেড চরিত্র বা রোল
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for rehearsals
ALTER TABLE rehearsals ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rehearsals
DROP POLICY IF EXISTS "Allow anyone to read rehearsals" ON rehearsals;
CREATE POLICY "Allow anyone to read rehearsals" ON rehearsals
    FOR SELECT USING (true);

-- Allow anyone to manage rehearsals
DROP POLICY IF EXISTS "Allow anyone to manage rehearsals" ON rehearsals;
CREATE POLICY "Allow anyone to manage rehearsals" ON rehearsals
    FOR ALL USING (true) WITH CHECK (true);


-- 6. Rehearsal Notes Table (Director's Diary)
CREATE TABLE IF NOT EXISTS rehearsal_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for rehearsal_notes
ALTER TABLE rehearsal_notes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rehearsal_notes
DROP POLICY IF EXISTS "Allow anyone to read rehearsal_notes" ON rehearsal_notes;
CREATE POLICY "Allow anyone to read rehearsal_notes" ON rehearsal_notes
    FOR SELECT USING (true);

-- Allow anyone to manage rehearsal_notes
DROP POLICY IF EXISTS "Allow anyone to manage rehearsal_notes" ON rehearsal_notes;
CREATE POLICY "Allow anyone to manage rehearsal_notes" ON rehearsal_notes
    FOR ALL USING (true) WITH CHECK (true);


-- Seed default members from the class roster (Jahangirnagar University Drama & Dramatics 52nd batch)
INSERT INTO members (roll, name, role, character_name, avatar_url, password) VALUES
('1041', 'সীমান্ত সূত্রধর সুমন', 'অভিনেতা', 'ফাগুলাল', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1042', 'হৃদয় রায়', 'অভিনেতা', 'অধ্যাপক', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1043', 'নাহিয়ান কাব্য', 'অভিনেতা', 'রঞ্জন', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1045', 'সাহিদুল ইসলাম', 'অভিনেতা', 'গোকুল', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1046', 'নাসিম পারভেজ প্রভাত', 'অভিনেতা', 'মোড়ল', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1047', 'আতিকুজ্জামান শিবলু', 'অভিনেতা', 'রাজা', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1048', 'শেখ ফারদিন ইসলাম জিম', 'অভিনেতা', 'অধিকারী', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1049', 'মোঃ নাফিজ-উল-আলম', 'অভিনেতা', 'বিশু পাগল', 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1050', 'অপূর্ব বিশ্বাস', 'অভিনেতা', 'কিশোর', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1051', 'তৌহিদ মোস্তাক নীল', 'অভিনেতা', 'পড়ুয়া', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1052', 'নীল কমল লাল খাঁ', 'অভিনেতা', 'খনি সর্দার', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1053', 'বিশ্বাসের মাধুর্য রিফাত', 'অভিনেতা', 'দ্বারপাল', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1054', 'মোঃ শাফায়েত জামিল লিজান', 'অভিনেতা', 'রাজপ্রহরী', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1055', 'সজীব হোসেন দোলন', 'অভিনেতা', 'খোদাইকর', 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1057', 'উম্মে মারিয়াম', 'অভিনেত্রী', 'চন্দ্রা', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1059', 'স্নেহা বান্টা', 'অভিনেত্রী', 'নন্দিনী', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1061', 'মুশফিকা নওশিন ঐতিহ্য', 'অভিনেত্রী', 'রূপমঞ্জরী', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1062', 'মিথিলা তাসফিয়া সাজ্জাদ', 'অভিনেত্রী', 'সংগীতি', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1063', 'সাজিদা সামিহা', 'অভিনেত্রী', 'নৃত্যশিল্পী', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1064', 'প্রিয়ন্তী চক্রবর্তী', 'অভিনেত্রী', 'নেপথ্য গায়িকা', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1065', 'দেবব্রতা সরকার অহনা', 'অভিনেত্রী', 'অদিতি', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1066', 'জেসমিন রীমা', 'অভিনেত্রী', 'নর্তকী', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', 'roktokorobi52'),
('1070', 'মারিয়া আক্তার রায়শা', 'অভিনেত্রী', 'প্রহরিণী', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'roktokorobi52')
ON CONFLICT (roll) DO NOTHING;
