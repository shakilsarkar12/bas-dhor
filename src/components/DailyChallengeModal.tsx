import React from 'react';
import { X, Calendar, CheckCircle2, Flame, Award } from 'lucide-react';
import type { DailyChallenge } from '../types/game';
import { sounds } from '../services/sound';

interface DailyChallengeModalProps {
  challenge: DailyChallenge;
  onClose: () => void;
  onPlay: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ challenge, onClose, onPlay }) => {
  const meterPercent = Math.min(100, Math.round((challenge.progressMeters / challenge.targetMeters) * 100));
  const coinPercent = Math.min(100, Math.round((challenge.progressCoins / challenge.targetCoins) * 100));
  const busPercent = Math.min(100, Math.round((challenge.progressBuses / challenge.targetBuses) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-amber-400" size={24} />
            <h2 className="text-xl font-black font-bengali text-amber-400">
              ডেইলি চ্যালেঞ্জ (দৈনিক মিশন)
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playSlide();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Challenge Box */}
        <div className="bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 border border-amber-500/40 rounded-2xl p-4 mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black mb-2">
            <Flame size={14} className="text-orange-400" /> আজকের তারিখ: {challenge.dateStr}
          </div>
          <h3 className="text-lg font-black font-bengali text-white mb-1">
            {challenge.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-bengali">
            {challenge.description}
          </p>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3 mb-5 font-bengali text-xs">
          {/* Distance */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>দৌড়ের লক্ষ্যমাত্রা</span>
              <span className="font-bold text-emerald-400">{challenge.progressMeters} / {challenge.targetMeters} মিটার</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${meterPercent}%` }}
              />
            </div>
          </div>

          {/* Coins */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>কয়েন সংগ্রহ</span>
              <span className="font-bold text-amber-400">{challenge.progressCoins} / {challenge.targetCoins} টি</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${coinPercent}%` }}
              />
            </div>
          </div>

          {/* Bus */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>সঠিক বাসে ওঠা</span>
              <span className="font-bold text-blue-400">{challenge.progressBuses} / {challenge.targetBuses} বার</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${busPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Completion status */}
        {challenge.isCompleted ? (
          <div className="bg-emerald-600/30 border border-emerald-500 rounded-2xl p-3 text-center mb-4 flex items-center justify-center gap-2 text-emerald-300 font-bengali font-bold text-sm">
            <CheckCircle2 size={20} /> আপনি আজকের মিশন সম্পূর্ণ করেছেন! সম্মাননা ব্যাজ অর্জিত!
          </div>
        ) : (
          <div className="bg-slate-800/60 p-3 rounded-2xl text-center mb-4 text-xs text-slate-400 font-bengali flex items-center justify-center gap-2">
            <Award size={18} className="text-amber-400" /> মিশন পূরণ করলে বিশেষ ডেইলির খেতাব পাওয়া যাবে!
          </div>
        )}

        <button
          onClick={() => {
            sounds.playJump();
            onPlay();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black rounded-2xl shadow-xl font-bengali text-base active:scale-95 transition-all"
        >
          মিশনে নামো! 🚀
        </button>
      </div>
    </div>
  );
};
