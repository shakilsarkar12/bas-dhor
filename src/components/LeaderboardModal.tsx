import React, { useState } from 'react';
import { X, Trophy, User, Medal } from 'lucide-react';
import type { ScoreRecord } from '../types/game';
import { StorageService } from '../services/storage';
import { sounds } from '../services/sound';

interface LeaderboardModalProps {
  onClose: () => void;
  onSelectRecord?: (record: ScoreRecord) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [history, setHistory] = useState<ScoreRecord[]>(StorageService.getScoreHistory());
  const [playerName, setPlayerName] = useState(StorageService.getPlayerName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      StorageService.setPlayerName(tempName.trim());
      setPlayerName(tempName.trim());
      setIsEditingName(false);
      sounds.playCoin(1);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('আপনি কি সব পুরনো স্কোরের ইতিহাস মুছে ফেলতে চান?')) {
      localStorage.removeItem('bus_dhor_boss_score_history');
      setHistory([]);
      sounds.playCrash();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 flex flex-col justify-between max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={24} />
            <h2 className="text-xl font-black font-bengali text-amber-400">
              সেরা দৌড়বিদদের তালিকা (হল অব ফেম)
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

        {/* Player Name Card */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <User size={18} />
            </div>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-slate-900 border border-amber-500 rounded-lg px-2.5 py-1 text-xs text-white outline-none font-bengali"
                  maxLength={15}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded-lg text-xs font-bengali"
                >
                  সংরক্ষণ
                </button>
              </form>
            ) : (
              <div>
                <div className="text-[10px] text-slate-400 font-bengali">আপনার নাম</div>
                <div className="text-sm font-black text-white font-bengali">{playerName}</div>
              </div>
            )}
          </div>
          {!isEditingName && (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs text-amber-400 hover:underline font-bengali font-bold"
            >
              বদলান
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-bengali text-sm">
              এখনও কোনো রান রেকর্ড নেই! <br />
              খেলা শুরু করো এবং ইতিহাস গড়ো! 🏃
            </div>
          ) : (
            history.map((rec, idx) => (
              <div
                key={rec.id}
                className="bg-slate-800/50 hover:bg-slate-800 p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-500 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-900'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {idx < 3 ? <Medal size={14} /> : idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-black text-white font-bengali flex items-center gap-1.5">
                      <span>{rec.name}</span>
                      <span className="text-[10px] text-amber-300 font-normal px-1.5 py-0.5 rounded bg-amber-500/10">
                        {rec.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bengali">
                      {rec.distance} মিটার • {rec.coins} ৳ • {rec.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-amber-400 font-mono">
                    {rec.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-400">পয়েন্ট</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-rose-400 hover:text-rose-300 font-bengali"
            >
              রেকর্ড মুছুন
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto py-2 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs font-bengali"
          >
            বন্ধ করো
          </button>
        </div>
      </div>
    </div>
  );
};
