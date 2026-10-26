import React from 'react';
import type { ScoreRecord } from '../types/game';
import { RotateCcw, Home, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../services/sound';
import { MemeScoreCard } from './MemeScoreCard';

interface GameOverScreenProps {
  record: ScoreRecord;
  isNewBest: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  record,
  isNewBest,
  onRestart,
  onHome
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 my-auto">
        {/* Game Over Image & Meme Badge */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-lg">
          <img
            src="/game_over_mud.jpg"
            alt="কাদায় পড়ে পরাজিত অফিসকর্মী"
            className="w-full h-44 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-black/60 px-2.5 py-0.5 rounded-full inline-block self-start font-bengali">
              দেরি হয়ে গেল!
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-bengali text-amber-300 drop-shadow">
              বস, আজকে আর অফিস যাওয়া হলো না!
            </h2>
          </div>
        </div>

        {/* New High Score Alert */}
        {isNewBest && (
          <div className="bg-gradient-to-r from-amber-500 to-rose-500 text-white p-2.5 rounded-xl text-center font-black text-sm flex items-center justify-center gap-2 font-bengali shadow-lg animate-bounce">
            <Trophy size={18} /> নতুন সর্বকালের সেরা রেকর্ড! অভিনন্দন বস! <Sparkles size={18} />
          </div>
        )}

        {/* Viral Meme Score Card */}
        <MemeScoreCard record={record} isNewBest={isNewBest} />

        {/* Bottom Navigation Buttons */}
        <div className="flex gap-3 font-bengali pt-1">
          <button
            onClick={() => {
              sounds.playJump();
              onRestart();
            }}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-base transition-all"
          >
            <RotateCcw size={20} /> আবার খেলো 🏃‍♂️
          </button>

          <button
            onClick={() => {
              sounds.playSlide();
              onHome();
            }}
            className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5 text-sm transition-all"
          >
            <Home size={18} /> হোম
          </button>
        </div>
      </div>
    </div>
  );
};
