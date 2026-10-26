import React, { useRef, useState } from 'react';
import type { ScoreRecord } from '../types/game';
import { Download, Share2, Copy, Check, Trophy, Sparkles } from 'lucide-react';
import { sounds } from '../services/sound';

interface MemeScoreCardProps {
  record: ScoreRecord;
  isNewBest: boolean;
  onClose?: () => void;
}

export const MemeScoreCard: React.FC<MemeScoreCardProps> = ({ record, isNewBest }) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate downloadable PNG
  const handleDownload = async () => {
    setIsGenerating(true);
    sounds.playCoin(3);

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Background Gradient (Vibrant Dhaka colors)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#1e272e');
    bgGrad.addColorStop(0.5, '#2f3542');
    bgGrad.addColorStop(1, '#ff4757');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative Bangladeshi Rickshaw Art Border
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1020, 1020);

    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, 984, 984);

    // Top Header Banner
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.roundRect(80, 70, 920, 110, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('বাস ধর, বস! — Bus Dhôr, Boss!', 540, 146);

    // Subtitle
    ctx.fillStyle = '#ffeaa7';
    ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
    ctx.fillText('দেরি হয়ে গেছে, বস! এবার দৌড়াও!', 540, 225);

    // Player Name & Title Badge
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Hind Siliguri", sans-serif';
    ctx.fillText(`যাত্রীর নাম: ${record.name}`, 540, 290);

    // Funny Title Plaque
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.roundRect(140, 320, 800, 90, 20);
    ctx.fill();

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
    ctx.fillText(`“${record.title}”`, 540, 380);

    // Stat Boxes
    const drawStatBox = (x: number, y: number, label: string, val: string, color: string) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.roundRect(x, y, 420, 110, 16);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#dfe6e9';
      ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 30, y + 45);

      ctx.fillStyle = color;
      ctx.font = 'bold 46px "Outfit", sans-serif';
      ctx.fillText(val, x + 30, y + 92);
    };

    drawStatBox(100, 440, 'মোট স্কোর', record.score.toLocaleString(), '#f1c40f');
    drawStatBox(560, 440, 'অতিক্রান্ত দূরত্ব', `${record.distance} মিটার`, '#2ecc71');
    drawStatBox(100, 580, 'কুড়ানো কয়েন', `৳ ${record.coins}`, '#e67e22');
    drawStatBox(560, 580, 'বাসে ওঠা সফল', `${record.busesCaught} টি`, '#3498db');

    // Funny Relatable Quote Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(100, 720, 880, 180, 20);
    ctx.fill();
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    
    // Split long commentary into two lines if needed
    const words = record.comment.split(' ');
    let line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    let line2 = words.slice(Math.ceil(words.length / 2)).join(' ');

    ctx.fillText(`“${line1}`, 540, 790);
    ctx.fillText(`${line2}”`, 540, 840);

    // Footer info
    ctx.fillStyle = '#ffeaa7';
    ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
    ctx.fillText('ঢাকার রাস্তায় তুমিও কি বাস ধরতে পারবে? এখনই খেলো!', 540, 950);

    ctx.fillStyle = '#74b9ff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('বাস ধর, বস! | Bus Dhôr, Boss!', 540, 990);

    // Trigger download
    const link = document.createElement('a');
    link.download = `bus_dhor_boss_${record.name}_${record.score}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsGenerating(false);
  };

  // Native Web Share API
  const handleShare = async () => {
    sounds.playRickshawBell();
    const shareText = `🚌 আমি "বাস ধর, বস!" খেলায় ${record.score.toLocaleString()} স্কোর আর ${record.distance} মিটার পার করে “${record.title}” উপাধি পেয়েছি! তুমি কি আমার রেকর্ড ভাঙতে পারবে?`;
    const shareUrl = window.location.origin + window.location.pathname + `?score=${record.score}&challenger=${encodeURIComponent(record.name)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'বাস ধর, বস! — গেম স্কোর চ্যালেঞ্জ',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(shareText + ' ' + shareUrl);
      }
    } else {
      copyToClipboard(shareText + ' ' + shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    sounds.playCoin(1);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-3xl p-5 border-2 border-amber-500/50 shadow-2xl backdrop-blur-md">
      {/* Top Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-400" size={24} />
          <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
            ভাইরাল স্কোর কার্ড
          </span>
        </div>
        {isNewBest && (
          <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow flex items-center gap-1 animate-pulse">
            <Sparkles size={12} /> নতুন হাই স্কোর!
          </span>
        )}
      </div>

      {/* Meme Card Visual Preview */}
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/40 p-4 rounded-2xl border border-amber-400/30 text-center relative overflow-hidden mb-4 shadow-inner">
        <div className="absolute top-2 right-2 text-4xl opacity-15 select-none">🚌</div>
        <div className="text-xs font-bold text-amber-400 font-bengali">
          {record.name} এর আজকের ফলাফল
        </div>
        <div className="text-xl sm:text-2xl font-black text-white font-bengali mt-1 text-amber-200">
          “{record.title}”
        </div>

        <div className="grid grid-cols-2 gap-2 my-3 text-left">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <div className="text-xs text-slate-400 font-bengali">মোট স্কোর</div>
            <div className="text-lg font-black text-amber-400 font-mono">
              {record.score.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <div className="text-xs text-slate-400 font-bengali">দূরত্ব</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              {record.distance} মি.
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-amber-100 font-bengali bg-black/40 p-2.5 rounded-xl border border-amber-500/20 italic">
          “{record.comment}”
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-slate-950 font-black rounded-xl shadow-lg flex items-center justify-center gap-2 font-bengali transition-all"
        >
          <Download size={18} />
          {isGenerating ? 'ছবি তৈরি হচ্ছে...' : 'কার্ড ডাউনলোড করো (PNG)'}
        </button>

        <button
          onClick={handleShare}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 font-bengali transition-all"
        >
          <Share2 size={18} /> বন্ধুদের শেয়ার করো
        </button>

        <button
          onClick={() => {
            const shareUrl = window.location.origin + window.location.pathname + `?score=${record.score}&challenger=${encodeURIComponent(record.name)}`;
            copyToClipboard(shareUrl);
          }}
          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all text-xs"
          title="চ্যালেঞ্জ লিংক কপি"
        >
          {copied ? <Check className="text-emerald-400" size={18} /> : <Copy size={18} />}
          <span>{copied ? 'কপি হয়েছে!' : 'লিংক'}</span>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
