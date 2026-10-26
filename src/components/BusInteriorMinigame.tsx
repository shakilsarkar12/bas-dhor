import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../services/sound';
import { ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BusInteriorMinigameProps {
  onComplete: (success: boolean) => void;
}

export const BusInteriorMinigame: React.FC<BusInteriorMinigameProps> = ({ onComplete }) => {
  const [balance, setBalance] = useState(50); // 0 to 100, 50 is center
  const [timeLeft, setTimeLeft] = useState(10);
  const [dialogue, setDialogue] = useState('ভাই একটু সামনে আগান! গেটের মুখ ছাড়েন!');
  const [isBraking, setIsBraking] = useState(false);
  const [status, setStatus] = useState<'PLAYING' | 'SUCCESS' | 'FAILED'>('PLAYING');

  const balanceRef = useRef(balance);
  balanceRef.current = balance;
  const statusRef = useRef(status);
  statusRef.current = status;

  const dialogues = [
    'ভাই একটু সামনে আগান! পেছনে তো সিট খালি!',
    'সিট নাই তবুও উঠছেন কেন ভাই!',
    'কড়া ব্রেক মারবে! হ্যান্ডেল শক্ত করে ধরেন!',
    'আমার পায়ের উপর পড়বেন না ভাই!',
    'মতিঝিল এসে গেছে! দরজার দিকে আগান!'
  ];

  // Game loop for bus shaking & braking physics
  useEffect(() => {
    sounds.playBusHorn();

    // Sudden braking events
    const brakeInterval = setInterval(() => {
      if (statusRef.current !== 'PLAYING') return;
      setIsBraking(true);
      sounds.playBrakeScreech();
      // Sudden violent impulse
      const impulse = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 15);
      setBalance((b) => Math.max(0, Math.min(100, b + impulse)));

      const randomQuote = dialogues[Math.floor(Math.random() * dialogues.length)];
      setDialogue(randomQuote);

      setTimeout(() => setIsBraking(false), 900);
    }, 2400);

    // Physics drift interval (natural bus wobble)
    const driftInterval = setInterval(() => {
      if (statusRef.current !== 'PLAYING') return;
      const drift = (Math.random() - 0.5) * 6;
      setBalance((b) => {
        const next = b + drift;
        if (next <= 5 || next >= 95) {
          // Failed balance
          setStatus('FAILED');
          sounds.playCrash();
          setTimeout(() => onComplete(false), 1500);
          return next;
        }
        return next;
      });
    }, 100);

    // 10s countdown timer
    const countdown = setInterval(() => {
      if (statusRef.current !== 'PLAYING') return;
      setTimeLeft((t) => {
        if (t <= 1) {
          setStatus('SUCCESS');
          sounds.playVictory();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
          setTimeout(() => onComplete(true), 2000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (statusRef.current !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        adjustBalance(-8);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        adjustBalance(8);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(brakeInterval);
      clearInterval(driftInterval);
      clearInterval(countdown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const adjustBalance = (delta: number) => {
    setBalance((b) => Math.max(5, Math.min(95, b + delta)));
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/90 flex flex-col items-center justify-between p-4 sm:p-6 backdrop-blur-md animate-fade-in select-none">
      {/* Top Banner */}
      <div className="w-full max-w-md bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-4 text-center text-white shadow-2xl border-2 border-amber-300/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase tracking-wider font-extrabold bg-black/30 px-3 py-1 rounded-full">
            লেভেল ৫ মিনিগেম
          </span>
          <span className="text-sm font-black text-amber-200">
            বাকি: {timeLeft} সেকেন্ড
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-bengali tracking-wide drop-shadow">
          বাসের ভেতরের যুদ্ধ!
        </h2>
        <p className="text-xs sm:text-sm text-amber-100 font-medium">
          কড়া ব্রেক মারলে ব্যালেন্স হারিয়ে পড়বেন না! হ্যান্ডেল ধরে থাকুন!
        </p>
      </div>

      {/* Crowded Bus Visual Scene */}
      <div className="relative w-full max-w-md h-64 bg-slate-800 rounded-3xl overflow-hidden border-4 border-slate-700 shadow-inner flex flex-col justify-between p-4">
        {/* Overhead bus Grab Bars */}
        <div className="relative w-full flex justify-around">
          <div className="w-full h-3 bg-yellow-400 rounded-full shadow" />
          <div className="absolute top-3 flex justify-between w-4/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-2.5 h-12 bg-yellow-600 rounded-b-xl animate-bounce"
                style={{
                  animationDuration: `${1.2 + i * 0.2}s`,
                  transform: isBraking ? 'rotate(25deg)' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Shaking alert */}
        {isBraking && (
          <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center animate-pulse z-10">
            <div className="bg-red-600 text-white font-black text-lg px-6 py-2 rounded-xl shadow-xl flex items-center gap-2">
              <ShieldAlert className="animate-spin text-yellow-300" /> কড়া ব্রেক! ব্যালেন্স রাখুন!
            </div>
          </div>
        )}

        {/* Funny Passenger Dialogue Bubble */}
        <div className="relative z-20 self-center bg-white/95 text-slate-900 px-4 py-2 rounded-2xl shadow-xl border-2 border-amber-500 font-bengali font-bold text-center text-sm sm:text-base max-w-[85%] animate-bounce">
          {dialogue}
        </div>

        {/* Balance Tilt Meter */}
        <div className="w-full bg-slate-900/90 rounded-2xl p-3 border border-slate-600 shadow-2xl">
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-1 font-bengali">
            <span className="text-red-400">বামে কাত</span>
            <span className="text-green-400 font-black">নিরাপদ জোন</span>
            <span className="text-red-400">ডানে কাত</span>
          </div>

          <div className="relative w-full h-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
            {/* Center Safe Zone */}
            <div className="absolute top-0 bottom-0 left-[30%] right-[30%] bg-green-500/30 border-x-2 border-green-400" />

            {/* Danger Zones */}
            <div className="absolute top-0 bottom-0 left-0 w-[15%] bg-red-600/40" />
            <div className="absolute top-0 bottom-0 right-0 w-[15%] bg-red-600/40" />

            {/* Balance Indicator Pointer */}
            <div
              className="absolute top-0 bottom-0 w-4 bg-amber-400 border-2 border-white rounded-md shadow-lg transition-all duration-75 ease-out transform -translate-x-1/2"
              style={{ left: `${balance}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Announcements */}
      {status === 'SUCCESS' && (
        <div className="bg-emerald-600 text-white font-black text-xl px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce font-bengali">
          <CheckCircle2 size={28} /> মতিঝিল পৌঁছে গেছেন! সাবাশ বস! (+২৫০০)
        </div>
      )}

      {status === 'FAILED' && (
        <div className="bg-rose-600 text-white font-black text-lg px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-pulse font-bengali">
          ব্যালেন্স হারিয়ে অন্যের কোলে পড়ে গেলেন!
        </div>
      )}

      {/* Control Buttons for Mobile / Mouse */}
      <div className="w-full max-w-md flex gap-4">
        <button
          onClick={() => adjustBalance(-14)}
          className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 active:scale-95 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 font-bengali border-b-4 border-indigo-900"
        >
          <ArrowLeft size={24} /> বামে সামলান
        </button>
        <button
          onClick={() => adjustBalance(14)}
          className="flex-1 py-4 bg-gradient-to-r from-indigo-700 to-blue-600 active:scale-95 text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 font-bengali border-b-4 border-indigo-900"
        >
          ডানে সামলান <ArrowRight size={24} />
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center font-bengali">
        কীবোর্ডে <kbd className="bg-slate-700 px-2 py-0.5 rounded text-white font-mono">←</kbd> এবং <kbd className="bg-slate-700 px-2 py-0.5 rounded text-white font-mono">→</kbd> চেপেও ব্যালেন্স করা যায়।
      </p>
    </div>
  );
};
