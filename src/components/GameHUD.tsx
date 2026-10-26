import React from 'react';
import { Heart, Volume2, VolumeX, Pause, Shield, Zap, Target } from 'lucide-react';
import type { StageConfig, Player } from '../types/game';

interface GameHUDProps {
  score: number;
  distance: number;
  coins: number;
  player: Player;
  currentStage: StageConfig;
  targetDestination: string;
  isMuted: boolean;
  onToggleSound: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  distance,
  coins,
  player,
  currentStage,
  targetDestination,
  isMuted,
  onToggleSound,
  onPause
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 z-30 pointer-events-none select-none flex flex-col gap-2">
      {/* Top Main Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Lives & Powerups */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 pointer-events-auto shadow-lg">
          <div className="flex gap-1 mr-1">
            {Array.from({ length: player.maxLives }).map((_, i) => (
              <Heart
                key={i}
                size={18}
                className={i < player.lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-600'}
              />
            ))}
          </div>

          {/* Active Powerup Badges */}
          {player.hasUmbrella && (
            <div className="flex items-center gap-1 bg-cyan-600/30 text-cyan-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-cyan-400 font-bengali">
              <Shield size={12} /> ছাতা
            </div>
          )}

          {player.hasTeaBoost && (
            <div className="flex items-center gap-1 bg-amber-600/30 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-400 font-bengali animate-pulse">
              <Zap size={12} /> চা বুস্ট!
            </div>
          )}
        </div>

        {/* Center Stage & Objective Banner */}
        <div className="flex-1 max-w-xs text-center hidden sm:block">
          <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-2xl border border-amber-500/40 shadow-lg inline-block">
            <div className="text-[11px] font-black text-amber-400 font-bengali">
              {currentStage.name}
            </div>
            <div className="text-[10px] text-slate-300 font-bengali flex items-center justify-center gap-1">
              <Target size={11} className="text-emerald-400" /> টার্গেট: <span className="text-emerald-300 font-bold">{targetDestination}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Sound & Pause */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onToggleSound}
            className="w-9 h-9 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={18} className="text-rose-400" /> : <Volume2 size={18} className="text-emerald-400" />}
          </button>

          <button
            onClick={onPause}
            className="w-9 h-9 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg active:scale-90 transition-transform font-bold"
            aria-label="Pause Game"
          >
            <Pause size={18} />
          </button>
        </div>
      </div>

      {/* Stats Counter Bar (Score, Distance, Coins) */}
      <div className="flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-xl max-w-md mx-auto w-full">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-bengali">স্কোর</span>
          <span className="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight leading-none">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Distance */}
        <div className="flex flex-col text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-bengali">দূরত্ব</span>
          <span className="text-sm sm:text-base font-black text-emerald-400 font-mono leading-none">
            {distance} <span className="text-[10px] font-normal text-slate-300 font-bengali">মি.</span>
          </span>
        </div>

        {/* Coins */}
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-bengali">কয়েন</span>
          <span className="text-sm sm:text-base font-black text-yellow-300 font-mono leading-none">
            ৳ {coins}
          </span>
        </div>
      </div>

      {/* Mobile Stage label */}
      <div className="sm:hidden text-center">
        <span className="bg-slate-950/80 text-[10px] font-bold text-amber-300 font-bengali px-2.5 py-0.5 rounded-full border border-amber-500/30">
          {currentStage.name} • গন্তব্য: {targetDestination}
        </span>
      </div>
    </div>
  );
};
