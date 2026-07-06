import React, { useEffect, useRef, useState } from 'react';
import { audio } from '../audio';

interface AudioEqualizerProps {
  audioEnabled: boolean;
  theme: 'slate' | 'gold' | 'emerald' | 'rose' | 'ruby' | 'nebula' | 'sapphire' | 'amber' | 'amethyst';
}

export const AudioEqualizer: React.FC<AudioEqualizerProps> = ({ audioEnabled, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [heights, setHeights] = useState<number[]>([4, 4, 4, 4, 4, 4, 4, 4]);

  useEffect(() => {
    if (!audioEnabled) {
      // Return to baseline when muted
      setHeights([4, 4, 4, 4, 4, 4, 4, 4]);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const barCount = 8;
    const updateEqualizer = () => {
      const data = audio.getFrequencyData();
      
      if (data && data.length > 0) {
        // We have Web Audio API data!
        // Select specific frequency ranges from low to high
        const step = Math.floor(data.length / barCount);
        const newHeights = Array.from({ length: barCount }, (_, i) => {
          let sum = 0;
          const start = i * step;
          const end = start + step;
          for (let j = start; j < end; j++) {
            sum += data[j] || 0;
          }
          const avg = sum / step;
          
          // Map to height range 4px to 28px
          const minHeight = 4;
          const maxHeight = 28;
          const height = minHeight + (avg / 255) * (maxHeight - minHeight);
          return Math.max(minHeight, Math.min(maxHeight, height));
        });
        setHeights(newHeights);
      } else {
        // Fallback: Ambient/subtle random breathing heights if audio is enabled but ctx is not fully running yet
        const time = Date.now() * 0.003;
        const newHeights = Array.from({ length: barCount }, (_, i) => {
          const sinVal = Math.sin(time + i * 0.5) * Math.cos(time * 0.7 - i * 0.3);
          const height = 10 + (sinVal + 1) * 7; // range 4px to 24px
          return Math.max(4, Math.min(28, height));
        });
        setHeights(newHeights);
      }
      
      animationRef.current = requestAnimationFrame(updateEqualizer);
    };

    updateEqualizer();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioEnabled]);

  // Determine active color accent based on current celestial theme
  const getThemeColorClass = () => {
    switch (theme) {
      case 'gold':
        return 'bg-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
      case 'emerald':
        return 'bg-emerald-400 border-emerald-500/50 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
      case 'rose':
        return 'bg-fuchsia-400 border-fuchsia-500/50 shadow-[0_0_8px_rgba(244,114,182,0.5)]';
      case 'ruby':
        return 'bg-red-400 border-red-500/50 shadow-[0_0_8px_rgba(248,113,113,0.5)]';
      case 'nebula':
        return 'bg-violet-400 border-violet-500/50 shadow-[0_0_8px_rgba(167,139,250,0.5)]';
      case 'sapphire':
        return 'bg-blue-400 border-blue-500/50 shadow-[0_0_8px_rgba(96,165,250,0.5)]';
      case 'amber':
        return 'bg-orange-400 border-orange-500/50 shadow-[0_0_8px_rgba(251,146,60,0.5)]';
      case 'amethyst':
        return 'bg-purple-400 border-purple-500/50 shadow-[0_0_8px_rgba(192,132,252,0.5)]';
      default:
        return 'bg-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    }
  };

  const activeColor = getThemeColorClass();

  return (
    <div 
      ref={containerRef}
      className="flex items-end gap-[2px] h-[32px] px-2 py-0.5 rounded-lg bg-black/30 border border-white/5 select-none shrink-0"
      title={audioEnabled ? "Audio Atmospheric Waves (Active)" : "Equalizer (Muted)"}
    >
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[2.5px] rounded-t-[1.5px] border-t border-x transition-all duration-75 ${
            audioEnabled ? activeColor : 'bg-slate-700 border-transparent h-[4px]'
          }`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
};
