import { motion } from 'motion/react';
import { Check, Info, HelpCircle, Star } from 'lucide-react';
import { Category, CategoryId, DieValue, Scorecard } from '../types';
import { evaluateCategory } from '../utils/yahtzeeEvaluator';

export const CATEGORIES: Category[] = [
  // Upper Section
  {
    id: 'ones',
    name: 'Aces (Ones)',
    section: 'upper',
    description: 'Count and add only Aces',
    scoringGuide: 'Sum of 1s',
  },
  {
    id: 'twos',
    name: 'Twos',
    section: 'upper',
    description: 'Count and add only Twos',
    scoringGuide: 'Sum of 2s',
  },
  {
    id: 'threes',
    name: 'Threes',
    section: 'upper',
    description: 'Count and add only Threes',
    scoringGuide: 'Sum of 3s',
  },
  {
    id: 'fours',
    name: 'Fours',
    section: 'upper',
    description: 'Count and add only Fours',
    scoringGuide: 'Sum of 4s',
  },
  {
    id: 'fives',
    name: 'Fives',
    section: 'upper',
    description: 'Count and add only Fives',
    scoringGuide: 'Sum of 5s',
  },
  {
    id: 'sixes',
    name: 'Sixes',
    section: 'upper',
    description: 'Count and add only Sixes',
    scoringGuide: 'Sum of 6s',
  },
  // Lower Section
  {
    id: 'threeOfAKind',
    name: 'Three of a Kind',
    section: 'lower',
    description: 'Sum of all dice if 3 same',
    scoringGuide: 'Sum of all dice',
  },
  {
    id: 'fourOfAKind',
    name: 'Four of a Kind',
    section: 'lower',
    description: 'Sum of all dice if 4 same',
    scoringGuide: 'Sum of all dice',
  },
  {
    id: 'fullHouse',
    name: 'Full House',
    section: 'lower',
    description: 'Three of one, pair of another',
    scoringGuide: 'Score 25 pts',
  },
  {
    id: 'smallStraight',
    name: 'Small Straight',
    section: 'lower',
    description: 'Four sequential dice',
    scoringGuide: 'Score 30 pts',
  },
  {
    id: 'largeStraight',
    name: 'Large Straight',
    section: 'lower',
    description: 'Five sequential dice',
    scoringGuide: 'Score 40 pts',
  },
  {
    id: 'yahtzee',
    name: 'Yahtzee',
    section: 'lower',
    description: 'Five of the same number',
    scoringGuide: 'Score 50 pts',
  },
  {
    id: 'chance',
    name: 'Chance',
    section: 'lower',
    description: 'Sum of all dice',
    scoringGuide: 'Sum of all dice',
  },
];

interface ScorecardTableProps {
  scorecard: Scorecard;
  dice: DieValue[];
  rollsLeft: number;
  yahtzeeBonusCount: number;
  onScoreCategory: (id: CategoryId) => void;
}

