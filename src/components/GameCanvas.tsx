import React, { useRef, useEffect, useState, useCallback } from 'react';
import type {
  Player,
  Obstacle,
  Collectible,
  SpeechBubble,
  BusOption,
  StageConfig,
  ScoreRecord,
  ObstacleType
} from '../types/game';
import { ThreeGameScene } from '../services/threeScene';
import { STAGES, FUNNY_QUOTES, generateRunResult } from '../services/stageConfig';
import { sounds } from '../services/sound';
import { StorageService } from '../services/storage';
import { GameHUD } from './GameHUD';
import { MobileControls } from './MobileControls';
import { PauseMenu } from './PauseMenu';
import { GameOverScreen } from './GameOverScreen';
import { BusInteriorMinigame } from './BusInteriorMinigame';
import confetti from 'canvas-confetti';

interface GameCanvasProps {
  onHome: () => void;
  onHowToPlay: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onHome, onHowToPlay }) => {
  const threeContainerRef = useRef<HTMLDivElement | null>(null);
  const speechCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const threeSceneRef = useRef<ThreeGameScene | null>(null);

  // High-level game states
  const [gameState, setGameState] = useState<
    'RUNNING' | 'PAUSED' | 'BUS_INTERIOR' | 'GAME_OVER'
  >('RUNNING');

  // Stats for HUD and Game Over
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [currentStage, setCurrentStage] = useState<StageConfig>(STAGES[1]);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [lastRecord, setLastRecord] = useState<ScoreRecord | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Player state reference for fast game loop without re-render lag
  const playerRef = useRef<Player>({
    x: 0,
    y: 0,
    lane: 1, // Start in Center lane
    targetLane: 1,
    jumpY: 0,
    jumpVy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    lives: 3,
    maxLives: 3,
    isInvincible: false,
    invincibleTimer: 0,
    hasUmbrella: false,
    umbrellaTimer: 0,
    hasTeaBoost: false,
    teaBoostTimer: 0,
    mudStained: false,
    state: 'RUNNING'
  });

  // State refs for animation loop
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const speechBubblesRef = useRef<SpeechBubble[]>([]);
  const busOptionsRef = useRef<BusOption[] | null>(null);

  const statsRef = useRef({
    score: 0,
    distance: 0,
    coins: 0,
    busesCaught: 0,
    wrongBuses: 0,
    slips: 0,
    stageReached: 1,
    combo: 0
  });

  const targetDestination = 'মতিঝিল (অফিস)';
  const lastTimeRef = useRef<number>(0);
  const nextObstacleDistanceRef = useRef<number>(25);
  const nextCollectibleDistanceRef = useRef<number>(15);
  const busStopTriggeredRef = useRef<boolean>(false);
  const interiorMinigameTriggeredRef = useRef<boolean>(false);

  // Helper to trigger floating Bengali speech bubbles
  const addSpeechBubble = useCallback((text: string, sender: 'PLAYER' | 'HELPER' = 'PLAYER') => {
    speechBubblesRef.current.push({
      id: Math.random(),
      text,
      sender,
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.42,
      life: 2.8,
      maxLife: 2.8
    });
  }, []);

  // Screen shake on collision
  const triggerScreenShake = () => {
    setScreenShake(true);
    threeSceneRef.current?.triggerImpactShake();
    setTimeout(() => setScreenShake(false), 300);
  };

  // 1. Controls
  const handleLeft = useCallback(() => {
    const p = playerRef.current;
    if (p.targetLane > 0) {
      p.targetLane -= 1;
      sounds.playSlide();
    }
  }, []);

  const handleRight = useCallback(() => {
    const p = playerRef.current;
    if (p.targetLane < 2) {
      p.targetLane += 1;
      sounds.playSlide();
    }
  }, []);

  const handleJump = useCallback(() => {
    const p = playerRef.current;
    if (!p.isJumping) {
      p.isJumping = true;
      p.jumpVy = 480; // Upward velocity
      p.state = 'JUMPING';
      sounds.playJump();
    }
  }, []);

  const handleSlide = useCallback(() => {
    const p = playerRef.current;
    if (!p.isSliding) {
      p.isSliding = true;
      p.slideTimer = 0.7; // Slide duration
      p.state = 'SLIDING';
      sounds.playSlide();
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'RUNNING') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.code === 'Space') {
        e.preventDefault();
        handleJump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSlide();
      } else if (e.key === 'Escape') {
        setGameState('PAUSED');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handleLeft, handleRight, handleJump, handleSlide]);

  // Touch Swipe Gesture handler
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        if (dx > 0) handleRight();
        else handleLeft();
      } else {
        if (dy < 0) handleJump();
        else handleSlide();
      }
    }
    touchStartRef.current = null;
  };

  // Restart function
  const restartGame = useCallback(() => {
    playerRef.current = {
      x: 0,
      y: 0,
      lane: 1,
      targetLane: 1,
      jumpY: 0,
      jumpVy: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      lives: 3,
      maxLives: 3,
      isInvincible: false,
      invincibleTimer: 0,
      hasUmbrella: false,
      umbrellaTimer: 0,
      hasTeaBoost: false,
      teaBoostTimer: 0,
      mudStained: false,
      state: 'RUNNING'
    };

    obstaclesRef.current = [];
    collectiblesRef.current = [];
    speechBubblesRef.current = [];
    busOptionsRef.current = null;

    statsRef.current = {
      score: 0,
      distance: 0,
      coins: 0,
      busesCaught: 0,
      wrongBuses: 0,
      slips: 0,
      stageReached: 1,
      combo: 0
    };

    setScore(0);
    setDistance(0);
    setCoins(0);
    setCurrentStage(STAGES[1]);
    nextObstacleDistanceRef.current = 25;
    nextCollectibleDistanceRef.current = 15;
    busStopTriggeredRef.current = false;
    interiorMinigameTriggeredRef.current = false;

    setGameState('RUNNING');
    sounds.playBusHorn();
    addSpeechBubble('আজকে আর লেট করা যাবে না! দৌড়াও!');
  }, [addSpeechBubble]);

  // Initial setup & start quote
  useEffect(() => {
    sounds.playBusHorn();
    addSpeechBubble('দেরি হয়ে গেছে, বস! এবার দৌড়াও!');
  }, [addSpeechBubble]);

  // Mount Three.js 3D Scene
  useEffect(() => {
    const container = threeContainerRef.current;
    if (!container) return;

    const threeScene = new ThreeGameScene(container);
    threeSceneRef.current = threeScene;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      threeScene.resize(rect.width, rect.height);

      const canvas = speechCanvasRef.current;
      if (canvas) {
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      threeScene.destroy();
      threeSceneRef.current = null;
    };
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      if (gameState === 'RUNNING') {
        updateGame(dt);
      }

      renderGame(dt);
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  // Logic Updates
  const updateGame = (dt: number) => {
    const p = playerRef.current;
    const stats = statsRef.current;

    // 1. Stage Progression by Distance
    let stageId: 1 | 2 | 3 | 4 | 5 | 6 = 1;
    if (stats.distance >= 1800) stageId = 6;
    else if (stats.distance >= 1400) stageId = 5;
    else if (stats.distance >= 950) stageId = 4;
    else if (stats.distance >= 600) stageId = 3;
    else if (stats.distance >= 250) stageId = 2;

    if (currentStage.id !== stageId) {
      setCurrentStage(STAGES[stageId]);
      stats.stageReached = Math.max(stats.stageReached, stageId);
      sounds.playVictory();
      addSpeechBubble(`${STAGES[stageId].name}!`, 'HELPER');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.2 } });
    }

    // 2. Base Speed and Distance scaling
    const baseSpeed = 260 * currentStage.speedMultiplier * (p.hasTeaBoost ? 1.4 : 1.0);
    const speed = baseSpeed;
    const metersCovered = (speed * dt) / 10;
    stats.distance += metersCovered;
    stats.score += Math.round(metersCovered * 10 * (1 + stats.combo * 0.1));

    setDistance(Math.floor(stats.distance));
    setScore(stats.score);

    // 3. Jump Physics
    if (p.isJumping) {
      p.jumpY += p.jumpVy * dt;
      p.jumpVy -= 1400 * dt; // Gravity
      if (p.jumpY <= 0) {
        p.jumpY = 0;
        p.jumpVy = 0;
        p.isJumping = false;
        p.state = p.isSliding ? 'SLIDING' : 'RUNNING';
      }
    }

    // 4. Slide Timer
    if (p.isSliding) {
      p.slideTimer -= dt;
      if (p.slideTimer <= 0) {
        p.isSliding = false;
        p.state = p.isJumping ? 'JUMPING' : 'RUNNING';
      }
    }

    // 5. Powerup Timers
    if (p.hasTeaBoost) {
      p.teaBoostTimer -= dt;
      if (p.teaBoostTimer <= 0) p.hasTeaBoost = false;
    }
    if (p.hasUmbrella) {
      p.umbrellaTimer -= dt;
      if (p.umbrellaTimer <= 0) p.hasUmbrella = false;
    }
    if (p.isInvincible) {
      p.invincibleTimer -= dt;
      if (p.invincibleTimer <= 0) p.isInvincible = false;
    }

    // 6. Check Stage 5 Bus Interior Minigame Trigger
    if (stageId === 5 && !interiorMinigameTriggeredRef.current) {
      interiorMinigameTriggeredRef.current = true;
      setGameState('BUS_INTERIOR');
      return;
    }

    // 7. Bus Stop Choice Event (Level 3 or every 700m)
    if (stageId === 3 && !busStopTriggeredRef.current && stats.distance >= 700) {
      busStopTriggeredRef.current = true;
      triggerBusStopEvent();
    }

    // 8. Spawn Obstacles
    if (stats.distance >= nextObstacleDistanceRef.current && !busOptionsRef.current) {
      spawnObstacle();
      nextObstacleDistanceRef.current = stats.distance + (20 + Math.random() * 22) / currentStage.speedMultiplier;
    }

    // 9. Spawn Collectibles
    if (stats.distance >= nextCollectibleDistanceRef.current) {
      spawnCollectible();
      nextCollectibleDistanceRef.current = stats.distance + (12 + Math.random() * 18);
    }

    // 10. Move Obstacles & Handle Collisions
    const currentObstacles = obstaclesRef.current;
    for (let i = currentObstacles.length - 1; i >= 0; i--) {
      const obs = currentObstacles[i];
      obs.y += speed * dt;

      // Check collision with player (player position around y = 450)
      const dy = Math.abs(obs.y - 450);
      const isSameLane = obs.lane === p.targetLane;

      if (!obs.collided && isSameLane && dy < 35) {
        let avoids = false;

        // Can jump over POTHOLE, MUD
        if (p.isJumping && p.jumpY > 25 && (obs.type === 'POTHOLE' || obs.type === 'MUD')) {
          avoids = true;
        }

        // Can slide under BAMBOO
        if (p.isSliding && obs.type === 'BAMBOO') {
          avoids = true;
        }

        if (avoids) {
          if (!obs.passed) {
            obs.passed = true;
            stats.combo += 1;
            stats.score += 150;
            const nearMissQuote = FUNNY_QUOTES.nearMiss[Math.floor(Math.random() * FUNNY_QUOTES.nearMiss.length)];
            addSpeechBubble(nearMissQuote);
            sounds.playCoin(stats.combo);
          }
        } else {
          obs.collided = true;
          handleCollision(obs);
        }
      }

      // Cleanup passed obstacles
      if (obs.y > 600) {
        currentObstacles.splice(i, 1);
      }
    }

    // 11. Move Collectibles & Handle Pickups
    const currentCollectibles = collectiblesRef.current;
    for (let i = currentCollectibles.length - 1; i >= 0; i--) {
      const col = currentCollectibles[i];
      col.y += speed * dt;

      const dy = Math.abs(col.y - 450);
      const isSameLane = col.lane === p.targetLane;

      if (!col.collected && isSameLane && dy < 40) {
        col.collected = true;
        handleCollect(col);
      }

      if (col.y > 600) {
        currentCollectibles.splice(i, 1);
      }
    }

    // 12. Update Speech Bubbles
    const bubbles = speechBubblesRef.current;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.life -= dt;
      if (b.life <= 0) bubbles.splice(i, 1);
    }
  };

  // Spawn Obstacle
  const spawnObstacle = () => {
    const lane = Math.floor(Math.random() * 3);
    const availableTypes = currentStage.obstacleTypes;
    const type: ObstacleType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    obstaclesRef.current.push({
      id: Math.random(),
      type,
      lane,
      y: 0,
      width: 1.5,
      height: 1.5,
      speed: 0,
      passed: false,
      collided: false
    });
  };

  // Spawn Collectible
  const spawnCollectible = () => {
    const lane = Math.floor(Math.random() * 3);
    const rand = Math.random();
    let type: 'COIN' | 'TEA' | 'UMBRELLA' = 'COIN';

    if (rand > 0.9) type = 'TEA';
    else if (rand > 0.82) type = 'UMBRELLA';

    collectiblesRef.current.push({
      id: Math.random(),
      type,
      lane,
      y: 0,
      collected: false,
      value: type === 'COIN' ? 1 : 5
    });
  };

  // Collision Logic
  const handleCollision = (obs: Obstacle) => {
    const p = playerRef.current;
    const stats = statsRef.current;
    stats.combo = 0;

    if (p.hasTeaBoost) {
      sounds.playCrash();
      triggerScreenShake();
      addSpeechBubble('চা খেয়ে সুপারম্যান! সব পরিষ্কার!', 'PLAYER');
      return;
    }

    if (p.hasUmbrella) {
      p.hasUmbrella = false;
      p.isInvincible = true;
      p.invincibleTimer = 1.6;
      sounds.playCrash();
      triggerScreenShake();
      addSpeechBubble('ছাতা ভেঙে গেল, কিন্তু জীবন বাঁচল!', 'PLAYER');
      return;
    }

    if (p.isInvincible) return;

    if (obs.type === 'MUD') {
      stats.slips += 1;
      p.mudStained = true;
      sounds.playMudSplash();
      triggerScreenShake();
      const quote = FUNNY_QUOTES.mudSlip[Math.floor(Math.random() * FUNNY_QUOTES.mudSlip.length)];
      addSpeechBubble(quote, 'PLAYER');
      damagePlayer();
      return;
    }

    sounds.playCrash();
    triggerScreenShake();
    addSpeechBubble('আহারে! ধাক্কা লেগে গেল!', 'PLAYER');
    damagePlayer();
  };

  const damagePlayer = () => {
    const p = playerRef.current;
    p.lives -= 1;
    p.isInvincible = true;
    p.invincibleTimer = 1.8;

    if (p.lives <= 0) {
      handleGameOver();
    }
  };

  const handleCollect = (col: Collectible) => {
    const p = playerRef.current;
    const stats = statsRef.current;

    if (col.type === 'COIN') {
      stats.coins += col.value;
      stats.score += 200;
      setCoins(stats.coins);
      sounds.playCoin(stats.combo);
    } else if (col.type === 'TEA') {
      p.hasTeaBoost = true;
      p.teaBoostTimer = 6.0;
      stats.score += 500;
      sounds.playTeaBoost();
      addSpeechBubble('গরম চায়ের কাপ! বুলেট স্পিড!', 'PLAYER');
    } else if (col.type === 'UMBRELLA') {
      p.hasUmbrella = true;
      p.umbrellaTimer = 12.0;
      stats.score += 300;
      sounds.playVictory();
      addSpeechBubble('ছাতা পেয়েছি! বৃষ্টি ও কাদা থেকে রক্ষা!', 'PLAYER');
    }
  };

  const triggerBusStopEvent = () => {
    const correctLane = Math.floor(Math.random() * 3);
    const wrongDestinations = ['গাজীপুর', 'কুমিল্লা', 'মিরপুর'];

    const options: BusOption[] = [0, 1, 2].map((lane) => {
      const isCorrect = lane === correctLane;
      return {
        id: lane,
        lane,
        destination: isCorrect ? 'মতিঝিল (অফিস)' : wrongDestinations[lane % wrongDestinations.length],
        busName: isCorrect ? 'বলাকা পরিবহন' : 'বিকল্প পরিবহন',
        isCorrect,
        color: isCorrect ? '#27ae60' : '#e67e22',
        accentColor: isCorrect ? '#f1c40f' : '#3498db',
        shout: isCorrect ? 'মতিঝিল ডাইরেক্ট! উইঠা পড়েন!' : 'গাজীপুর! গাজীপুর!'
      };
    });

    busOptionsRef.current = options;
    sounds.playBusHorn();
    addSpeechBubble('সামনে ৩টি ৩ডি বাস! মতিঝিলের বাসে উঠুন!', 'HELPER');

    setTimeout(() => {
      const p = playerRef.current;
      const chosen = options.find((b) => b.lane === p.targetLane);
      if (chosen && chosen.isCorrect) {
        statsRef.current.busesCaught += 1;
        statsRef.current.score += 2000;
        sounds.playVictory();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
        addSpeechBubble('মতিঝিল ডাইরেক্ট! সাবাশ বস!', 'HELPER');
      } else {
        statsRef.current.wrongBuses += 1;
        sounds.playCrash();
        triggerScreenShake();
        addSpeechBubble('হায় হায়! ভুল বাসে উঠে গেছেন!', 'HELPER');
        damagePlayer();
      }
      busOptionsRef.current = null;
    }, 4500);
  };

  const handleInteriorComplete = (success: boolean) => {
    if (success) {
      statsRef.current.score += 2500;
      statsRef.current.busesCaught += 1;
      setGameState('RUNNING');
      addSpeechBubble('মতিঝিল দরজায় পৌঁছে গেছি! নামলাম রে ভাই!', 'PLAYER');
      sounds.playVictory();
    } else {
      damagePlayer();
      setGameState('RUNNING');
    }
  };

  const handleGameOver = () => {
    setGameState('GAME_OVER');
    sounds.playGameOver();

    const stats = statsRef.current;
    const { title, comment } = generateRunResult({
      score: stats.score,
      distance: Math.floor(stats.distance),
      coins: stats.coins,
      busesCaught: stats.busesCaught,
      wrongBuses: stats.wrongBuses,
      stageReached: stats.stageReached,
      slips: stats.slips
    });

    const playerName = StorageService.getPlayerName();
    const { isNewBest, record } = StorageService.saveRun({
      name: playerName,
      score: stats.score,
      distance: Math.floor(stats.distance),
      coins: stats.coins,
      busesCaught: stats.busesCaught,
      wrongBuses: stats.wrongBuses,
      stageReached: stats.stageReached,
      title,
      comment
    });

    StorageService.updateDailyChallenge(stats.distance, stats.coins, stats.busesCaught);

    setLastRecord(record);
    setIsNewBest(isNewBest);
  };

  // Render 3D and 2D speech bubble overlay
  const renderGame = (dt: number) => {
    if (threeSceneRef.current) {
      threeSceneRef.current.update(
        playerRef.current,
        obstaclesRef.current,
        collectiblesRef.current,
        busOptionsRef.current,
        currentStage,
        280 * currentStage.speedMultiplier,
        dt
      );
    }

    // Draw comic speech bubbles on 2D overlay
    const canvas = speechCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = Math.min(window.devicePixelRatio, 2);

    speechBubblesRef.current.forEach((b) => {
      const alpha = Math.min(1, b.life / 0.5);
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.globalAlpha = alpha;

      ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
      const textMetrics = ctx.measureText(b.text);
      const textW = textMetrics.width;
      const padX = 16;
      const padY = 9;
      const bw = textW + padX * 2;
      const bh = 32 + padY;

      const screenW = canvas.width / dpr;
      const bx = screenW / 2 - bw / 2;
      const by = 130;

      // Bubble drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(bx + 3, by + 3, bw, bh, 10);
      ctx.fill();

      // Bubble Body
      ctx.fillStyle = b.sender === 'HELPER' ? '#f39c12' : '#ffffff';
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 10);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2 - 8, by + bh);
      ctx.lineTo(bx + bw / 2, by + bh + 10);
      ctx.lineTo(bx + bw / 2 + 8, by + bh);
      ctx.fillStyle = b.sender === 'HELPER' ? '#f39c12' : '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = b.sender === 'HELPER' ? '#ffffff' : '#1e272e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.text, bx + bw / 2, by + bh / 2);

      ctx.restore();
    });
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden select-none touch-none ${
        screenShake ? 'animate-shake' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Three.js Container */}
      <div
        ref={threeContainerRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={() => {
          if (gameState === 'RUNNING') handleJump();
        }}
      />

      {/* 2D Comic Speech Bubble Canvas Overlay */}
      <canvas
        ref={speechCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* HUD Bar */}
      <GameHUD
        score={score}
        distance={distance}
        coins={coins}
        player={playerRef.current}
        currentStage={currentStage}
        targetDestination={targetDestination}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onPause={() => setGameState('PAUSED')}
      />

      {/* Mobile Virtual Controls */}
      <div className="z-30 mt-auto">
        <MobileControls
          onLeft={handleLeft}
          onRight={handleRight}
          onJump={handleJump}
          onSlide={handleSlide}
        />
      </div>

      {/* Bus Interior Minigame Modal */}
      {gameState === 'BUS_INTERIOR' && (
        <BusInteriorMinigame onComplete={handleInteriorComplete} />
      )}

      {/* Pause Menu Modal */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={() => setGameState('RUNNING')}
          onRestart={restartGame}
          onHome={onHome}
          onHowToPlay={onHowToPlay}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && lastRecord && (
        <GameOverScreen
          record={lastRecord}
          isNewBest={isNewBest}
          onRestart={restartGame}
          onHome={onHome}
        />
      )}
    </div>
  );
};
