import React from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';
import { sounds } from '../services/sound';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚌</span>
            <h2 className="text-xl sm:text-2xl font-black font-bengali text-amber-400">
              কীভাবে খেলবেন? — গেম গাইড
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

        {/* Story Intro */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 mb-4 text-xs sm:text-sm font-bengali text-amber-200">
          <strong>গল্প:</strong> সকাল ৯টায় মতিঝিলে জরুরি মিটিং! কিন্তু ঘুম ভাঙতেই দেরি হয়ে গেছে। এখন ঢাকার ভাঙা রাস্তা, কাদা, রিকশা আর তীব্র জ্যামের মধ্য দিয়ে দৌড়ে লোকাল বাস ধরতে হবে!
        </div>

        {/* Controls Section */}
        <div className="space-y-3 mb-4">
          <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider font-bengali">
            🎮 নিয়ন্ত্রণ (Controls)
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs font-bengali">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <ArrowUp size={18} />
              </div>
              <div>
                <div className="font-black text-white">লাফ (Jump)</div>
                <div className="text-slate-400 text-[11px]">Space / ↑ তীর / টাচ বাটন</div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
              <div className="bg-amber-600 p-2 rounded-lg text-white">
                <ArrowDown size={18} />
              </div>
              <div>
                <div className="font-black text-white">ডাইভিং (Slide)</div>
                <div className="text-slate-400 text-[11px]">↓ তীর / সোয়াইপ ডাউন</div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
              <div className="bg-emerald-600 p-2 rounded-lg text-white">
                <ArrowLeft size={18} />
              </div>
              <div>
                <div className="font-black text-white">বামের লেন</div>
                <div className="text-slate-400 text-[11px]">← তীর / A বাটন</div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center gap-2.5">
              <div className="bg-teal-600 p-2 rounded-lg text-white">
                <ArrowRight size={18} />
              </div>
              <div>
                <div className="font-black text-white">ডানের লেন</div>
                <div className="text-slate-400 text-[11px]">→ তীর / D বাটন</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Themed Stages */}
        <div className="space-y-2 mb-4">
          <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider font-bengali">
            🏙️ ৫টি রোমাঞ্চকর লেভেল
          </h3>

          <div className="space-y-1.5 text-xs font-bengali">
            <div className="bg-slate-800/50 p-2 rounded-lg border-l-4 border-amber-500">
              <strong className="text-amber-300">লেভেল ১: কাদার রাস্তা</strong> — গর্ত ও কাদার ছিটকা বাঁচিয়ে লাফাও।
            </div>
            <div className="bg-slate-800/50 p-2 rounded-lg border-l-4 border-emerald-500">
              <strong className="text-emerald-300">লেভেল ২: জ্যামের শহর</strong> — রঙিন রিকশা ও সবুজ সিএনজি কাটিয়ে লেন বদলাও।
            </div>
            <div className="bg-slate-800/50 p-2 rounded-lg border-l-4 border-blue-500">
              <strong className="text-blue-300">লেভেল ৩: হেলপারের ডাক</strong> — বাসের গন্তব্য দেখে মতিঝিলের সঠিক বাসে ওঠো! ভুল বাসে উঠলে কুমিল্লা চলে যাবে!
            </div>
            <div className="bg-slate-800/50 p-2 rounded-lg border-l-4 border-cyan-500">
              <strong className="text-cyan-300">লেভেল ৪: বৃষ্টির দিন</strong> — মুষলধারে বৃষ্টি আর পিচ্ছিল সড়ক! ছাতা দিয়ে রক্ষা পাও।
            </div>
            <div className="bg-slate-800/50 p-2 rounded-lg border-l-4 border-rose-500">
              <strong className="text-rose-300">লেভেল ৫: বাসের ভেতরের যুদ্ধ</strong> — ভিড়ে ঠাসা বাসে কড়া ব্রেক মারলে ব্যালেন্স টিকিয়ে রেখে দরজায় নামো!
            </div>
          </div>
        </div>

        {/* Powerups & Tips */}
        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 mb-4">
          <h4 className="text-xs font-bold text-amber-300 mb-1.5 font-bengali flex items-center gap-1.5">
            <Sparkles size={14} /> বিশেষ পাওয়ার-আপ
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-bengali">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Zap className="text-yellow-400" size={14} /> <strong>গরম চা:</strong> বুলেট স্পিড ও অপরাজেয় শক্তি!
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Shield className="text-cyan-400" size={14} /> <strong>ছাতা:</strong> কাদা ও ১টি ধাক্কা থেকে বাঁচায়!
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playJump();
            onClose();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black rounded-2xl shadow-xl font-bengali text-base active:scale-95 transition-all"
        >
          বুঝেছি, এবার দৌড়াও! 🏃‍♂️
        </button>
      </div>
    </div>
  );
};
