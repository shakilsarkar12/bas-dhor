export type GameState = 
  | 'HOME' 
  | 'HOW_TO_PLAY' 
  | 'COUNTDOWN' 
  | 'RUNNING' 
  | 'BUS_STOP_EVENT' 
  | 'BUS_INTERIOR' 
  | 'PAUSED' 
  | 'GAME_OVER';

export type StageId = 1 | 2 | 3 | 4 | 5 | 6;

export interface StageConfig {
  id: StageId;
  name: string;
  subtitle: string;
  targetMeters: number;
  bgTheme: 'day' | 'traffic' | 'bus_stand' | 'rain' | 'interior';
  speedMultiplier: number;
  obstacleTypes: ObstacleType[];
  description: string;
}

export type ObstacleType = 
  | 'POTHOLE' 
  | 'MUD' 
  | 'RICKSHAW' 
  | 'CNG' 
  | 'TEA_STALL' 
  | 'BAMBOO' 
  | 'BRICKS'
  | 'SLOW_BUS';

export interface Player {
  x: number;
  y: number;
  lane: number; // 0: Left, 1: Center, 2: Right
  targetLane: number;
  jumpY: number;
  jumpVy: number;
  isJumping: boolean;
  isSliding: boolean;
  slideTimer: number;
  lives: number;
  maxLives: number;
  isInvincible: boolean;
  invincibleTimer: number;
  hasUmbrella: boolean;
  umbrellaTimer: number;
  hasTeaBoost: boolean;
  teaBoostTimer: number;
  mudStained: boolean;
  state: 'RUNNING' | 'JUMPING' | 'SLIDING' | 'STUMBLED' | 'CELEBRATING';
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  lane: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  passed: boolean;
  collided: boolean;
  customData?: any;
}

export interface BusOption {
  id: number;
  lane: number;
  destination: string;
  busName: string;
  isCorrect: boolean;
  color: string;
  accentColor: string;
  shout: string;
}

export interface Collectible {
  id: number;
  type: 'COIN' | 'TEA' | 'UMBRELLA' | 'CLOCK';
  lane: number;
  y: number;
  collected: boolean;
  value: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'MUD' | 'RAIN' | 'SPARKLE' | 'SMOKE' | 'COIN';
}

export interface SpeechBubble {
  id: number;
  text: string;
  sender: 'PLAYER' | 'HELPER' | 'MAMUR_BETA' | 'BOSS';
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export interface ScoreRecord {
  id: string;
  name: string;
  score: number;
  distance: number;
  coins: number;
  busesCaught: number;
  wrongBuses: number;
  title: string;
  comment: string;
  date: string;
  stageReached: number;
}

export interface DailyChallenge {
  dateStr: string;
  title: string;
  description: string;
  targetMeters: number;
  targetCoins: number;
  targetBuses: number;
  progressMeters: number;
  progressCoins: number;
  progressBuses: number;
  isCompleted: boolean;
}
