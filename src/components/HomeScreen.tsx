import React, { useState, useEffect } from 'react';
import { Play, HelpCircle, Trophy, Calendar, Volume2, VolumeX, Sparkles, User } from 'lucide-react';
import { sounds } from '../services/sound';
import { StorageService } from '../services/storage';

interface HomeScreenProps {
  onStart: () => void;
  onHowToPlay: () => void;
  onLeaderboard: () => void;
  onDailyChallenge: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStart,
  onHowToPlay,
  onLeaderboard,
  onDailyChallenge,
  isMuted,
  onToggleSound
}) => {
  const [bestScore, setBestScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [bubbleIndex, setBubbleIndex] = useState(0);

  const bubbles = [
    '“আজকে আর লেট করা যাবে না!” 🏃',
    '“ভাই, একটু থামেন! আমি আসতেছি!” 🚌',
    '“মতিঝিল ডাইরেক্ট! সিট খালি নাই, তবুও ওঠেন!” 📢',
    '“বসের ফোন আসার আগেই বাসে উঠো!” ⏰'
  ];

  useEffect(() => {
    setBestScore(StorageService.getBestScore());
    setPlayerName(StorageService.getPlayerName());

    const interval = setInterval(() => {
      setBubbleIndex((prev) => (prev + 1) % bubbles.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 overflow-x-hidden select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-lg flex items-center justify-between z-20">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-500/30 shadow-lg">
          <User size={16} className="text-amber-400" />
          <span className="text-xs font-black text-amber-200 font-bengali">
            {playerName}
          </span>
          {bestScore > 0 && (
            <span className="text-xs text-emerald-400 font-mono font-bold border-l border-slate-700 pl-2">
              🏆 {bestScore.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={onToggleSound}
          className="w-10 h-10 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX size={20} className="text-rose-400" /> : <Volume2 size={20} className="text-emerald-400" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-lg flex flex-col items-center my-auto py-4 z-20">
        {/* Animated Dhaka Hero Banner */}
        <div className="relative w-full rounded-3xl overflow-hidden border-4 border-amber-500 shadow-2xl mb-4 group transform transition-all">
          <img
            src="/dhaka_bus_hero.jpg"
            alt="ঢাকার রাস্তায় বাস ধরার প্রাণান্তকর দৌড়"
            className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />

          {/* Vignette & Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
            {/* Dynamic Floating Dialogue Bubble */}
            <div className="self-start bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-2xl rounded-bl-none shadow-xl border-2 border-amber-500 font-bengali font-black text-xs sm:text-sm animate-bounce">
              {bubbles[bubbleIndex]}
            </div>
          </div>
        </div>

        {/* Game Title & Brand */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black mb-2 border border-amber-500/40">
            <Sparkles size={14} className="text-amber-400" /> ভাইরাল বাংলাদেশি ওয়েব গেম
          </div>

          <h1 className="text-4xl sm:text-5xl font-black font-bengali tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 drop-shadow-md">
            বাস ধর, বস!
          </h1>
          <p className="text-sm sm:text-base text-amber-200/90 font-bengali font-bold mt-1">
            “দেরি হয়ে গেছে, বস! এবার দৌড়াও!”
          </p>
        </div>

        {/* Primary Play Button */}
        <button
          onClick={() => {
            sounds.playBusHorn();
            onStart();
          }}
          className="w-full py-4 sm:py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 active:scale-95 text-slate-950 font-black rounded-3xl shadow-2xl border-2 border-amber-300/50 flex items-center justify-center gap-3 text-xl sm:text-2xl font-bengali transition-all duration-200 animate-pulse"
        >
          <Play size={28} className="fill-slate-950" /> খেলা শুরু করো! 🏃‍♂️
        </button>

        {/* Quick Menu Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full mt-4 font-bengali text-xs">
          <button
            onClick={() => {
              sounds.playSlide();
              onHowToPlay();
            }}
            className="py-3 px-2 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-200 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col items-center justify-center gap-1.5 transition-all font-bold"
          >
            <HelpCircle size={20} className="text-amber-400" />
            <span>কীভাবে খেলবে?</span>
          </button>

          <button
            onClick={() => {
              sounds.playSlide();
              onDailyChallenge();
            }}
            className="py-3 px-2 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-200 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col items-center justify-center gap-1.5 transition-all font-bold"
          >
            <Calendar size={20} className="text-emerald-400" />
            <span>ডেইলি মিশন</span>
          </button>

          <button
            onClick={() => {
              sounds.playSlide();
              onLeaderboard();
            }}
            className="py-3 px-2 bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-200 rounded-2xl border border-slate-700/80 shadow-lg flex flex-col items-center justify-center gap-1.5 transition-all font-bold"
          >
            <Trophy size={20} className="text-yellow-400" />
            <span>সেরা রেকর্ড</span>
          </button>
        </div>
      </div>

      {/* Footer Relatable Joke */}
      <div className="text-center text-[11px] text-slate-400 font-bengali z-20 py-2">
        ঢাকার যানজট ও লোকাল বাসের বাস্তব অভিজ্ঞতায় অনুপ্রাণিত • নো অ্যাপ ইনস্টলেশন
      </div>
    </div>
  );
};
