import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide
}) => {
  return (
    <div className="w-full flex items-center justify-between px-4 pb-4 pt-2 pointer-events-auto select-none touch-none">
      {/* Left / Right Steering Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onLeft();
          }}
          onClick={(e) => {
            e.preventDefault();
            onLeft();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900/85 active:bg-blue-600 border-2 border-slate-600 active:border-blue-400 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-md transition-transform active:scale-90 font-bengali"
          aria-label="Move Left"
        >
          <ArrowLeft size={24} />
          <span className="text-[10px] font-bold">বামে</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onRight();
          }}
          onClick={(e) => {
            e.preventDefault();
            onRight();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900/85 active:bg-blue-600 border-2 border-slate-600 active:border-blue-400 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-md transition-transform active:scale-90 font-bengali"
          aria-label="Move Right"
        >
          <ArrowRight size={24} />
          <span className="text-[10px] font-bold">ডানে</span>
        </button>
      </div>

      {/* Action Buttons: Jump and Slide */}
      <div className="flex gap-2.5">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onSlide();
          }}
          onClick={(e) => {
            e.preventDefault();
            onSlide();
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-600/85 active:bg-amber-500 border-2 border-amber-400 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-md transition-transform active:scale-90 font-bengali"
          aria-label="Slide"
        >
          <ArrowDown size={24} />
          <span className="text-[10px] font-black">ডাইভিং</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-tr from-emerald-600 to-teal-500 active:from-emerald-500 active:to-teal-400 border-2 border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-white shadow-2xl backdrop-blur-md transition-transform active:scale-90 font-bengali"
          aria-label="Jump"
        >
          <ArrowUp size={28} />
          <span className="text-[11px] font-black tracking-wider">লাফাও!</span>
        </button>
      </div>
    </div>
  );
};
