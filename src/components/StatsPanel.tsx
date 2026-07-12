import { motion } from 'motion/react';
import { Trophy, History, Hash, Percent, Star, Trash2 } from 'lucide-react';
import { GameStats, GameHistoryEntry } from '../types';

interface StatsPanelProps {
  stats: GameStats;
  history: GameHistoryEntry[];
  onResetStats: () => void;
}

export default function StatsPanel({ stats, history, onResetStats }: StatsPanelProps) {
  const formatAverage = (avg: number) => {
    return Number.isInteger(avg) ? avg.toString() : avg.toFixed(1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.03)] p-6 flex flex-col gap-6">
      {/* Panel Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 tracking-wide text-sm uppercase font-mono">
            Statistics & History
          </h3>
          <p className="text-xs text-slate-400">Your Wild Yahtzee career metrics</p>
        </div>

        {stats.gamesPlayed > 0 && (
          <button
            id="reset-stats-button"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all your stats and game history? This cannot be undone.')) {
                onResetStats();
              }
            }}
            className="text-xs text-slate-400 hover:text-red-500 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset All
          </button>
        )}
      </div>

      {stats.gamesPlayed === 0 ? (
        <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Trophy className="w-12 h-12 stroke-1 text-slate-300" />
          <p className="text-sm font-medium italic">Complete your first game to track career stats!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
            {/* High Score */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-yellow-100 rounded-xl text-yellow-700">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  High Score
                </span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">
                  {stats.highScore}
                </span>
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700">
                <Hash className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Average Score
                </span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">
                  {formatAverage(stats.averageScore)}
                </span>
              </div>
            </div>

            {/* Games Played */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700">
                <Percent className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Games Played
                </span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">
                  {stats.gamesPlayed}
                </span>
              </div>
            </div>

            {/* Yahtzees Rolled */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
                <Star className="w-5 h-5 fill-emerald-100" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Yahtzees
                </span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">
                  {stats.yahtzeesRolledCount}
                </span>
              </div>
            </div>

            {/* Wilds Rolled */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
                <Star className="w-5 h-5 fill-amber-500 text-amber-950" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Wilds Rolled
                </span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">
                  {stats.wildDiceRolledCount}
                </span>
              </div>
            </div>
          </div>

          {/* History List */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Recent Games
            </span>

            {history.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No historical matches found.</span>
            ) : (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        Score: {entry.score}
                      </span>
                      <span className="text-[10px] text-slate-400">{entry.date}</span>
                    </div>

                    <div className="flex gap-2">
                      {entry.yahtzeeCount > 0 && (
                        <div className="bg-amber-50 text-amber-800 font-bold border border-amber-200 px-2 py-0.5 rounded-lg text-[9px] font-mono flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          Y: {entry.yahtzeeCount}
                        </div>
                      )}
                      <div className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg text-[9px] font-mono">
                        Wilds: {entry.wildsUsed}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
