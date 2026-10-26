import type { ScoreRecord, DailyChallenge } from '../types/game';

const STORAGE_KEYS = {
  BEST_SCORE: 'bus_dhor_boss_best_score',
  PLAYER_NAME: 'bus_dhor_boss_player_name',
  SCORE_HISTORY: 'bus_dhor_boss_score_history',
  DAILY_CHALLENGE: 'bus_dhor_boss_daily_challenge'
};

export class StorageService {
  public static getBestScore(): number {
    const score = localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
    return score ? parseInt(score, 10) : 0;
  }

  public static getPlayerName(): string {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || 'শাকিল ভাই';
  }

  public static setPlayerName(name: string) {
    if (name.trim()) {
      localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.trim());
    }
  }

  public static getScoreHistory(): ScoreRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.SCORE_HISTORY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveRun(record: Omit<ScoreRecord, 'id' | 'date'>): { isNewBest: boolean; record: ScoreRecord } {
    const bestScore = this.getBestScore();
    const isNewBest = record.score > bestScore;

    if (isNewBest) {
      localStorage.setItem(STORAGE_KEYS.BEST_SCORE, String(record.score));
    }

    const fullRecord: ScoreRecord = {
      ...record,
      id: 'run_' + Date.now(),
      date: new Date().toLocaleDateString('bn-BD', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const history = this.getScoreHistory();
    history.unshift(fullRecord);
    // Keep top 15 records
    if (history.length > 15) {
      history.pop();
    }
    localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(history));

    return { isNewBest, record: fullRecord };
  }

  // Daily Challenge logic based on current date
  public static getDailyChallenge(): DailyChallenge {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGE);

    if (saved) {
      try {
        const parsed: DailyChallenge = JSON.parse(saved);
        if (parsed.dateStr === today) {
          return parsed;
        }
      } catch {
        // regenerate
      }
    }

    // Generate today's challenge
    const newChallenge: DailyChallenge = {
      dateStr: today,
      title: 'আজকের মিশন: অফিস পৌঁছাও!',
      description: '৭০০ মিটার দৌড়াও, ১৫টি কয়েন তোলো এবং অন্তত ১টি সঠিক বাসে ওঠো!',
      targetMeters: 700,
      targetCoins: 15,
      targetBuses: 1,
      progressMeters: 0,
      progressCoins: 0,
      progressBuses: 0,
      isCompleted: false
    };

    localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(newChallenge));
    return newChallenge;
  }

  public static updateDailyChallenge(meters: number, coins: number, buses: number): DailyChallenge {
    const challenge = this.getDailyChallenge();
    if (challenge.isCompleted) return challenge;

    challenge.progressMeters = Math.max(challenge.progressMeters, Math.floor(meters));
    challenge.progressCoins += coins;
    challenge.progressBuses += buses;

    if (
      challenge.progressMeters >= challenge.targetMeters &&
      challenge.progressCoins >= challenge.targetCoins &&
      challenge.progressBuses >= challenge.targetBuses
    ) {
      challenge.isCompleted = true;
    }

    localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGE, JSON.stringify(challenge));
    return challenge;
  }
}
