import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, Rotate3d, ZoomIn, Move, Sparkles } from 'lucide-react';

interface GestureTutorialProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function GestureTutorial({ forceShow = false, onClose }: GestureTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenGestureTutorial');
    if (!hasSeen || forceShow) {
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenGestureTutorial', 'true');
    setIsVisible(false);
    if (onClose) onClose();
  };

  const steps = [
    {
      icon: <Rotate3d className="text-amber-400 w-6 h-6 animate-pulse" />,
      title: "Rotate & Orbit",
      description: "Left-click & Drag (Desktop) or Drag with 1 finger (Mobile) to rotate and orbit around the majestic star systems.",
    },
    {
      icon: <ZoomIn className="text-amber-400 w-6 h-6" />,
      title: "Deep Zoom",
      description: "Scroll mouse wheel (Desktop) or Pinch in/out with 2 fingers (Mobile) to submerge deeper into stellar nebulas.",
    },
    {
      icon: <Move className="text-amber-400 w-6 h-6" />,
      title: "Gliding Pan",
      description: "Right-click & Drag (Desktop) or Drag with 2 fingers (Mobile) to glide through different celestial sections.",
    },
    {
      icon: <Sparkles className="text-amber-400 w-6 h-6" />,
      title: "Divine Interaction",
      description: "Click or Tap on any glowing star constellation to summon its specific Name of Allah, meanings, and blessings.",
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden bg-slate-950/90 border border-amber-500/20 rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Rotate3d className="text-amber-400 w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-500/80 font-bold block">First-Time Guide</span>
                  <h3 className="text-base font-semibold text-white tracking-wide">3D Constellation Exploration</h3>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Instructions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-all group"
                >
                  <div className="p-2 bg-amber-500/5 rounded-xl border border-amber-500/10 group-hover:bg-amber-500/10 transition-colors shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-amber-200 mb-1">{step.title}</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer button */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-white/5 pt-5">
              <span className="text-[10px] font-mono text-gray-500 tracking-wider">
                💡 Revisit this anytime by clicking the <HelpCircle className="inline w-3.5 h-3.5 mb-0.5" /> in the top right.
              </span>
              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/10 hover:scale-102 active:scale-98"
              >
                Begin Constellation Journey
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
