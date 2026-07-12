export type DieValue = 1 | 2 | 3 | 4 | 5 | 6 | 'W';

export interface DieState {
  id: number;
  value: DieValue;
  held: boolean;
  rolling: boolean;
}

export type CategoryId =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'threeOfAKind'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yahtzee'
  | 'chance';

export interface Category {
  id: CategoryId;
  name: string;
  section: 'upper' | 'lower';
  description: string;
  scoringGuide: string;
}

export type Scorecard = Record<CategoryId, number | null>;

export interface GameStats {
  gamesPlayed: number;
  highScore: number;
  averageScore: number;
  totalPoints: number;
  wildDiceRolledCount: number;
  yahtzeesRolledCount: number;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  score: number;
  yahtzeeCount: number;
  wildsUsed: number;
}
