import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { GameCanvas } from './components/GameCanvas';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { StorageService } from './services/storage';
import { sounds } from './services/sound';
import type { DailyChallenge } from './types/game';
import { Flame } from 'lucide-react';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'HOME' | 'GAME'>('HOME');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge>(
    StorageService.getDailyChallenge()
  );

  // Social Challenge parameter detection (?score=...&challenger=...)
  const [challengeData, setChallengeData] = useState<{
    score: number;
    challenger: string;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scoreParam = params.get('score');
    const challengerParam = params.get('challenger');

    if (scoreParam && challengerParam) {
      setChallengeData({
        score: parseInt(scoreParam, 10),
        challenger: decodeURIComponent(challengerParam)
      });
    }
  }, []);

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleStartGame = () => {
    setCurrentScreen('GAME');
  };

  const handleReturnHome = () => {
    setCurrentScreen('HOME');
    setDailyChallenge(StorageService.getDailyChallenge());
  };

  return (
    <main className="w-full h-full min-h-screen bg-slate-950 flex justify-center items-center relative overflow-hidden">
      {/* Responsive Immersive Container */}
      <div
        className={`w-full h-full min-h-screen flex flex-col relative overflow-hidden bg-slate-950 transition-all duration-300 ${
          currentScreen === 'HOME'
            ? 'max-w-2xl mx-auto sm:border-x sm:border-amber-500/20 sm:shadow-2xl'
            : 'w-full'
        }`}
      >
        {/* Challenge Alert Toast if friend sent a challenge link */}
        {currentScreen === 'HOME' && challengeData && (
          <div className="absolute top-14 left-4 right-4 z-40 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-3 rounded-2xl shadow-2xl border-2 border-amber-300 text-white flex items-center justify-between font-bengali animate-bounce">
            <div className="flex items-center gap-2">
              <Flame className="text-yellow-300 animate-pulse" size={24} />
              <div className="text-xs">
                <span className="font-black text-amber-200">{challengeData.challenger}</span> আপনাকে চ্যালেঞ্জ করেছে!
                <div className="text-[11px] font-bold">তার স্কোর: {challengeData.score.toLocaleString()} পয়েন্ট! হারাতে পারবে?</div>
              </div>
            </div>
            <button
              onClick={() => setChallengeData(null)}
              className="text-xs bg-black/40 px-2 py-1 rounded-lg hover:bg-black/60"
            >
              ঠিক আছে
            </button>
          </div>
        )}

        {/* Screen Routing */}
        {currentScreen === 'HOME' ? (
          <HomeScreen
            onStart={handleStartGame}
            onHowToPlay={() => setShowHowToPlay(true)}
            onLeaderboard={() => setShowLeaderboard(true)}
            onDailyChallenge={() => setShowDailyChallenge(true)}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
          />
        ) : (
          <GameCanvas
            onHome={handleReturnHome}
            onHowToPlay={() => setShowHowToPlay(true)}
          />
        )}
      </div>

      {/* Modals (render full screen backdrop) */}

      {/* Modals */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {showDailyChallenge && (
        <DailyChallengeModal
          challenge={dailyChallenge}
          onClose={() => setShowDailyChallenge(false)}
          onPlay={() => {
            setShowDailyChallenge(false);
            handleStartGame();
          }}
        />
      )}
    </main>
  );
};

export default App;
