import React, { useRef, useEffect, useState, useCallback } from 'react';
import type {
  Player,
  Obstacle,
  Collectible,
  Particle,
  SpeechBubble,
  BusOption,
  StageConfig,
  ScoreRecord,
  ObstacleType
} from '../types/game';
import { CanvasRenderer } from '../services/canvasRenderer';
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  const particlesRef = useRef<Particle[]>([]);
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
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextObstacleDistanceRef = useRef<number>(30);
  const nextCollectibleDistanceRef = useRef<number>(20);
  const busStopTriggeredRef = useRef<boolean>(false);
  const interiorMinigameTriggeredRef = useRef<boolean>(false);

  // Helper to trigger floating Bengali speech bubbles
  const addSpeechBubble = useCallback((text: string, sender: 'PLAYER' | 'HELPER' = 'PLAYER') => {
    const p = playerRef.current;
    speechBubblesRef.current.push({
      id: Math.random(),
      text,
      sender,
      x: p.x,
      y: p.y - 45,
      life: 2.5,
      maxLife: 2.5
    });
  }, []);

  // Screen shake on collision
  const triggerScreenShake = () => {
    setScreenShake(true);
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
      p.jumpVy = 620; // Upward velocity
      p.state = 'JUMPING';
      sounds.playJump();
    }
  }, []);

  const handleSlide = useCallback(() => {
    const p = playerRef.current;
    if (!p.isSliding) {
      p.isSliding = true;
      p.slideTimer = 0.65; // Slide duration
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
        // Horizontal swipe
        if (dx > 0) handleRight();
        else handleLeft();
      } else {
        // Vertical swipe
        if (dy < 0) handleJump();
        else handleSlide();
      }
    }
    touchStartRef.current = null;
  };

  // Restart function
  const restartGame = useCallback(() => {
    const canvas = canvasRef.current;
    const laneW = canvas ? canvas.width / 3 : 130;

    playerRef.current = {
      x: laneW * 1.5,
      y: canvas ? canvas.height * 0.78 : 500,
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
    particlesRef.current = [];
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

  // Canvas Resizing & Renderer Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        rendererRef.current = new CanvasRenderer(ctx);
        rendererRef.current.resize(rect.width, rect.height);
      }

      // Position player at 78% height in center lane
      const laneW = rect.width / 3;
      playerRef.current.x = laneW * 1.5;
      playerRef.current.y = rect.height * 0.78;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05); // Cap dt
      lastTimeRef.current = time;

      if (gameState === 'RUNNING') {
        updateGame(dt);
      }

      renderGame();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  // Logic Updates
  const updateGame = (dt: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect?.width || 400;
    const h = rect?.height || 650;
    const laneW = w / 3;

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
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.2 } });
    }

    // 2. Base Speed and Distance scaling
    const baseSpeed = 280 * currentStage.speedMultiplier * (p.hasTeaBoost ? 1.4 : 1.0);
    const speed = baseSpeed;
    const metersCovered = (speed * dt) / 12; // 12 pixels = ~1 meter
    stats.distance += metersCovered;
    stats.score += Math.round(metersCovered * 10 * (1 + stats.combo * 0.1));

    setDistance(Math.floor(stats.distance));
    setScore(stats.score);

    // 3. Smooth Lane Interpolation (Lerping)
    const targetX = p.targetLane * laneW + laneW / 2;
    p.x += (targetX - p.x) * Math.min(dt * 14, 1);
    p.lane = p.targetLane;

    // 4. Jump Physics
    if (p.isJumping) {
      p.jumpY += p.jumpVy * dt;
      p.jumpVy -= 1600 * dt; // Gravity
      if (p.jumpY <= 0) {
        p.jumpY = 0;
        p.jumpVy = 0;
        p.isJumping = false;
        p.state = p.isSliding ? 'SLIDING' : 'RUNNING';

        // Spawn dust/mud particles on landing
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: p.x + (Math.random() - 0.5) * 20,
            y: p.y + 15,
            vx: (Math.random() - 0.5) * 80,
            vy: (Math.random() - 0.5) * 40,
            color: p.mudStained ? '#5d4037' : '#95a5a6',
            size: 3 + Math.random() * 3,
            life: 0.35,
            maxLife: 0.35,
            type: 'MUD'
          });
        }
      }
    }

    // 5. Slide Timer
    if (p.isSliding) {
      p.slideTimer -= dt;
      if (p.slideTimer <= 0) {
        p.isSliding = false;
        p.state = p.isJumping ? 'JUMPING' : 'RUNNING';
      }
    }

    // 6. Powerup Timers
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

    // 7. Check Stage 5 Bus Interior Minigame Trigger
    if (stageId === 5 && !interiorMinigameTriggeredRef.current) {
      interiorMinigameTriggeredRef.current = true;
      setGameState('BUS_INTERIOR');
      return;
    }

    // 8. Bus Stop Choice Event (Level 3 or every 700m)
    if (stageId === 3 && !busStopTriggeredRef.current && stats.distance >= 700) {
      busStopTriggeredRef.current = true;
      triggerBusStopEvent();
    }

    // 9. Spawn Obstacles
    if (stats.distance >= nextObstacleDistanceRef.current && !busOptionsRef.current) {
      spawnObstacle(laneW);
      nextObstacleDistanceRef.current = stats.distance + (18 + Math.random() * 22) / currentStage.speedMultiplier;
    }

    // 10. Spawn Collectibles
    if (stats.distance >= nextCollectibleDistanceRef.current) {
      spawnCollectible();
      nextCollectibleDistanceRef.current = stats.distance + (12 + Math.random() * 18);
    }

    // 11. Move Obstacles & Handle Collisions
    const currentObstacles = obstaclesRef.current;
    for (let i = currentObstacles.length - 1; i >= 0; i--) {
      const obs = currentObstacles[i];
      obs.y += speed * dt;

      // Check collision
      const obsX = obs.lane * laneW + laneW / 2;
      const dx = Math.abs(p.x - obsX);
      const dy = Math.abs(p.y - obs.y);

      if (!obs.collided && dx < laneW * 0.45 && dy < 35) {
        let avoids = false;

        // Can jump over POTHOLE, MUD, BRICKS
        if (p.isJumping && p.jumpY > 35 && (obs.type === 'POTHOLE' || obs.type === 'MUD' || obs.type === 'BRICKS')) {
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
          // Actual Collision
          obs.collided = true;
          handleCollision(obs);
        }
      }

      // Cleanup passed obstacles
      if (obs.y > h + 100) {
        currentObstacles.splice(i, 1);
      }
    }

    // 12. Move Collectibles & Handle Pickups
    const currentCollectibles = collectiblesRef.current;
    for (let i = currentCollectibles.length - 1; i >= 0; i--) {
      const col = currentCollectibles[i];
      col.y += speed * dt;

      const colX = col.lane * laneW + laneW / 2;
      const dx = Math.abs(p.x - colX);
      const dy = Math.abs(p.y - col.y);

      if (!col.collected && dx < laneW * 0.4 && dy < 40) {
        col.collected = true;
        handleCollect(col);
      }

      if (col.y > h + 50) {
        currentCollectibles.splice(i, 1);
      }
    }

    // 13. Update Bus Stop Decision (if active)
    if (busOptionsRef.current) {
      handleBusStopDecisionCheck(p);
    }

    // 14. Update Particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    // 15. Update Speech Bubbles
    const bubbles = speechBubblesRef.current;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.life -= dt;
      b.x = p.x;
      b.y = p.y - 45 - p.jumpY;
      if (b.life <= 0) bubbles.splice(i, 1);
    }
  };

  // Spawn Obstacle
  const spawnObstacle = (laneW: number) => {
    const lane = Math.floor(Math.random() * 3);
    const availableTypes = currentStage.obstacleTypes;
    const type: ObstacleType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    let width = laneW * 0.75;
    let height = 45;

    if (type === 'RICKSHAW') height = 55;
    if (type === 'CNG') height = 65;
    if (type === 'SLOW_BUS') height = 95;
    if (type === 'POTHOLE' || type === 'MUD') height = 30;

    obstaclesRef.current.push({
      id: Math.random(),
      type,
      lane,
      y: -height - 20,
      width,
      height,
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
      y: -30,
      collected: false,
      value: type === 'COIN' ? 1 : 5
    });
  };

  // Collision Logic
  const handleCollision = (obs: Obstacle) => {
    const p = playerRef.current;
    const stats = statsRef.current;
    stats.combo = 0; // Reset combo

    // 1. If Tea Boost: smashes obstacle!
    if (p.hasTeaBoost) {
      sounds.playCrash();
      triggerScreenShake();
      addSpeechBubble('চা খেয়ে সুপারম্যান! সব পরিষ্কার!', 'PLAYER');
      return;
    }

    // 2. If Umbrella Shield: breaks umbrella but saves life!
    if (p.hasUmbrella) {
      p.hasUmbrella = false;
      p.isInvincible = true;
      p.invincibleTimer = 1.6;
      sounds.playCrash();
      triggerScreenShake();
      addSpeechBubble('ছাতা ভেঙে গেল, কিন্তু জীবন বাঁচল!', 'PLAYER');
      return;
    }

    // 3. If currently Invincible: ignore
    if (p.isInvincible) return;

    // 4. Mud slip
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

    // 5. Heavy collision (Rickshaw, CNG, Bus, Bamboo)
    sounds.playCrash();
    triggerScreenShake();
    const crashQuote = 'আহারে! ধাক্কা লেগে গেল!';
    addSpeechBubble(crashQuote, 'PLAYER');
    damagePlayer();
  };

  // Damage Player
  const damagePlayer = () => {
    const p = playerRef.current;
    p.lives -= 1;
    p.isInvincible = true;
    p.invincibleTimer = 1.8;

    if (p.lives <= 0) {
      handleGameOver();
    }
  };

  // Collectible Pickup Logic
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

  // Bus Stop Selection Event (Level 3)
  const triggerBusStopEvent = () => {
    // 3 buses across lanes
    const correctLane = Math.floor(Math.random() * 3);
    const wrongDestinations = ['গাজীপুর', 'কুমিল্লা', 'মিরপুর', 'যাত্রাবাড়ী'];

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
    addSpeechBubble('সামনে ৩টি বাস! মতিঝিলের বাসে উঠুন!', 'HELPER');
  };

  const handleBusStopDecisionCheck = (player: Player) => {
    const options = busOptionsRef.current;
    if (!options) return;

    // After 4.5 seconds, evaluate the player's chosen lane
    // Or when player is aligned with the buses
    const chosenBus = options.find((b) => b.lane === player.targetLane);
    if (!chosenBus) return;

    // Award result
    if (chosenBus.isCorrect) {
      statsRef.current.busesCaught += 1;
      statsRef.current.score += 2000;
      sounds.playVictory();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
      addSpeechBubble('মতিঝিল ডাইরেক্ট! সাবাশ বস!', 'HELPER');
    } else {
      statsRef.current.wrongBuses += 1;
      sounds.playCrash();
      triggerScreenShake();
      addSpeechBubble(`হায় হায়! ${chosenBus.destination} চলে যাচ্ছেন!`, 'HELPER');
      damagePlayer();
    }

    busOptionsRef.current = null;
  };

  // Bus Interior minigame completed callback
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

  // Game Over
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

    // Update Daily Challenge progress
    StorageService.updateDailyChallenge(stats.distance, stats.coins, stats.busesCaught);

    setLastRecord(record);
    setIsNewBest(isNewBest);
  };

  // Render on Canvas
  const renderGame = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const isRain = currentStage.id === 4;
    renderer.render(
      playerRef.current,
      obstaclesRef.current,
      collectiblesRef.current,
      particlesRef.current,
      speechBubblesRef.current,
      busOptionsRef.current,
      currentStage,
      statsRef.current.distance,
      280 * currentStage.speedMultiplier,
      isRain
    );
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

      {/* Main Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={() => {
          if (gameState === 'RUNNING') handleJump();
        }}
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
