import React, { useState } from 'react';
import { X, Flame, Trophy, Award, Layers, Sparkles, BookOpen, Heart, Check, Calendar, ArrowRight, RotateCw, Globe } from 'lucide-react';

interface LearningModuleProps {
  isOpen: boolean;
  onClose: () => void;
}

// -------------------------------------------------------------
// 1. SPIRITUAL STREAK & CONTRIBUTION DASHBOARD
// -------------------------------------------------------------
interface DashboardProps extends LearningModuleProps {
  recitationHistory: Array<{ timestamp: string; nameId: number; nameTranslit: string }>;
  getStreaks: () => { currentStreak: number; maxStreak: number; lastRecitation: string | null };
  completedCount: number;
  favoritesCount: number;
}

export const SpiritualDashboardModal: React.FC<DashboardProps> = ({
  isOpen,
  onClose,
  recitationHistory,
  getStreaks,
  completedCount,
  favoritesCount,
}) => {
  if (!isOpen) return null;

  const streaks = getStreaks();
  
  // Generate last 30 days contribution stats
  const contributionGrid = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - idx));
    const dateStr = d.toDateString();
    
    // Count recitations on this day
    const count = recitationHistory.filter(h => {
      const hDate = new Date(h.timestamp).toDateString();
      return hDate === dateStr;
    }).length;

    return {
      date: d,
      count,
      label: `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${count} recital${count !== 1 ? 's' : ''}`
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#09090c]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg text-amber-50 font-light tracking-wide uppercase">Spiritual Sanctuary</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Real-time Recitation Logs & Streaks</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Streaks Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Streak Card */}
          <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4.5 flex items-center gap-4 relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-amber-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Flame size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Current Streak</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-light text-white font-display">{streaks.currentStreak}</span>
                <span className="text-xs text-orange-400 font-mono font-bold">Days</span>
              </div>
            </div>
          </div>

          {/* Record Streak Card */}
          <div className="bg-gradient-to-br from-yellow-500/5 to-amber-500/5 border border-white/5 rounded-2xl p-4.5 flex items-center gap-4 relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-yellow-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0">
              <Trophy size={22} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Record Streak</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-light text-white font-display">{streaks.maxStreak}</span>
                <span className="text-xs text-yellow-400 font-mono font-bold">Days</span>
              </div>
            </div>
          </div>

          {/* Core metrics Card */}
          <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-white/5 rounded-2xl p-4.5 flex items-center gap-4 relative overflow-hidden group shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Spiritual Focus</span>
              <div className="flex items-baseline gap-3 mt-1 text-xs text-slate-300 font-mono">
                <span>Completed: <strong className="text-white font-sans">{completedCount}</strong></span>
                <span>Favs: <strong className="text-white font-sans">{favoritesCount}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub-style Contribution Heatmap */}
        <div className="bg-black/50 border border-white/5 rounded-2xl p-5 flex flex-col gap-4.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <Calendar size={12} className="text-amber-500" />
              Remembrance Heatmap (Last 30 Days)
            </span>
            <span className="text-[8px] font-mono text-slate-500 uppercase">Interactive Log Tracker</span>
          </div>

          {/* The grid layout */}
          <div className="grid grid-cols-10 gap-2.5 p-1">
            {contributionGrid.map((day, dIdx) => {
              // Color scale
              let colorClass = 'bg-white/5 hover:bg-white/10 border-white/5';
              if (day.count > 0 && day.count <= 2) colorClass = 'bg-amber-500/20 border-amber-500/30 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)]';
              else if (day.count > 2 && day.count <= 5) colorClass = 'bg-amber-500/40 border-amber-500/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
              else if (day.count > 5) colorClass = 'bg-amber-500 border-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] font-semibold';

              return (
                <div 
                  key={dIdx} 
                  title={day.label}
                  className={`h-11 rounded-lg border flex flex-col items-center justify-center text-[10px] font-mono transition-all duration-300 relative group cursor-pointer hover:scale-105 active:scale-95 ${colorClass}`}
                >
                  <span>{day.date.getDate()}</span>
                  {day.count > 0 && (
                    <span className="text-[7px] opacity-75 font-bold mt-0.5">{day.count}x</span>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-12 scale-0 group-hover:scale-100 transition-all origin-bottom bg-black border border-white/10 text-white rounded-md px-2 py-1 text-[8px] tracking-wide whitespace-nowrap z-50 pointer-events-none font-sans font-medium shadow-2xl">
                    {day.label}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1.5 border-t border-white/5">
            <span>30 days ago</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="w-2.5 h-2.5 bg-white/5 rounded border border-white/5" />
              <div className="w-2.5 h-2.5 bg-amber-500/20 rounded border border-amber-500/30" />
              <div className="w-2.5 h-2.5 bg-amber-500/40 rounded border border-amber-500/50" />
              <div className="w-2.5 h-2.5 bg-amber-500 rounded border border-amber-600" />
              <span>More</span>
            </div>
            <span>Today</span>
          </div>
        </div>

        {/* Log feed */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Recent Playback History</span>
          {recitationHistory.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto no-scrollbar">
              {recitationHistory.slice(-5).reverse().map((log, lIdx) => (
                <div key={lIdx} className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs">🎧</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white font-sans">{log.nameTranslit}</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Recited & Reflected</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] font-mono text-slate-500 italic py-2 text-center bg-white/5 border border-dashed border-white/5 rounded-xl">
              No recitations recorded yet. Start a loop queue or listen to divine names to seed your sanctuary.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. LEITNER SPACED REPETITION FLASHCARDS GAME
// -------------------------------------------------------------
interface FlashcardsProps extends LearningModuleProps {
  leitnerBoxes: { [key: string]: number };
  onUpdateBox: (nameId: number, targetBox: number) => void;
  namesOfAllah: any[];
  remindersEnabled: boolean;
  onToggleReminders: () => void;
  onTestReminders?: () => void;
}

export const FlashcardsModal: React.FC<FlashcardsProps> = ({
  isOpen,
  onClose,
  leitnerBoxes,
  onUpdateBox,
  namesOfAllah,
  remindersEnabled,
  onToggleReminders,
  onTestReminders,
}) => {
  if (!isOpen) return null;

  const [activeBox, setActiveBox] = useState<number>(1);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Group names by box
  const boxNames = namesOfAllah.filter(name => {
    const box = leitnerBoxes[name.id] || 1;
    return box === activeBox;
  });

  const activeName = boxNames[currentCardIndex];

  const handleBoxSelect = (boxNum: number) => {
    setActiveBox(boxNum);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleAnswer = (mastered: boolean) => {
    if (!activeName) return;
    
    // If mastered, advance to next box (max Box 4), otherwise demote back to Box 1
    const currentBox = leitnerBoxes[activeName.id] || 1;
    let targetBox = mastered ? Math.min(4, currentBox + 1) : 1;

    onUpdateBox(activeName.id, targetBox);

    // Keep state simple
    setIsFlipped(false);
    
    // Move index inside the list
    setTimeout(() => {
      if (currentCardIndex >= boxNames.length - 1) {
        setCurrentCardIndex(0);
      }
    }, 200);
  };

  // Stats for counter badges
  const boxCounts = [1, 2, 3, 4].map(boxNum => {
    return namesOfAllah.filter(n => (leitnerBoxes[n.id] || 1) === boxNum).length;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#09090c]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5 max-h-[95vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg text-amber-50 font-light tracking-wide uppercase">Spaced Repetition</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Leitner Leitner System Memorization Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reminders Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🔔</span>
            <div className="flex flex-col">
              <span className="font-bold text-amber-50">Local Browser Reminders</span>
              <span className="text-[9px] text-slate-400">Alert when Box 2 (48h) or Box 3 (96h) cards are due</span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {remindersEnabled && (
              <button
                onClick={onTestReminders}
                className="px-2 py-1 text-[9px] border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-md transition-all active:scale-95 cursor-pointer"
                title="Send a sample notification to test your browser permissions"
              >
                Test Alert
              </button>
            )}
            <button
              onClick={onToggleReminders}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                remindersEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  remindersEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Spaced Box Selector Rails */}
        <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
          {[
            { id: 1, name: 'Box 1', desc: 'Daily', color: 'border-rose-500/30 bg-rose-500/5 text-rose-300' },
            { id: 2, name: 'Box 2', desc: '3 Days', color: 'border-orange-500/30 bg-orange-500/5 text-orange-300' },
            { id: 3, name: 'Box 3', desc: 'Weekly', color: 'border-amber-500/30 bg-amber-500/5 text-amber-300' },
            { id: 4, name: 'Box 4', desc: 'Mastered', color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' },
          ].map(box => {
            const isActive = activeBox === box.id;
            const count = boxCounts[box.id - 1];
            return (
              <button
                key={box.id}
                onClick={() => handleBoxSelect(box.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all hover:scale-103 cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)] scale-102 font-bold' 
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{box.name}</span>
                <span className="text-[8px] text-slate-500 uppercase">{box.desc}</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold mt-1 ${
                  count > 0 ? box.color : 'bg-white/5 text-slate-600 border-white/5 border'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* FLASHCARD STAGE CONTAINER */}
        {activeName ? (
          <div className="flex flex-col gap-5 pt-3">
            {/* Card view switcher counter */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
              <span>BOX {activeBox} PLAYING</span>
              <span>CARD {currentCardIndex + 1} OF {boxNames.length}</span>
            </div>

            {/* FLIP CARD STAGE */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative h-[250px] w-full cursor-pointer perspective-1000 group"
            >
              <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d shadow-2xl ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT PANEL */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-[#0e0e13]/95 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 shadow-xl">
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 text-[8px] font-mono text-amber-400 font-bold uppercase">
                    <span>{activeName.category}</span>
                  </div>
                  
                  <span className="font-arabic text-6xl text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)] select-none">
                    {activeName.name}
                  </span>
                  
                  <div className="flex flex-col gap-0.5 mt-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Tap Card To Reveal Depth</span>
                    <div className="flex items-center justify-center gap-1 text-slate-400 hover:text-white mt-1 text-[11px] font-mono">
                      <RotateCw size={10} className="animate-spin-slow text-amber-500" />
                      <span>Flip Card</span>
                    </div>
                  </div>
                </div>

                {/* BACK PANEL */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-[#0e0e13]/95 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-3.5 shadow-xl">
                  <span className="font-mono text-xs tracking-[0.25em] uppercase font-bold text-amber-300">
                    {activeName.transliteration}
                  </span>
                  
                  <div className="border-y border-white/5 py-1.5 w-full">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-0.5">Meaning</span>
                    <p className="text-sm text-white font-light tracking-wide">{activeName.english}</p>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans max-h-[80px] overflow-y-auto pr-1">
                    {activeName.explanation}
                  </p>
                  
                  <div className="text-[9px] font-mono text-slate-500 mt-1">
                    Tap to Flip back
                  </div>
                </div>

              </div>
            </div>

            {/* Answer Controls */}
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(false);
                }}
                className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>❌ Needs Review</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(true);
                }}
                className="py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-350 rounded-xl font-mono text-[10px] tracking-wider uppercase font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <span>✓ I Got It!</span>
              </button>
            </div>

            {/* Manual Pagination within box */}
            {boxNames.length > 1 && (
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
                <button 
                  onClick={() => {
                    setCurrentCardIndex(prev => prev === 0 ? boxNames.length - 1 : prev - 1);
                    setIsFlipped(false);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  &larr; Prev
                </button>
                <span className="text-slate-600 font-bold">BOX {activeBox} DECK</span>
                <button 
                  onClick={() => {
                    setCurrentCardIndex(prev => prev === boxNames.length - 1 ? 0 : prev + 1);
                    setIsFlipped(false);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-white/5 bg-white/5 rounded-2xl p-6 mt-4">
            <span className="text-3xl text-slate-600">✨</span>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-white uppercase font-bold">Box {activeBox} is empty!</span>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1 max-w-[280px]">
                {activeBox === 1 
                  ? "All 99 divine names are mastered or advanced to higher boxes! Spectacular milestone."
                  : `Add names to Box ${activeBox} by mastering names in preceding boxes.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. MILESTONE ACHIEVEMENTS & BADGES BOARD
// -------------------------------------------------------------
interface BadgesProps extends LearningModuleProps {
  completed: number[];
  favorites: number[];
  getStreaks: () => { currentStreak: number; maxStreak: number; lastRecitation: string | null };
  reflectionsCount: number;
}

export const BadgesModal: React.FC<BadgesProps> = ({
  isOpen,
  onClose,
  completed,
  favorites,
  getStreaks,
  reflectionsCount,
}) => {
  if (!isOpen) return null;

  const streaks = getStreaks();

  const badgesList = [
    {
      id: 'divine_seeker',
      title: 'Divine Seeker',
      desc: 'Explore or complete recitation of at least 1 divine name.',
      condition: 'completed.length >= 1',
      isUnlocked: completed.length >= 1,
      medal: '🥉',
      color: 'from-amber-600/20 to-amber-900/10 border-amber-600/40 text-amber-200'
    },
    {
      id: 'mercy_devotee',
      title: 'Mercy Devotee',
      desc: 'Complete recitation of all names in the Mercy category.',
      condition: 'Mercy category completed',
      isUnlocked: completed.length >= 9, // Mercy has 9 names
      medal: '🥈',
      color: 'from-fuchsia-600/20 to-fuchsia-900/10 border-fuchsia-600/40 text-fuchsia-200'
    },
    {
      id: 'cosmic_traveler',
      title: 'Cosmic Traveler',
      desc: 'Complete recitation of at least 10 different divine names.',
      condition: 'completed.length >= 10',
      isUnlocked: completed.length >= 10,
      medal: '🥈',
      color: 'from-blue-600/20 to-blue-900/10 border-blue-600/40 text-blue-200'
    },
    {
      id: 'scholarly_writer',
      title: 'Divine Scholar',
      desc: 'Jot down at least 3 custom reflection notes in your private journal.',
      condition: 'reflectionsCount >= 3',
      isUnlocked: reflectionsCount >= 3,
      medal: '🥇',
      color: 'from-purple-600/20 to-purple-900/10 border-purple-600/40 text-purple-200'
    },
    {
      id: 'remembrance_streak',
      title: 'Constant Remembrance',
      desc: 'Maintain a spiritual recitation streak of at least 3 consecutive days.',
      condition: 'maxStreak >= 3',
      isUnlocked: streaks.maxStreak >= 3,
      medal: '🔥',
      color: 'from-orange-600/20 to-orange-900/10 border-orange-600/40 text-orange-200'
    },
    {
      id: 'devotional_companion',
      title: 'Devotional Companion',
      desc: 'Star at least 10 divine names to save into your Favorites list.',
      condition: 'favorites.length >= 10',
      isUnlocked: favorites.length >= 10,
      medal: '💖',
      color: 'from-rose-600/20 to-rose-900/10 border-rose-600/40 text-rose-200'
    },
    {
      id: 'divine_master',
      title: 'Divine Master',
      desc: 'Recite, memorize, and complete all 99 beautiful names of Allah!',
      condition: 'completed.length === 99',
      isUnlocked: completed.length === 99,
      medal: '👑',
      color: 'from-amber-400/30 to-yellow-600/20 border-yellow-500 text-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
    }
  ];

  const unlockedCount = badgesList.filter(b => b.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#09090c]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg text-amber-50 font-light tracking-wide uppercase">Divine Milestones</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Spiritual Achievements & Badges ({unlockedCount} / {badgesList.length})</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global summary count */}
        <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-white/10 rounded-2xl p-4.5 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Spiritual Progression</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-light text-white font-display">{unlockedCount}</span>
            <span className="text-xs text-amber-400 font-mono">/ {badgesList.length} Badges Unlocked</span>
          </div>
          <div className="w-full bg-black/55 rounded-full h-1.5 mt-3 overflow-hidden border border-white/5">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / badgesList.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Achievements Register</span>
          
          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
            {badgesList.map(badge => (
              <div 
                key={badge.id}
                className={`border rounded-2xl p-4 flex items-start gap-4 transition-all duration-300 relative overflow-hidden ${
                  badge.isUnlocked 
                    ? `bg-gradient-to-r ${badge.color}`
                    : 'bg-black/30 border-white/5 text-slate-500 opacity-60'
                }`}
              >
                {/* Visual Circle Medal */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                  badge.isUnlocked 
                    ? 'bg-black/40 border border-white/10 shadow-lg' 
                    : 'bg-black/20 border border-transparent grayscale'
                }`}>
                  <span>{badge.isUnlocked ? badge.medal : '🔒'}</span>
                </div>

                <div className="flex flex-col flex-1 gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${badge.isUnlocked ? 'text-white font-sans' : 'text-slate-500 font-mono'}`}>
                      {badge.title}
                    </span>
                    <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full ${
                      badge.isUnlocked 
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/20' 
                        : 'bg-white/5 text-slate-600'
                    }`}>
                      {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-350 pr-4 mt-0.5">{badge.desc}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[8px] font-mono text-slate-500">
                    <span>Task: {badge.condition}</span>
                    {badge.isUnlocked && (
                      <span className="text-amber-500">Divine Blessing Unlocked</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
