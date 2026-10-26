import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { sounds } from '../services/sound';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onHowToPlay: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onHome,
  onHowToPlay,
  isMuted,
  onToggleSound
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl text-center flex flex-col gap-4">
        {/* Title */}
        <div>
          <div className="text-3xl mb-1">⏸️</div>
          <h2 className="text-2xl font-black font-bengali text-amber-400">
            খেলা বিরতি (Paused)
          </h2>
          <p className="text-xs text-slate-400 font-bengali mt-0.5">
            একটু জিরিয়ে নিয়ে আবার বাসের পেছনে দৌড়াও!
          </p>
        </div>

        {/* Buttons List */}
        <div className="flex flex-col gap-2.5 font-bengali">
          <button
            onClick={() => {
              sounds.playJump();
              onResume();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-slate-950 font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 text-base transition-all"
          >
            <Play size={20} /> চালিয়ে যাও (Resume)
          </button>

          <button
            onClick={() => {
              sounds.playSlide();
              onRestart();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <RotateCcw size={18} /> নতুন করে খেলো (Restart)
          </button>

          <button
            onClick={onToggleSound}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-sm transition-all"
          >
            {isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-emerald-400" />}
            {isMuted ? 'শব্দ চালু করো (Unmute)' : 'শব্দ বন্ধ করো (Mute)'}
          </button>

          <button
            onClick={onHowToPlay}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <HelpCircle size={18} /> নিয়মাবলী (How to Play)
          </button>

          <button
            onClick={() => {
              sounds.playSlide();
              onHome();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-rose-300 font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <Home size={18} /> হোমে ফিরে যাও
          </button>
        </div>
      </div>
    </div>
  );
};