export default function ScorecardTable({
  scorecard,
  dice,
  rollsLeft,
  yahtzeeBonusCount,
  onScoreCategory,
}: ScorecardTableProps) {
  const hasRolled = rollsLeft < 3;

  // Upper Section Scoring
  const upperCategories = CATEGORIES.filter((c) => c.section === 'upper');
  const upperScoredSum = upperCategories.reduce((sum, cat) => {
    const val = scorecard[cat.id];
    return sum + (val !== null ? val : 0);
  }, 0);

  const upperPossibleBonus = upperScoredSum >= 63 ? 35 : 0;
  const upperTotal = upperScoredSum + upperPossibleBonus;

  // Lower Section Scoring
  const lowerCategories = CATEGORIES.filter((c) => c.section === 'lower');
  const lowerScoredSum = lowerCategories.reduce((sum, cat) => {
    const val = scorecard[cat.id];
    return sum + (val !== null ? val : 0);
  }, 0);

  const yahtzeeBonusPoints = yahtzeeBonusCount * 100;
  const lowerTotal = lowerScoredSum + yahtzeeBonusPoints;

  // Grand Total
  const grandTotal = upperTotal + lowerTotal;

  // Render a single category row
  const renderCategoryRow = (cat: Category) => {
    const finalScore = scorecard[cat.id];
    const isScored = finalScore !== null;
    
    // Evaluate potential score if we score this right now
    const potentialScore = hasRolled ? evaluateCategory(cat.id, dice, scorecard) : 0;

    return (
      <tr
        key={cat.id}
        onClick={() => {
          if (!isScored && hasRolled) {
            onScoreCategory(cat.id);
          }
        }}
        className={`border-b border-slate-100 transition-colors group ${
          isScored
            ? 'bg-slate-50/40 text-slate-500'
            : hasRolled
            ? 'hover:bg-emerald-50/60 cursor-pointer'
            : 'text-slate-400'
        }`}
      >
        {/* Name and Description */}
        <td className="py-3.5 px-4">
          <div className="flex flex-col">
            <span className={`font-semibold text-sm ${isScored ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {cat.name}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-300" />
              {cat.description}
            </span>
          </div>
        </td>

        {/* Scoring Guideline */}
        <td className="py-3.5 px-4 hidden sm:table-cell text-xs font-mono text-slate-400">
          {cat.scoringGuide}
        </td>

        {/* Score Value & Button Column */}
        <td className="py-3.5 px-4 text-right">
          {isScored ? (
            <div className="flex justify-end items-center gap-1.5">
              <span className="font-mono font-bold text-base text-slate-700">
                {finalScore}
              </span>
              <Check className="w-4 h-4 text-emerald-500" />
            </div>
          ) : (
            <div className="flex justify-end items-center gap-2">
              {hasRolled ? (
                <button
                  id={`score-btn-${cat.id}`}
                  onClick={() => onScoreCategory(cat.id)}
                  className={`
                    px-4 py-1.5 rounded-xl font-bold font-mono text-xs transition-all duration-300 cursor-pointer
                    ${
                      potentialScore > 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:shadow-sm'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300'
                    }
                  `}
                >
                  {potentialScore > 0 ? `+${potentialScore}` : '0'}
                </button>
              ) : (
                <span className="text-xs font-mono text-slate-300 italic">
                  Roll first
                </span>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.03)] flex flex-col">
      {/* Upper Section Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-800 tracking-wide text-sm uppercase font-mono">
            Upper Section
          </h3>
          <p className="text-xs text-slate-400">Sum Aces, Twos, Threes, Fours, Fives, Sixes</p>
        </div>
        
        {/* Upper Section Bonus Meter */}
        <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl px-4 py-2">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider font-mono">
              Upper Bonus
            </span>
            <span className="text-xs font-mono font-bold text-slate-700">
              {upperScoredSum} / 63 points
            </span>
          </div>

          <div className="w-16 bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (upperScoredSum / 63) * 100)}%` }}
            />
          </div>

          <span
            className={`font-mono text-sm font-extrabold ${
              upperPossibleBonus > 0 ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            +{upperPossibleBonus}
          </span>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/20 text-[10px] uppercase font-bold text-slate-400 font-mono border-b border-slate-100">
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4 hidden sm:table-cell">Scoring</th>
              <th className="py-2.5 px-4 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {upperCategories.map(renderCategoryRow)}
            
            {/* Upper Section Summary Rows */}
            <tr className="bg-slate-50/50 font-bold text-sm text-slate-700 border-b border-slate-200">
              <td className="py-3 px-4 font-mono uppercase text-xs">Upper Subtotal</td>
              <td className="py-3 px-4 hidden sm:table-cell" />
              <td className="py-3 px-4 text-right font-mono text-base text-slate-800">
                {upperScoredSum}
              </td>
            </tr>
            <tr className="bg-slate-50/50 font-bold text-sm text-slate-700 border-b border-slate-200">
              <td className="py-3 px-4 font-mono uppercase text-xs">Upper Section Bonus (Needs 63+)</td>
              <td className="py-3 px-4 hidden sm:table-cell text-xs text-slate-400 font-normal">Score +35</td>
              <td className="py-3 px-4 text-right font-mono text-base text-emerald-600">
                +{upperPossibleBonus}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lower Section Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 border-t-2 border-t-slate-200/80 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 tracking-wide text-sm uppercase font-mono">
            Lower Section
          </h3>
          <p className="text-xs text-slate-400">Combinations, Straights, and Yahtzees</p>
        </div>

        {/* Multi-Yahtzee Bonus indicator */}
        {yahtzeeBonusCount > 0 && (
          <div className="bg-amber-100 text-amber-950 font-bold px-3 py-1.5 rounded-xl border border-amber-300 text-xs flex items-center gap-1.5 font-mono animate-pulse">
            <Star className="w-3.5 h-3.5 fill-amber-500 stroke-amber-500" />
            Yahtzee Bonus: +{yahtzeeBonusPoints}
          </div>
        )}
      </div>

      {/* Lower Section Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <tbody>
            {lowerCategories.map(renderCategoryRow)}

            {/* Yahtzee Bonus Row (always visible if bonus achieved) */}
            {yahtzeeBonusCount > 0 && (
              <tr className="border-b border-slate-100 bg-amber-50/30 font-semibold text-slate-600">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-sm">Yahtzee Bonus</span>
                    <span className="text-[10px] text-amber-600">Additional Yahtzee Rolled (+100 each)</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden sm:table-cell text-xs font-mono text-slate-400">
                  {yahtzeeBonusCount} x 100 pts
                </td>
                <td className="py-3 px-4 text-right font-mono text-amber-600 text-base">
                  +{yahtzeeBonusPoints}
                </td>
              </tr>
            )}

            {/* Lower Section Subtotal Row */}
            <tr className="bg-slate-50/50 font-bold text-sm text-slate-700 border-b border-slate-200">
              <td className="py-3 px-4 font-mono uppercase text-xs">Lower Subtotal</td>
              <td className="py-3 px-4 hidden sm:table-cell" />
              <td className="py-3 px-4 text-right font-mono text-base text-slate-800">
                {lowerTotal}
              </td>
            </tr>

            {/* GRAND TOTAL */}
            <tr className="bg-emerald-900 text-white font-extrabold text-lg border-b border-emerald-950">
              <td className="py-4.5 px-6 font-mono uppercase tracking-wider">Grand Total</td>
              <td className="py-4.5 px-6 hidden sm:table-cell text-xs font-mono text-emerald-300 font-normal">
                Upper ({upperTotal}) + Lower ({lowerTotal})
              </td>
              <td className="py-4.5 px-6 text-right font-mono text-2xl text-yellow-300">
                {grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
