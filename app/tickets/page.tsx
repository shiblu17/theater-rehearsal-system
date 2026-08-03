'use client';

import { useState, useEffect } from 'react';
import { Ticket, Users, Phone, Mail, Award, CheckCircle, ArrowRight, ArrowLeft, Download, QrCode, Sparkles } from 'lucide-react';

interface BlockConfig {
  id: string;
  name: string;
  type: string;
  price: number;
  totalSeats: number;
  rows: {
    rowName: string;
    seats: string[];
  }[];
}

const blocks: BlockConfig[] = [
  // Front Section (N & G) - Floor Seating - 30 seats each - 100 BDT
  {
    id: 'N',
    name: 'N ব্লক (সামনে-বাম)',
    type: 'সামনে ফ্লোর',
    price: 100,
    totalSeats: 30,
    rows: [
      { rowName: 'N1', seats: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7', 'N8', 'N9', 'N10'] },
      { rowName: 'N2', seats: ['N11', 'N12', 'N13', 'N14', 'N15', 'N16', 'N17', 'N18', 'N19', 'N20'] },
      { rowName: 'N3', seats: ['N21', 'N22', 'N23', 'N24', 'N25', 'N26', 'N27', 'N28', 'N29', 'N30'] }
    ]
  },
  {
    id: 'G',
    name: 'G ব্লক (সামনে-ডান)',
    type: 'সামনে ফ্লোর',
    price: 100,
    totalSeats: 30,
    rows: [
      { rowName: 'G1', seats: ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'] },
      { rowName: 'G2', seats: ['G11', 'G12', 'G13', 'G14', 'G15', 'G16', 'G17', 'G18', 'G19', 'G20'] },
      { rowName: 'G3', seats: ['G21', 'G22', 'G23', 'G24', 'G25', 'G26', 'G27', 'G28', 'G29', 'G30'] }
    ]
  },
  // Middle Section (A & B) - Chair Seating - 35 seats each - 200 BDT
  {
    id: 'A',
    name: 'A ব্লক (মাঝখানে-বাম)',
    type: 'মাঝখানে চেয়ার',
    price: 200,
    totalSeats: 35,
    rows: [
      { rowName: 'A1', seats: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'] },
      { rowName: 'A2', seats: ['A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14'] },
      { rowName: 'A3', seats: ['A15', 'A16', 'A17', 'A18', 'A19', 'A20', 'A21'] },
      { rowName: 'A4', seats: ['A22', 'A23', 'A24', 'A25', 'A26', 'A27', 'A28'] },
      { rowName: 'A5', seats: ['A29', 'A30', 'A31', 'A32', 'A33', 'A34', 'A35'] }
    ]
  },
  {
    id: 'B',
    name: 'B ব্লক (মাঝখানে-ডান)',
    type: 'মাঝখানে চেয়ার',
    price: 200,
    totalSeats: 35,
    rows: [
      { rowName: 'B1', seats: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7'] },
      { rowName: 'B2', seats: ['B8', 'B9', 'B10', 'B11', 'B12', 'B13', 'B14'] },
      { rowName: 'B3', seats: ['B15', 'B16', 'B17', 'B18', 'B19', 'B20', 'B21'] },
      { rowName: 'B4', seats: ['B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28'] },
      { rowName: 'B5', seats: ['B29', 'B30', 'B31', 'B32', 'B33', 'B34', 'B35'] }
    ]
  },
  // Rear Section (C & D) - 2nd Tier - 15 seats each - 200 BDT
  {
    id: 'C',
    name: 'C ব্লক (পেছনে ২য় তলা)',
    type: 'পেছনে ২য় তলা',
    price: 200,
    totalSeats: 15,
    rows: [
      { rowName: 'C1', seats: ['C1', 'C2', 'C3', 'C4', 'C5'] },
      { rowName: 'C2', seats: ['C6', 'C7', 'C8', 'C9', 'C10'] },
      { rowName: 'C3', seats: ['C11', 'C12', 'C13', 'C14', 'C15'] }
    ]
  },
  {
    id: 'D',
    name: 'D ব্লক (পেছনে ২য় তলা)',
    type: 'পেছনে ২য় তলা',
    price: 200,
    totalSeats: 15,
    rows: [
      { rowName: 'D1', seats: ['D1', 'D2', 'D3', 'D4', 'D5'] },
      { rowName: 'D2', seats: ['D6', 'D7', 'D8', 'D9', 'D10'] },
      { rowName: 'D3', seats: ['D11', 'D12', 'D13', 'D14', 'D15'] }
    ]
  }
];

export default function TicketsPage() {
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Seat Picker States
  const [selectedBlockId, setSelectedBlockId] = useState<string>('N');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successTicket, setSuccessTicket] = useState<any>(null);

  // Find currently selected block configuration
  const currentBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];

  // Fetch all currently booked seats on load
  const fetchBookedSeats = async () => {
    try {
      const res = await fetch('/api/tickets', { cache: 'no-store' });
      if (res.ok) {
        const tickets: any[] = await res.json();
        const booked: string[] = [];
        tickets.forEach(ticket => {
          const match = ticket.name.match(/\((?:Seat|আসন):\s*([^)]+)\)/);
          if (match) {
            const seatsList = match[1].split(',').map((s: string) => s.trim());
            booked.push(...seatsList);
          }
        });
        setBookedSeats(booked);
      }
    } catch (err) {
      console.error('Error fetching booked seats:', err);
    }
  };

  useEffect(() => {
    fetchBookedSeats();
  }, []);

  const handleSeatClick = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return; // Already occupied

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length >= 5) {
        alert('দুঃখিত, আপনি একসাথে সর্বোচ্চ ৫টি আসন নির্বাচন করতে পারবেন।');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) {
      setError('অনুগ্রহ করে অন্তত ১টি আসন নির্বাচন করুন।');
      return;
    }
    if (!senderNumber || !trxId) {
      setError('অনুগ্রহ করে পেমেন্ট বিবরণ পূরণ করুন।');
      return;
    }
    setLoading(true);
    setError('');

    const formattedName = `${name} (Seat: ${selectedSeats.join(', ')})`;
    const formattedPhone = `${phone} (${paymentMethod.toUpperCase()} Sender: ${senderNumber}, TrxID: ${trxId})`;

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: formattedName, 
          email, 
          phone: formattedPhone, 
          seats: selectedSeats.length 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'টিকিট বুকিং ব্যর্থ হয়েছে।');
      }

      setSuccessTicket(data.ticket);
      setName('');
      setEmail('');
      setPhone('');
      setSenderNumber('');
      setTrxId('');
      setSelectedSeats([]);
      setCheckoutStep(1);
      fetchBookedSeats(); // Refresh booked list
    } catch (err: any) {
      setError(err.message || 'নেটওয়ার্ক ত্রুটি। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const getTicketDisplayData = (ticket: any) => {
    if (!ticket) return { cleanName: '', seatLabels: '', cleanPhone: '', paymentDetails: '', parsedBlockId: 'N' };
    
    const seatMatch = ticket.name.match(/\((?:Seat|আসন):\s*([^)]+)\)/);
    const cleanName = ticket.name.replace(/\s*\((?:Seat|আসন):\s*([^)]+)\)/, '');
    const seatLabels = seatMatch ? seatMatch[1] : '';
    
    const payMatch = ticket.phone.match(/\(([^)]+)\)/);
    const cleanPhone = ticket.phone.replace(/\s*\(([^)]+)\)/, '');
    const paymentDetails = payMatch ? payMatch[1] : 'ফ্রি এন্ট্রি পাস';

    let parsedBlockId = 'N';
    if (seatLabels) {
      const firstSeat = seatLabels.split(',')[0].trim();
      parsedBlockId = firstSeat.charAt(0).toUpperCase();
    }

    return { cleanName, seatLabels, cleanPhone, paymentDetails, parsedBlockId };
  };

  const { cleanName, seatLabels, cleanPhone, paymentDetails, parsedBlockId } = getTicketDisplayData(successTicket);
  const successBlock = blocks.find(b => b.id === parsedBlockId) || currentBlock;

  return (
    <div className="flex-1 app-container flex items-center justify-center min-h-[85vh] py-6 sm:py-10">
      {/* Background glow decorations */}
      <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-[#851b2e]/5 rounded-full filter blur-[120px] pointer-events-none transform -translate-x-1/2"></div>

      <div className="w-full max-w-6xl relative z-10 px-4 sm:px-6">
        
        {/* Success Display */}
        {successTicket ? (
          <div className="p-4 sm:p-8 text-center space-y-6 max-w-xl mx-auto w-full border-2 border-[#d4af37] bg-[#fbf9f4] rounded-3xl shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
              <CheckCircle size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#851b2e]">টিকিট বুকিং সফল হয়েছে!</h2>
              <p className="text-xs text-[#6b5c54]">আপনার ডিজিটাল এন্ট্রি পাসটি নিচে তৈরি করা হয়েছে। একই সাথে আপনার ইমেইল ও মোবাইল নম্বরে কিউআর কোডসহ টিকিট পাঠানো হয়েছে।</p>
            </div>

            {/* Ticket Card visual representation */}
            <div className="border border-[#e3dbcc] rounded-2xl bg-white overflow-hidden relative text-left shadow-sm">
              <div className="h-2 bg-gradient-to-r from-[#851b2e] via-[#d4af37] to-[#851b2e]"></div>
              
              <div className="p-4 sm:p-6 space-y-5">
                <div className="flex justify-between items-start border-b border-[#e3dbcc]/60 pb-3">
                  <div>
                    <h3 className="font-extrabold text-[#851b2e] text-sm sm:text-base">রক্তকরবী (রবীন্দ্র নাট্যোৎসব)</h3>
                    <p className="text-[10px] text-[#6b5c54] mt-0.5">৫২তম আবর্তন • নাটক ও নাট্যতত্ত্ব বিভাগ</p>
                  </div>
                  <span className="bg-[#851b2e]/10 text-[#851b2e] border border-[#851b2e]/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider">{successBlock.type} টিকিট</span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div>
                    <span className="text-[9px] text-[#6b5c54] block font-bold uppercase tracking-wider">দর্শকের নাম</span>
                    <span className="font-extrabold text-[#2a1f1a] text-xs sm:text-sm">{cleanName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#6b5c54] block font-bold uppercase tracking-wider">ফোন নম্বর</span>
                    <span className="font-mono font-bold text-[#2a1f1a] text-xs sm:text-sm">{cleanPhone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#6b5c54] block font-bold uppercase tracking-wider">তারিখ ও সময়</span>
                    <span className="font-bold text-amber-700 text-xs sm:text-sm">৩০ জুন ২০২৬, সকাল ১১:৩০</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#6b5c54] block font-bold uppercase tracking-wider">নির্ধারিত আসন ({parsedBlockId} ব্লক)</span>
                    <span className="font-bold text-emerald-700 text-xs sm:text-sm">{seatLabels || successTicket.seats} ({successTicket.seats}টি আসন)</span>
                  </div>
                  <div className="col-span-2 border-t border-[#e3dbcc]/60 pt-3">
                    <span className="text-[9px] text-[#6b5c54] block font-bold uppercase tracking-wider">পেমেন্ট ও রেফারেন্স (৳{successBlock.price * successTicket.seats})</span>
                    <span className="font-bold text-[#2a1f1a] text-[11px] sm:text-xs">{paymentDetails}</span>
                  </div>
                </div>

                {/* Decorative cutouts */}
                <div className="flex items-center gap-2 my-2">
                  <div className="w-5 h-5 rounded-full bg-[#fbf9f4] -ml-7 sm:-ml-9 border-r border-[#e3dbcc]"></div>
                  <div className="flex-1 border-t border-dashed border-[#e3dbcc]"></div>
                  <div className="w-5 h-5 rounded-full bg-[#fbf9f4] -mr-7 sm:-mr-9 border-l border-[#e3dbcc]"></div>
                </div>

                {/* QR Code section */}
                <div className="flex items-center justify-between bg-[#fbf9f4] p-3 sm:p-4 rounded-xl border border-[#e3dbcc]">
                  <div>
                    <span className="text-[9px] text-[#6b5c54] block font-bold">ডিজিটাল টিকিট আইডি</span>
                    <code className="text-[10px] font-mono font-bold text-[#851b2e]">{successTicket.id}</code>
                    <p className="text-[9px] text-amber-700 font-bold mt-1.5">* হল প্রবেশের সময় এই কিউআর দেখান।</p>
                  </div>
                  
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white p-1 rounded-lg flex items-center justify-center shadow-md border border-[#e3dbcc]">
                    <svg className="w-full h-full text-black" viewBox="0 0 100 100">
                      <rect x="5" y="5" width="25" height="25" fill="currentColor"/>
                      <rect x="10" y="10" width="15" height="15" fill="white"/>
                      <rect x="5" y="70" width="25" height="25" fill="currentColor"/>
                      <rect x="10" y="75" width="15" height="15" fill="white"/>
                      <rect x="70" y="5" width="25" height="25" fill="currentColor"/>
                      <rect x="75" y="10" width="15" height="15" fill="white"/>
                      <rect x="40" y="15" width="10" height="10" fill="currentColor"/>
                      <rect x="55" y="5" width="10" height="15" fill="currentColor"/>
                      <rect x="45" y="45" width="20" height="20" fill="currentColor"/>
                      <rect x="75" y="45" width="15" height="10" fill="currentColor"/>
                      <rect x="15" y="45" width="10" height="20" fill="currentColor"/>
                      <rect x="40" y="75" width="25" height="10" fill="currentColor"/>
                      <rect x="80" y="75" width="15" height="15" fill="currentColor"/>
                      <rect x="55" y="90" width="10" height="5" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 max-w-xl mx-auto w-full px-4">
              <button 
                onClick={() => window.print()} 
                className="btn-glass text-xs flex-1 justify-center py-3 border-[#e3dbcc] hover:bg-black/5 text-[#2a1f1a] cursor-pointer animate-fade-in"
              >
                <Download size={14} />
                <span>প্রিন্ট করুন</span>
              </button>
              <button 
                onClick={() => setSuccessTicket(null)} 
                className="btn-primary text-xs flex-1 justify-center py-3 bg-[#851b2e] hover:bg-[#851b2e]/90 border-0 cursor-pointer text-white"
              >
                <span>নতুন টিকিট বুক করুন</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Right Column: Seat Plan Grid selector - Renders FIRST on mobile for better usability */}
            <div className="order-1 lg:order-2 lg:col-span-7 flex flex-col justify-center w-full">
              <div className="p-4 sm:p-6 md:p-8 border border-[#e3dbcc] bg-[#fcfaf4] rounded-3xl shadow-md text-center space-y-6 w-full relative">
                
                {/* Visual Stage representing Classic Royal Spotlight */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-4/5 h-2.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent rounded-full blur-[0.5px] shadow-[0_4px_15px_#d4af37]"></div>
                  <span className="text-[9px] text-[#851b2e] font-black uppercase tracking-widest mt-2">মঞ্চ / STAGE</span>
                </div>

                <div className="text-left border-b border-[#e3dbcc]/75 pb-3">
                  <h3 className="text-xs sm:text-sm font-black text-[#851b2e] uppercase tracking-wider">২. আসন লেআউট ({currentBlock.name})</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">এই ব্লকের যেকোনো ফাঁকা চেয়ারে ক্লিক করে আপনার নির্দিষ্ট সিট রিজার্ভেশন নিশ্চিত করুন।</p>
                </div>

                {/* Seat Selector Grid Container */}
                <div className="overflow-x-auto w-full py-2 flex justify-start sm:justify-center scrollbar-thin">
                  <div className="min-w-max px-3 space-y-3 flex flex-col items-center">
                    {currentBlock.rows.map(row => (
                      <div key={row.rowName} className="flex items-center gap-2">
                        {/* Row Identifier Left */}
                        <span className="w-7 text-right font-black text-xs text-[#851b2e] font-mono mr-1 sm:mr-2">{row.rowName}</span>
                        
                        {/* Seat Row Grid - Styled as crimson velvet cinema seats */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {row.seats.map((seatId) => {
                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            
                            const displayLabel = seatId.replace(/^[a-zA-Z]/, '');

                            let seatClass = 'bg-white border-[#851b2e]/30 text-[#851b2e] hover:border-[#851b2e] hover:bg-[#851b2e]/5 cursor-pointer shadow-sm';
                            if (isBooked) {
                              seatClass = 'bg-zinc-200 border-zinc-300 text-zinc-400 cursor-not-allowed';
                            } else if (isSelected) {
                              seatClass = 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600 text-white font-extrabold scale-105 shadow-[0_0_10px_rgba(16,185,129,0.45)] cursor-pointer';
                            }

                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isBooked || checkoutStep === 2}
                                onClick={() => handleSeatClick(seatId)}
                                className={`w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-t-lg rounded-b-sm border-b-2 text-[8px] sm:text-xs font-bold font-mono flex items-center justify-center transition-all ${seatClass}`}
                                title={isBooked ? `Seat ${seatId} is Booked` : `Seat ${seatId}`}
                              >
                                {displayLabel}
                              </button>
                            );
                          })}
                        </div>

                        {/* Row Identifier Right */}
                        <span className="w-7 text-left font-black text-xs text-[#851b2e] font-mono ml-1 sm:ml-2">{row.rowName}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seat Selector Legend */}
                <div className="flex flex-wrap justify-center gap-4 border-t border-[#e3dbcc] pt-4 text-[10px] font-bold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-t-md rounded-b-sm bg-white border border-[#851b2e]/30"></span>
                    <span>ফাঁকা আসন</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-t-md rounded-b-sm bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]"></span>
                    <span>আপনার পছন্দ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-t-md rounded-b-sm bg-zinc-200 border border-zinc-300"></span>
                    <span>বুকড আসন</span>
                  </div>
                </div>

                {/* Selection Details text display */}
                {selectedSeats.length > 0 && (
                  <div className="bg-[#851b2e]/5 p-3.5 rounded-2xl border border-[#e3dbcc] text-xs space-y-1 animate-fade-in text-left">
                    <p className="text-[#851b2e] font-bold">
                      নির্বাচিত আসনসমূহ ({selectedBlockId} ব্লক): <span className="text-emerald-700 font-extrabold">{selectedSeats.join(', ')}</span>
                    </p>
                    <p className="text-[10px] text-amber-700 font-bold">
                      * অনুগ্রহ করে সিটের নম্বরগুলো টিকিট বুকিংয়ের পর হল গেটে টিকিট দেখাতে সংরক্ষণ করে রাখবেন।
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Left/Middle Column: Form & Info Summary - Renders SECOND on mobile */}
            <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-between space-y-6 w-full">
              
              {/* Header Info */}
              <div className="space-y-2.5 text-left hidden lg:block border-b border-[#e3dbcc] pb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#851b2e]/5 text-[10px] font-extrabold text-[#851b2e] border border-[#851b2e]/10">
                  <Sparkles size={12} className="text-[#d4af37]" />
                  <span>টিকিট রিজার্ভেশন</span>
                </span>
                <h2 className="text-3xl font-extrabold text-[#851b2e] leading-tight font-display">ডিজিটাল টিকিট পোর্টাল</h2>
                <p className="text-xs text-[#6b5c54] font-semibold leading-relaxed">
                  নাটক ও নাট্যতত্ত্ব বিভাগ কর্তৃক আয়োজিত "রক্তকরবী" নাটকের প্রবেশ টিকিট সংগ্রহ করুন। ডানপাশের গ্যালারি লেআউট থেকে আপনার ব্লক ও আসন নির্বাচন সম্পন্ন করুন।
                </p>
              </div>

              {/* Form Input Section */}
              <div className="p-4 sm:p-6 border border-[#e3dbcc] bg-[#fcfaf4] rounded-3xl shadow-md text-left w-full">
                {checkoutStep === 1 ? (
                  // STEP 1 DETAILS
                  <div className="space-y-5">
                    <div className="border-b border-[#e3dbcc] pb-2.5">
                      <h3 className="text-xs sm:text-sm font-bold text-[#851b2e] flex items-center gap-2">
                        <Users size={16} className="text-[#d4af37]" />
                        <span>ধাপ ১: গ্যালারি ব্লক ও আসন নির্বাচন</span>
                      </h3>
                    </div>
                    
                    {/* Visual Gallery Block Map */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-[#851b2e] uppercase tracking-wider block text-center">
                        🎭 হলের গ্যালারি ম্যাপ (জোন নির্বাচন করুন)
                      </label>
                      <div className="border border-[#e3dbcc]/80 p-3 sm:p-4 bg-[#fbf9f4] rounded-3xl space-y-4">
                        {/* Stage indicator */}
                        <div className="w-full flex flex-col items-center mb-1">
                          <div className="w-3/4 h-1.5 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent rounded-full blur-[0.5px]"></div>
                          <span className="text-[8px] text-[#851b2e] font-black tracking-widest mt-1">মঞ্চ / STAGE</span>
                        </div>

                        {/* Interactive Blocks List - Horizontal Swiper for Premium Minimalist Experience */}
                        <div className="flex gap-2.5 overflow-x-auto pb-2.5 px-1 scrollbar-none justify-start">
                          {blocks.map(block => {
                            const bookedCount = bookedSeats.filter(s => s.startsWith(block.id)).length;
                            const availableCount = block.totalSeats - bookedCount;
                            const isSelected = selectedBlockId === block.id;

                            return (
                              <button
                                key={block.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBlockId(block.id);
                                  setSelectedSeats([]);
                                }}
                                className={`shrink-0 px-4 py-3 rounded-full border text-xs font-bold transition-all cursor-pointer outline-none flex items-center gap-2.5 shadow-sm ${
                                  isSelected 
                                    ? 'bg-[#851b2e] text-white border-[#d4af37] ring-2 ring-[#d4af37]/35 scale-105' 
                                    : 'bg-white border-[#e3dbcc] text-[#2a1f1a] hover:border-[#851b2e]/60'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                  isSelected ? 'bg-[#d4af37] text-[#851b2e]' : 'bg-[#851b2e]/10 text-[#851b2e]'
                                }`}>
                                  {block.id}
                                </span>
                                <span className="whitespace-nowrap">{block.type} (৳{block.price})</span>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {availableCount} ফাঁকা
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Styled Summary Card (Instead of generic list) */}
                    <div className="bg-white p-4 rounded-xl border border-[#e3dbcc] space-y-3.5 shadow-sm text-xs">
                      <div className="flex flex-col gap-1.5 pb-2 border-b border-zinc-100">
                        <span className="text-[#6b5c54] font-bold">নির্ধারিত আসন ({selectedBlockId} ব্লক):</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedSeats.length > 0 ? (
                            selectedSeats.map(seat => (
                              <span key={seat} className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] shadow-sm animate-fade-in">
                                {seat}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 font-semibold italic">কোনো আসন নির্বাচিত নয়</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[#6b5c54] font-bold">মোট আসন সংখ্যা:</span>
                        <span className="font-extrabold text-[#2a1f1a]">{selectedSeats.length} টি</span>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 border-t border-zinc-100">
                        <span className="text-[#6b5c54] font-bold">টিকিট মূল্য (৳{currentBlock.price} × {selectedSeats.length}):</span>
                        <span className="font-black text-[#851b2e] text-sm sm:text-base">৳{selectedSeats.length * currentBlock.price}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCheckoutStep(2)}
                      disabled={selectedSeats.length === 0}
                      className="btn-primary w-full justify-center py-3.5 bg-gradient-to-r from-[#851b2e] to-[#a0223a] text-white font-extrabold text-sm border-0 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-[#851b2e]/10 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>পরবর্তী ধাপে যান (পেমেন্ট)</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ) : (
                  // STEP 2 DETAILS (Payment details & inputs)
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#e3dbcc] pb-2">
                      <h3 className="text-xs sm:text-sm font-bold text-[#851b2e] flex items-center gap-2">
                        <Users size={16} className="text-emerald-700" />
                        <span>ধাপ ২: পেমেন্ট ও দর্শক বিবরণ</span>
                      </h3>
                      <button
                        onClick={() => setCheckoutStep(1)}
                        className="text-[10px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-0.5 bg-transparent border-0 cursor-pointer"
                      >
                        <ArrowLeft size={12} />
                        <span>সিট পরিবর্তন</span>
                      </button>
                    </div>

                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                        {error}
                      </div>
                    )}

                    {/* bKash/Nagad Send Money numbers */}
                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 space-y-2">
                      <p className="text-[11px] text-[#2a1f1a] font-extrabold text-center">
                        বিকাশ বা নগদে মোট <span className="text-[#851b2e] text-xs font-black">৳{selectedSeats.length * currentBlock.price}</span> টাকা 'Send Money' করুন:
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-center text-xs pt-1">
                        <div className="bg-white p-2.5 rounded-lg border border-[#e3dbcc] shadow-sm">
                          <span className="block text-[9px] text-[#ff7979] font-black">bKash (Personal)</span>
                          <span className="font-mono font-bold text-[#2a1f1a]">01712345678</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-[#e3dbcc] shadow-sm">
                          <span className="block text-[9px] text-orange-600 font-black">Nagad (Personal)</span>
                          <span className="font-mono font-bold text-[#2a1f1a]">01712345678</span>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      <div className="form-group mb-0">
                        <label className="form-label flex items-center gap-1 text-[11px] font-bold text-[#6b5c54] mb-1.5">
                          <span>দর্শকের নাম</span>
                          <span className="text-[#ff7979]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="আপনার নাম লিখুন"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="form-input text-xs py-2.5 px-3 bg-white border border-[#e3dbcc] rounded-xl outline-none w-full !text-[#2a1f1a] font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="form-group mb-0">
                          <label className="form-label flex items-center gap-1 text-[11px] font-bold text-[#6b5c54] mb-1.5">
                            <span>মোবাইল নম্বর</span>
                            <span className="text-[#ff7979]">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="০১XXXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-input text-xs py-2.5 px-3 bg-white border border-[#e3dbcc] rounded-xl outline-none w-full !text-[#2a1f1a] font-semibold"
                          />
                        </div>

                        <div className="form-group mb-0">
                          <label className="form-label flex items-center gap-1 text-[11px] font-bold text-[#6b5c54] mb-1.5">
                            <span>ইমেইল এড্রেস</span>
                            <span className="text-[#ff7979]">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input text-xs py-2.5 px-3 bg-white border border-[#e3dbcc] rounded-xl outline-none w-full !text-[#2a1f1a] font-semibold"
                          />
                        </div>
                      </div>

                      {/* Payment Inputs */}
                      <div className="bg-white p-4 rounded-xl border border-[#e3dbcc] space-y-3">
                        <span className="block text-[10px] font-black text-[#6b5c54] uppercase tracking-wider border-b border-[#e3dbcc]/50 pb-1.5">পেমেন্ট ভেরিফিকেশন</span>
                        
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('bkash')}
                            className={`flex-1 text-center py-2 text-xs font-black rounded-lg border transition-all cursor-pointer ${paymentMethod === 'bkash' ? 'bg-[#ff7979]/10 text-[#ff7979] border-[#ff7979]' : 'bg-transparent text-gray-400 border-[#e3dbcc]'}`}
                          >
                            bKash (বিকাশ)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('nagad')}
                            className={`flex-1 text-center py-2 text-xs font-black rounded-lg border transition-all cursor-pointer ${paymentMethod === 'nagad' ? 'bg-orange-50 text-orange-600 border-orange-500' : 'bg-transparent text-gray-400 border-[#e3dbcc]'}`}
                          >
                            Nagad (নগদ)
                          </button>
                        </div>

                        <div className="form-group mb-0">
                          <label className="form-label text-[10px] font-bold text-[#6b5c54] mb-1">যে নম্বর থেকে টাকা পাঠিয়েছেন</label>
                          <input
                            type="tel"
                            required
                            placeholder="০১XXXXXXXXX"
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            className="form-input text-xs py-2.5 px-3 bg-white border border-[#e3dbcc] rounded-xl w-full outline-none font-semibold !text-[#2a1f1a]"
                          />
                        </div>

                        <div className="form-group mb-0">
                          <label className="form-label text-[10px] font-bold text-[#6b5c54] mb-1">Transaction ID (TrxID)</label>
                          <input
                            type="text"
                            required
                            placeholder="TrxID (যেমন: BK29X8Z10)"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="form-input text-xs py-2.5 px-3 bg-white border border-[#e3dbcc] rounded-xl w-full outline-none font-mono font-bold uppercase !text-[#2a1f1a]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center py-3.5 mt-2 bg-gradient-to-r from-[#851b2e] to-[#a0223a] text-white font-extrabold text-sm border-0 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md shadow-[#851b2e]/10 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>টিকিট বুকিং সম্পন্ন করুন</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Promo Rules Banner */}
              <div className="hidden lg:block space-y-3 bg-[#fcfaf4] p-5 rounded-2xl border border-[#e3dbcc] shadow-sm">
                <div className="flex gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[#851b2e]/5 border border-[#851b2e]/10 flex items-center justify-center text-[#851b2e] shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2a1f1a]">ডিজিটাল প্রবেশ পাস</h4>
                    <p className="text-[10px] text-[#6b5c54] mt-0.5">সবাইর জন্য আসন সীমিত। অনুগ্রহ করে বুকিং নিশ্চিত করার পর কিউআর কোডটি ফোনে স্ক্রিনশট বা ডাউনলোড করে হল গেটে প্রদর্শন করবেন।</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
