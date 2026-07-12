import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  Trophy,
  Sparkles,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { CategoryId, DieState, DieValue, GameHistoryEntry, GameStats, Scorecard } from './types';
import { evaluateCategory, isYahtzeeRoll } from './utils/yahtzeeEvaluator';
import { CATEGORIES } from './components/ScorecardTable';
import DiceCup from './components/DiceCup';
import ScorecardTable from './components/ScorecardTable';
import StatsPanel from './components/StatsPanel';
import Confetti from './components/Confetti';
import Fireworks from './components/Fireworks';
import { audio } from './utils/audio';

const INITIAL_DICE: DieState[] = [
  { id: 1, value: 1, held: false, rolling: false },
  { id: 2, value: 2, held: false, rolling: false },
  { id: 3, value: 3, held: false, rolling: false },
  { id: 4, value: 4, held: false, rolling: false },
  { id: 5, value: 5, held: false, rolling: false },
];

const INITIAL_SCORECARD: Scorecard = {
  ones: null,
  twos: null,
  threes: null,
  fours: null,
  fives: null,
  sixes: null,
  threeOfAKind: null,
  fourOfAKind: null,
  fullHouse: null,
  smallStraight: null,
  largeStraight: null,
  yahtzee: null,
  chance: null,
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  highScore: 0,
  averageScore: 0,
  totalPoints: 0,
  wildDiceRolledCount: 0,
  yahtzeesRolledCount: 0,
};

