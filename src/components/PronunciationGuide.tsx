import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, Volume2 } from 'lucide-react';

interface SyllableBreakdown {
  text: string;
  detail: string;
}

interface PronunciationData {
  phonetic: string;
  syllables: SyllableBreakdown[];
  tip: string;
}

interface PronunciationGuideProps {
  nameId: number;
  transliteration: string;
  arabicName: string;
  onPlayAudio?: () => void;
}

export function getPronunciationData(nameId: number, transliteration: string): PronunciationData {
  const customGuides: Record<number, PronunciationData> = {
    1: {
      phonetic: "Ar-Rah-maan",
      syllables: [
        { text: "Ar", detail: "Heavy rolling double 'R' sound, completely blending the 'l'" },
        { text: "Rah", detail: "Sharp, breathy 'H' (ح) from the middle of the throat" },
        { text: "maan", detail: "Prolonged 'aa' sound, hold for 2-4 beats before finishing with soft 'n'" }
      ],
      tip: "The letter 'Haa' (ح) is breathy and deep from the middle throat, distinct from English 'h'."
    },
    2: {
      phonetic: "Ar-Ra-heem",
      syllables: [
        { text: "Ar", detail: "Heavy rolling double 'R' merging the 'l'" },
        { text: "Ra", detail: "Short, open 'a' with a heavy, thick 'R'" },
        { text: "heem", detail: "Deep middle-throat breathy 'H', with a stretched 'ee' sound" }
      ],
      tip: "Hold the double 'R' (shaddah) briefly, and stretch the 'heem' syllable for 2 beats."
    },
    3: {
      phonetic: "Al-Ma-lik",
      syllables: [
        { text: "Al", detail: "Clear 'L' sound with the tongue touching the upper palate" },
        { text: "Ma", detail: "Short, soft 'M' vowel" },
        { text: "lik", detail: "Short 'i' as in 'lick' with a crisp, light 'k'" }
      ],
      tip: "Avoid prolonging any vowels here. Speak with a crisp, steady meter."
    },
    4: {
      phonetic: "Al-Qud-doos",
      syllables: [
        { text: "Al", detail: "Soft tongue-tap 'L' sound" },
        { text: "Qud", detail: "Deep, guttural 'Q' (ق) sound from the back of the throat" },
        { text: "doos", detail: "Emphasized doubled 'd' with an elongated 'oo' sound" }
      ],
      tip: "The 'Q' comes from the deepest part of the tongue; emphasize the doubled 'd' sound firmly."
    },
    5: {
      phonetic: "As-Sa-laam",
      syllables: [
        { text: "As", detail: "Sharp whistling 'S' (س) merging the 'l'" },
        { text: "Sa", detail: "Soft 's' with light 'a' vowel" },
        { text: "laam", detail: "Stretched 'aa' sound with soft ending 'm'" }
      ],
      tip: "Produce a clean whistling sound for 'S' and prolong 'laam' for 2-4 beats."
    }
  };

  if (customGuides[nameId]) {
    return customGuides[nameId];
  }

  // Fallback dynamic generator based on transliteration splits
  const parts = transliteration.split('-');
  const syllables = parts.map((part, index) => {
    let detail = "Vocalize clearly with normal emphasis";
    const lower = part.toLowerCase();
    if (lower === 'al' || lower === 'ar' || lower === 'as' || lower === 'ad' || lower === 'an' || lower === 'at' || lower === 'az') {
      detail = `Introductory solar/lunar article, merging with subsequent consonant`;
    } else if (lower.includes('sh') || lower.includes('kh') || lower.includes('gh')) {
      detail = `Requires guttural friction or rasping sound`;
    } else if (lower.includes('q')) {
      detail = `Deep throat-based 'Q' (Qaf) sound`;
    } else if (index === parts.length - 1) {
      detail = `Final prolonged syllable, stretch the vowel sound slightly`;
    }
    return { text: part, detail };
  });

  return {
    phonetic: parts.join('-'),
    syllables,
    tip: "Prolong vowels marked with a macron or double letters, and emphasize doubled consonants with a firm hold (shaddah)."
  };
}

export function PronunciationGuide({ nameId, transliteration, arabicName, onPlayAudio }: PronunciationGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const data = getPronunciationData(nameId, transliteration);

  return (
    <div className="relative inline-block z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-gray-300 hover:text-amber-300 transition-all text-[10px] uppercase font-mono tracking-wider"
        title="Show Pronunciation Breakdown"
      >
        <HelpCircle size={11} className="text-amber-500/80" />
        <span>Pronunciation Guide</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click-away */}
            <div 
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-10 right-0 md:left-0 md:right-auto z-50 w-72 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500 text-xs">◆</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 font-bold">Phonetics Breakdown</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white p-0.5 rounded-full hover:bg-white/5 transition-all"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Syllable layout */}
              <div className="flex flex-col gap-2.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Phonetic Spelling:</span>
                  <span className="text-xs font-mono font-semibold text-white bg-black/40 px-2 py-0.5 rounded border border-white/5">
                    {data.phonetic}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[9px] uppercase font-mono tracking-wider text-gray-500">Syllable Guide</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {data.syllables.map((syl, i) => (
                      <div key={i} className="flex gap-2.5 items-start text-xs bg-black/20 p-2 rounded-lg border border-white/5">
                        <span className="font-mono text-amber-400 font-bold shrink-0 min-w-[2.5rem] bg-amber-500/10 px-1.5 py-0.5 rounded text-center">
                          {syl.text}
                        </span>
                        <span className="text-gray-300 text-[11px] leading-relaxed">{syl.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tajweed tip */}
              <div className="border-t border-white/5 pt-2.5 mt-2 text-[10px] text-amber-200/80 leading-relaxed font-sans bg-amber-950/15 p-2 rounded-lg border border-amber-500/10">
                <span className="font-semibold text-amber-400 font-mono block mb-0.5">💡 RECITATION RULE</span>
                {data.tip}
              </div>

              {onPlayAudio && (
                <button
                  onClick={() => {
                    onPlayAudio();
                    setIsOpen(false);
                  }}
                  className="mt-3 w-full py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Volume2 size={10} />
                  <span>Listen Recitation</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
