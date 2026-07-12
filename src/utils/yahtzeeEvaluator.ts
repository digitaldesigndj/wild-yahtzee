import { CategoryId, DieValue, Scorecard } from '../types';

export function getAssignments(dice: DieValue[]): number[][] {
  const results: number[][] = [];
  
  function backtrack(index: number, current: number[]) {
    if (index === dice.length) {
      results.push([...current]);
      return;
    }
    const val = dice[index];
    if (val === 'W') {
      for (let i = 1; i <= 6; i++) {
        current.push(i);
        backtrack(index + 1, current);
        current.pop();
      }
    } else {
      current.push(val);
      backtrack(index + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return results;
}

export function scoreOnes(dice: number[]): number {
  return dice.filter((d) => d === 1).length * 1;
}

export function scoreTwos(dice: number[]): number {
  return dice.filter((d) => d === 2).length * 2;
}

export function scoreThrees(dice: number[]): number {
  return dice.filter((d) => d === 3).length * 3;
}

export function scoreFours(dice: number[]): number {
  return dice.filter((d) => d === 4).length * 4;
}

export function scoreFives(dice: number[]): number {
  return dice.filter((d) => d === 5).length * 5;
}

export function scoreSixes(dice: number[]): number {
  return dice.filter((d) => d === 6).length * 6;
}

export function scoreThreeOfAKind(dice: number[]): number {
  const counts: Record<number, number> = {};
  for (const d of dice) {
    counts[d] = (counts[d] || 0) + 1;
  }
  const hasThree = Object.values(counts).some((c) => c >= 3);
  return hasThree ? dice.reduce((sum, d) => sum + d, 0) : 0;
}

export function scoreFourOfAKind(dice: number[]): number {
  const counts: Record<number, number> = {};
  for (const d of dice) {
    counts[d] = (counts[d] || 0) + 1;
  }
  const hasFour = Object.values(counts).some((c) => c >= 4);
  return hasFour ? dice.reduce((sum, d) => sum + d, 0) : 0;
}

export function scoreFullHouse(dice: number[]): number {
  const counts: Record<number, number> = {};
  for (const d of dice) {
    counts[d] = (counts[d] || 0) + 1;
  }
  const vals = Object.values(counts);
  const isFH = (vals.includes(3) && vals.includes(2)) || vals.includes(5);
  return isFH ? 25 : 0;
}

export function scoreSmallStraight(dice: number[]): number {
  const unique = new Set(dice);
  const isSS =
    (unique.has(1) && unique.has(2) && unique.has(3) && unique.has(4)) ||
    (unique.has(2) && unique.has(3) && unique.has(4) && unique.has(5)) ||
    (unique.has(3) && unique.has(4) && unique.has(5) && unique.has(6));
  return isSS ? 30 : 0;
}

export function scoreLargeStraight(dice: number[]): number {
  const unique = new Set(dice);
  const isLS =
    (unique.has(1) && unique.has(2) && unique.has(3) && unique.has(4) && unique.has(5)) ||
    (unique.has(2) && unique.has(3) && unique.has(4) && unique.has(5) && unique.has(6));
  return isLS ? 40 : 0;
}

export function scoreYahtzee(dice: number[]): number {
  return new Set(dice).size === 1 ? 50 : 0;
}

export function scoreChance(dice: number[]): number {
  return dice.reduce((sum, d) => sum + d, 0);
}

/**
 * Calculates the best possible score for a category given a set of dice (which may include Wilds).
 * Handles the special classic Yahtzee Joker rules.
 */
export function evaluateCategory(
  id: CategoryId,
  dice: DieValue[],
  scorecard: Scorecard
): number {
  // If the user hasn't rolled yet, potential score is 0
  if (dice.some((d) => d === 'W' ? false : d < 1 || d > 6)) {
    // Treat unitialized or empty dice as 0
    return 0;
  }

  const assignments = getAssignments(dice);
  
  // Check if any assignment results in a Yahtzee
  const isCurrentRollYahtzee = assignments.some((a) => scoreYahtzee(a) > 0);

  // Yahtzee Joker rule: If you roll a Yahtzee and the Yahtzee slot is already filled with 50:
  // You can use the roll as a Joker for Full House (25), Small Straight (30), or Large Straight (40).
  const isYahtzeeFilledWithPoints = scorecard.yahtzee !== null && scorecard.yahtzee > 0;
  const useJokerRule = isCurrentRollYahtzee && isYahtzeeFilledWithPoints;

  if (useJokerRule) {
    if (id === 'fullHouse') return 25;
    if (id === 'smallStraight') return 30;
    if (id === 'largeStraight') return 40;
  }

  let maxScore = 0;
  for (const assignment of assignments) {
    let score = 0;
    switch (id) {
      case 'ones':
        score = scoreOnes(assignment);
        break;
      case 'twos':
        score = scoreTwos(assignment);
        break;
      case 'threes':
        score = scoreThrees(assignment);
        break;
      case 'fours':
        score = scoreFours(assignment);
        break;
      case 'fives':
        score = scoreFives(assignment);
        break;
      case 'sixes':
        score = scoreSixes(assignment);
        break;
      case 'threeOfAKind':
        score = scoreThreeOfAKind(assignment);
        break;
      case 'fourOfAKind':
        score = scoreFourOfAKind(assignment);
        break;
      case 'fullHouse':
        score = scoreFullHouse(assignment);
        break;
      case 'smallStraight':
        score = scoreSmallStraight(assignment);
        break;
      case 'largeStraight':
        score = scoreLargeStraight(assignment);
        break;
      case 'yahtzee':
        score = scoreYahtzee(assignment);
        break;
      case 'chance':
        score = scoreChance(assignment);
        break;
    }
    if (score > maxScore) {
      maxScore = score;
    }
  }

  return maxScore;
}

/**
 * Checks if the current roll qualifies as a Yahtzee (five-of-a-kind), taking Wilds into account.
 */
export function isYahtzeeRoll(dice: DieValue[]): boolean {
  const assignments = getAssignments(dice);
  return assignments.some((a) => scoreYahtzee(a) > 0);
}
