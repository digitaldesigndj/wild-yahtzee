import { motion } from 'motion/react';
import { Star, Lock, RefreshCw } from 'lucide-react';
import { DieState, DieValue } from '../types';
import { audio } from '../utils/audio';

interface DiceCupProps {
  dice: DieState[];
  rollsLeft: number;
  isRolling: boolean;
  currentRound: number;
  onRoll: () => void;
  onToggleHold: (id: number) => void;
}

// 3x3 grid indexing:
// 0: top-left,   1: top-center,   2: top-right
// 3: mid-left,   4: mid-center,   5: mid-right
// 6: bot-left,   7: bot-center,   8: bot-right
const PIPS_MAP: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({
  value,
  held,
  rolling,
  onClick,
  disabled,
  unrolled,
}: {
  value: DieValue;
  held: boolean;
  rolling: boolean;
  onClick: () => void;
  disabled: boolean;
  unrolled: boolean;
  key?: number;
}) {
  const isWild = value === 'W';

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        id={`die-button-${value}`}
        onClick={onClick}
        disabled={disabled || rolling}
        whileHover={!disabled && !rolling ? { scale: 1.05, y: -4 } : {}}
        whileTap={!disabled && !rolling ? { scale: 0.95 } : {}}
        animate={{
          x: rolling ? [0, -16, 16, -12, 12, -8, 8, -4, 4, 0] : 0,
          rotate: rolling ? [0, -6, 6, -4, 4, -3, 3, -1, 1, 0] : 0,
          scale: rolling ? [1, 1.1, 0.95, 1.05, 1] : 1,
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
        className={`
          relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center cursor-pointer select-none
          transition-colors duration-300
          ${
            isWild
              ? 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-amber-950 border-4 border-amber-300 shadow-[0_10px_20px_rgba(245,158,11,0.3),_inset_0_-4px_8px_rgba(0,0,0,0.15),_inset_0_4px_8px_rgba(255,255,255,0.4)]'
              : held
              ? 'bg-emerald-50 text-emerald-900 border-4 border-emerald-500/80 shadow-[0_4px_12px_rgba(16,185,129,0.15),_inset_0_-2px_4px_rgba(0,0,0,0.05)]'
              : 'bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-300 shadow-[0_8px_16px_rgba(0,0,0,0.06),_inset_0_-3px_0px_rgba(0,0,0,0.08),_inset_0_3px_0px_rgba(255,255,255,0.8)]'
          }
          focus:outline-none focus:ring-4 focus:ring-emerald-500/20
        `}
      >
        {isWild ? (
          // Wild Die Design: Glowing Golden Star
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <Star className="w-8 h-8 fill-amber-950 stroke-amber-950" />
            </motion.div>
            <span className="text-[10px] font-bold tracking-wider mt-1 uppercase font-mono">
              Wild
            </span>
          </div>
        ) : (
          // Regular Die Design: Authentic Pips
          <div className="w-12 h-12 grid grid-cols-3 grid-rows-3 gap-1.5 p-1">
            {Array.from({ length: 9 }).map((_, i) => {
              const hasPip = PIPS_MAP[value as number]?.includes(i);
              return (
                <div key={i} className="flex items-center justify-center">
                  <div
                    className={`
                      w-2.5 h-2.5 rounded-full transition-all duration-300
                      ${hasPip ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                      ${
                        held
                          ? 'bg-emerald-800 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]'
                          : unrolled
                          ? 'bg-slate-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.1)]'
                          : 'bg-slate-800 shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]'
                      }
                    `}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Locked Overlay badge for held dice */}
        {held && !isWild && (
          <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full border border-emerald-100 shadow-md">
            <Lock className="w-3 h-3" />
          </div>
        )}
        {isWild && (
          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-amber-950 p-1 rounded-full border border-amber-200 shadow-md">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </motion.button>

      {/* Held Label */}
      <span
        className={`text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
          held ? 'text-emerald-600 opacity-100 scale-100' : 'text-slate-400 opacity-0 scale-90'
        }`}
      >
        {isWild ? 'Auto-Held' : 'Held'}
      </span>
    </div>
  );
}

export default function DiceCup({
  dice,
  rollsLeft,
  isRolling,
  currentRound,
  onRoll,
  onToggleHold,
}: DiceCupProps) {
  const hasUnusedRolls = rollsLeft > 0;
  const isCupEmpty = dice.every((d) => d.value === 1 && !d.held && rollsLeft === 3); // initial state

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02),_0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col items-center">
      {/* Dice Tray Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest font-mono">
            Dice Tray
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => {
              const active = i < rollsLeft;
              return (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    active
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-200'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Round Indicator Badge */}
          <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] font-mono px-2 py-1 rounded-lg uppercase tracking-wide">
            Round {currentRound} / 13
          </span>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-lg">
            {rollsLeft === 3 ? 'First Roll' : `Rolls: ${rollsLeft}`}
          </span>
        </div>
      </div>

      {/* Active Dice Row */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 my-6 min-h-[110px]">
        {dice.map((die) => (
          <Die
            key={die.id}
            value={die.value}
            held={die.held}
            rolling={die.rolling}
            unrolled={rollsLeft === 3}
            onClick={() => {
              // Only play hold sound if the die is interactive (not wild, since wilds are locked)
              if (die.value !== 'W' && rollsLeft < 3 && !isRolling) {
                audio.playHold();
              }
              onToggleHold(die.id);
            }}
            disabled={rollsLeft === 3 || isRolling} // cannot hold before the first roll has been made
          />
        ))}
      </div>

      {/* Helper label for interactive guidance */}
      <div className="h-6 flex items-center justify-center">
        {rollsLeft === 3 && !isRolling && (
          <p className="text-xs font-medium text-slate-400 italic">
            Click Roll to begin your turn!
          </p>
        )}
        {rollsLeft < 3 && rollsLeft > 0 && !isRolling && (
          <p className="text-xs font-medium text-emerald-600 italic">
            Tap dice to keep them, then roll the remaining.
          </p>
        )}
        {rollsLeft === 0 && !isRolling && (
          <p className="text-xs font-medium text-amber-600 italic">
            No rolls remaining! Score your turn in the scorecard.
          </p>
        )}
        {isRolling && (
          <p className="text-xs font-medium text-slate-500 animate-pulse">
            Tumbling the cup...
          </p>
        )}
      </div>

      {/* Action Controls */}
      <div className="w-full border-t border-slate-200/60 mt-6 pt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <motion.button
          id="roll-dice-button"
          onClick={onRoll}
          disabled={!hasUnusedRolls || isRolling}
          whileHover={hasUnusedRolls && !isRolling ? { scale: 1.02 } : {}}
          whileTap={hasUnusedRolls && !isRolling ? { scale: 0.98 } : {}}
          className={`
            w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-md
            ${
              hasUnusedRolls && !isRolling
                ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg focus:ring-4 focus:ring-slate-900/20'
                : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-none cursor-not-allowed'
            }
          `}
        >
          <RefreshCw className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
          {isRolling
            ? 'Rolling...'
            : rollsLeft === 3
            ? 'Roll Dice'
            : `Roll Remaining (${rollsLeft})`}
        </motion.button>
      </div>
    </div>
  );
}