export default function App() {
  // Game States
  const [dice, setDice] = useState<DieState[]>(INITIAL_DICE);
  const [rollsLeft, setRollsLeft] = useState<number>(3);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [scorecard, setScorecard] = useState<Scorecard>(INITIAL_SCORECARD);
  const [yahtzeeBonusCount, setYahtzeeBonusCount] = useState<number>(0);
  
  // Celebration States
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [fireworksActive, setFireworksActive] = useState<boolean>(false);
  const [currentTurnYahtzeeTriggered, setCurrentTurnYahtzeeTriggered] = useState<boolean>(false);
  
  // Game Lifecycle States
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(true);
  const [sessionWildsCount, setSessionWildsCount] = useState<number>(0);

  // Statistics States
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);

  // Compute current round (1-13) based on scored slots
  const currentRound = Math.min(
    13,
    Object.values(scorecard).filter((val) => val !== null).length + 1
  );

  // Load stats and history from localStorage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('wild_yahtzee_stats');
      if (savedStats) setStats(JSON.parse(savedStats));

      const savedHistory = localStorage.getItem('wild_yahtzee_history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error('Failed to load local storage data', e);
    }
  }, []);

  // Compute Grand Total dynamically
  const getGrandTotal = (currentScorecard: Scorecard, bonusCount: number) => {
    // Upper Section
    const upperKeys: CategoryId[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    const upperSum = upperKeys.reduce((sum, key) => sum + (currentScorecard[key] ?? 0), 0);
    const upperBonus = upperSum >= 63 ? 35 : 0;

    // Lower Section
    const lowerKeys: CategoryId[] = [
      'threeOfAKind',
      'fourOfAKind',
      'fullHouse',
      'smallStraight',
      'largeStraight',
      'yahtzee',
      'chance',
    ];
    const lowerSum = lowerKeys.reduce((sum, key) => sum + (currentScorecard[key] ?? 0), 0);
    const yahtzeeBonusPoints = bonusCount * 100;

    return upperSum + upperBonus + lowerSum + yahtzeeBonusPoints;
  };

  // Roll the dice
  const handleRoll = () => {
    if (rollsLeft === 0 || isRolling) return;

    setIsRolling(true);
    audio.playRoll();
    
    // Set rolling state to trigger die flip animations
    setDice((prev) =>
      prev.map((die) => ({
        ...die,
        rolling: rollsLeft === 3 ? true : !die.held, // roll everything on first roll, else only unheld dice
      }))
    );

    // Let the tumbling animation roll for 650ms
    setTimeout(() => {
      let rolledWildsThisRoll = 0;
      
      const newDice = dice.map((die) => {
        // Only roll if it is not held (or if it is the first roll of the turn, ignore holds)
        const shouldRoll = rollsLeft === 3 ? true : !die.held;
        
        if (shouldRoll) {
          // 7 possible outcomes: 1, 2, 3, 4, 5, 6, and 'W' (Wild)
          const rollValue = Math.floor(Math.random() * 7) + 1;
          const finalValue: DieValue = rollValue === 7 ? 'W' : (rollValue as DieValue);
          
          if (finalValue === 'W') {
            rolledWildsThisRoll++;
          }

          return {
            ...die,
            value: finalValue,
            // Wild dice should be held automatically (we'll process auto-held in next step)
            held: finalValue === 'W',
            rolling: false,
          };
        }
        
        return {
          ...die,
          rolling: false,
        };
      });

      // Wild dice should be held automatically (if they were already held, keep them held)
      const finalizedDice = newDice.map((die) => ({
        ...die,
        held: die.value === 'W' ? true : die.held,
      }));

      // Update States
      setDice(finalizedDice);
      setRollsLeft((prev) => prev - 1);
      setIsRolling(false);

      // Save statistics for wilds rolled
      if (rolledWildsThisRoll > 0) {
        audio.playWild();
        setSessionWildsCount((prev) => prev + rolledWildsThisRoll);
        setStats((prev) => {
          const updated = {
            ...prev,
            wildDiceRolledCount: prev.wildDiceRolledCount + rolledWildsThisRoll,
          };
          localStorage.setItem('wild_yahtzee_stats', JSON.stringify(updated));
          return updated;
        });
      }

      // Check if newly rolled combination is a Yahtzee
      const valuesOnly = finalizedDice.map((d) => d.value);
      if (isYahtzeeRoll(valuesOnly)) {
        // If a Yahtzee is rolled, celebrate with confetti!
        if (!currentTurnYahtzeeTriggered) {
          audio.playYahtzee();
          setConfettiActive(true);
          setCurrentTurnYahtzeeTriggered(true);

          // Update Yahtzees Rolled statistics
          setStats((prev) => {
            const updated = {
              ...prev,
              yahtzeesRolledCount: prev.yahtzeesRolledCount + 1,
            };
            localStorage.setItem('wild_yahtzee_stats', JSON.stringify(updated));
            return updated;
          });

          // If Yahtzee is already scored with 50 points, award a Yahtzee Bonus (+100 pts)
          if (scorecard.yahtzee === 50) {
            setYahtzeeBonusCount((prev) => prev + 1);
          }
        }
      }
    }, 650);
  };

  // Toggle Hold State for a die
  const handleToggleHold = (id: number) => {
    if (rollsLeft === 3 || isRolling) return; // cannot hold before rolling or while rolling
    
    setDice((prev) =>
      prev.map((die) => {
        if (die.id === id) {
          // Note: Wild dice are held automatically and cannot be unheld, as requested.
          // Or if they can be unheld, let's keep them locked as requested by "Wild dice should be held automatically".
          if (die.value === 'W') return die; // lock wilds
          return { ...die, held: !die.held };
        }
        return die;
      })
    );
  };

  // Score a Category
  const handleScoreCategory = (id: CategoryId) => {
    if (rollsLeft === 3 || isRolling) return; // must roll at least once

    const finalPoints = evaluateCategory(id, dice.map((d) => d.value), scorecard);
    
    const updatedScorecard = {
      ...scorecard,
      [id]: finalPoints,
    };

    setScorecard(updatedScorecard);

    // Check if Game is Over (all 13 categories filled)
    const isOver = Object.values(updatedScorecard).every((val) => val !== null);

    if (isOver) {
      setIsGameOver(true);
      setFireworksActive(true);
      setTimeout(() => {
        setFireworksActive(false);
      }, 10000);
      audio.playGameOver();
      const gameTotal = getGrandTotal(updatedScorecard, yahtzeeBonusCount);
      
      // Update statistics and history
      const newEntry: GameHistoryEntry = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        score: gameTotal,
        yahtzeeCount: (updatedScorecard.yahtzee === 50 ? 1 : 0) + yahtzeeBonusCount,
        wildsUsed: sessionWildsCount,
      };

      const updatedHistory = [newEntry, ...history].slice(0, 30);
      setHistory(updatedHistory);
      localStorage.setItem('wild_yahtzee_history', JSON.stringify(updatedHistory));

      const newGamesPlayed = stats.gamesPlayed + 1;
      const newHighScore = Math.max(stats.highScore, gameTotal);
      const newTotalPoints = stats.totalPoints + gameTotal;
      const newAverageScore = newTotalPoints / newGamesPlayed;

      const updatedStats = {
        ...stats,
        gamesPlayed: newGamesPlayed,
        highScore: newHighScore,
        totalPoints: newTotalPoints,
        averageScore: newAverageScore,
      };
      setStats(updatedStats);
      localStorage.setItem('wild_yahtzee_stats', JSON.stringify(updatedStats));
    } else {
      audio.playScore();
      // Prepare for next turn
      setDice(INITIAL_DICE);
      setRollsLeft(3);
      setCurrentTurnYahtzeeTriggered(false);
    }
  };

  // Reset/Reset Career Stats
  const handleResetStats = () => {
    localStorage.removeItem('wild_yahtzee_stats');
    localStorage.removeItem('wild_yahtzee_history');
    setStats(DEFAULT_STATS);
    setHistory([]);
  };

  // Start a new game session
  const [isResettingStats, setIsResettingStats] = useState(false); // just keeping context clean
  const handleRestartGame = () => {
    setScorecard(INITIAL_SCORECARD);
    setDice(INITIAL_DICE);
    setRollsLeft(3);
    setYahtzeeBonusCount(0);
    setSessionWildsCount(0);
    setIsGameOver(false);
    setCurrentTurnYahtzeeTriggered(false);
    setConfettiActive(false);
    setFireworksActive(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 relative">
      {/* Confetti Celebration */}
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />

      {/* Full-screen Fireworks for final game victory celebration */}
      <Fireworks active={fireworksActive} />

      {/* Decorative Top Accent */}
      <div className="h-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-600 w-full" />

      {/* Premium Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <span className="p-2 bg-amber-100 rounded-2xl text-amber-950 border border-amber-300">
              <Star className="w-7 h-7 fill-amber-500 stroke-amber-600 animate-pulse" />
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-sans flex items-center gap-1.5">
              Wild Yahtzee
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Classic Winning Moves Yahtzee scoring, elevated with a 7-sided Wild card die outcome.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            id="rules-toggle-button"
            onClick={() => setShowRules(!showRules)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            {showRules ? 'Hide Rules' : 'Show Rules'}
          </button>
          
          <button
            id="restart-game-button"
            onClick={handleRestartGame}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            Restart Game
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Rules Card & Active Controls */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col gap-6">
          
          {/* Rules and Mechanics panel */}
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 shadow-sm text-amber-900/90 relative overflow-hidden"
              >
                {/* Visual design embellishments */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-200/20 to-yellow-300/30 rounded-bl-full pointer-events-none" />
                
                <h2 className="text-sm font-extrabold uppercase tracking-wider font-mono text-amber-950 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-500 stroke-amber-600" />
                  The Wild Die Rulebook
                </h2>
                <ul className="space-y-2.5 text-xs text-amber-950/80 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      Each of your 5 dice has <strong>7 outcomes</strong>: 1, 2, 3, 4, 5, 6, and <strong>Wild (★)</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      A <strong>Wild (★)</strong> acts as any number (1-6) that maximizes your scoring category.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>Auto-Hold:</strong> Wild dice are automatically held upon landing to preserve your strategic advantage.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>Yahtzee Bonuses:</strong> If you roll a Yahtzee and already scored 50 points in the Yahtzee slot, you gain a <strong>+100 Bonus</strong> and can use the roll as a Joker elsewhere!
                    </span>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Turn Controls / Dice Cup */}
          {!isGameOver && (
            <DiceCup
              dice={dice}
              rollsLeft={rollsLeft}
              isRolling={isRolling}
              currentRound={currentRound}
              onRoll={handleRoll}
              onToggleHold={handleToggleHold}
            />
          )}

          {/* Game Over Panel */}
          {isGameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Confetti sparkle visuals */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
              
              <Trophy className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
              
              <h2 className="text-3xl font-extrabold tracking-tight">Game Completed!</h2>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                You successfully scored all 13 categories. Fantastic performance!
              </p>

              {/* Score Breakdown */}
              <div className="my-8 flex flex-col items-center bg-slate-800/60 border border-slate-800 rounded-2xl p-6 w-full max-w-sm">
                <span className="text-slate-400 text-xs font-mono uppercase tracking-widest">
                  Grand Total Score
                </span>
                <span className="text-5xl font-extrabold text-yellow-300 font-mono mt-2">
                  {getGrandTotal(scorecard, yahtzeeBonusCount)}
                </span>

                {getGrandTotal(scorecard, yahtzeeBonusCount) >= stats.highScore && stats.gamesPlayed > 0 && (
                  <div className="mt-4 flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 font-bold text-xs border border-yellow-400/20 px-3 py-1 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5 fill-yellow-400" />
                    New Personal Best!
                  </div>
                )}
              </div>

              {/* Action */}
              <button
                id="play-again-button"
                onClick={handleRestartGame}
                className="w-full max-w-xs py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold tracking-wider text-sm transition-all duration-300 shadow-lg cursor-pointer hover:shadow-emerald-500/20 hover:scale-102 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Play Another Game
              </button>
            </motion.div>
          )}
        </div>

        {/* Scorecard Board & Stats */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ScorecardTable
            scorecard={scorecard}
            dice={dice.map((d) => d.value)}
            rollsLeft={rollsLeft}
            yahtzeeBonusCount={yahtzeeBonusCount}
            onScoreCategory={handleScoreCategory}
          />

          {/* Stats & Match History Panel (moved below scorecard) */}
          <StatsPanel stats={stats} history={history} onResetStats={handleResetStats} />
        </div>
      </main>
    </div>
  );
}
