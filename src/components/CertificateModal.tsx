import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Download, Sparkles, User } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedCount: number;
  favoritesCount: number;
  userEmail: string | null;
}

export function CertificateModal({ isOpen, onClose, completedCount, favoritesCount, userEmail }: CertificateModalProps) {
  const [recipientName, setRecipientName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (userEmail) {
      // Default name from email (before the @)
      const parts = userEmail.split('@');
      setRecipientName(parts[0].replace(/[^a-zA-Z0-9]/g, ' ').toUpperCase());
    } else {
      setRecipientName('A SEEKER OF TRUTH');
    }
  }, [userEmail, isOpen]);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1200;
    const height = 840;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background Gradient (Deep Space/Cosmic Theme)
    const bgGradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width);
    bgGradient.addColorStop(0, '#111827'); // Slate 900
    bgGradient.addColorStop(0.5, '#030712'); // Gray 950
    bgGradient.addColorStop(1, '#020617'); // Slate 950
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Stars/Nebula background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Ambient Glows
    const glow1 = ctx.createRadialGradient(150, 150, 0, 150, 150, 300);
    glow1.addColorStop(0, 'rgba(245, 158, 11, 0.05)'); // Amber 500
    glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width - 150, height - 150, 0, width - 150, height - 150, 300);
    glow2.addColorStop(0, 'rgba(168, 85, 247, 0.05)'); // Purple 500
    glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // 4. Draw Double Border (Elegant Gold)
    const padding = 45;
    ctx.strokeStyle = '#d97706'; // Amber 600
    ctx.lineWidth = 4;
    ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);

    const innerPadding = 55;
    ctx.strokeStyle = '#f59e0b'; // Amber 500
    ctx.lineWidth = 1;
    ctx.strokeRect(innerPadding, innerPadding, width - innerPadding * 2, height - innerPadding * 2);

    // Corner Geometric Ornaments (Arabesque details)
    const drawCorner = (x: number, y: number, rX: number, rY: number) => {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + rX * 25, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + rY * 25);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + rX * 15, y + rY * 15);
      ctx.lineTo(x + rX * 5, y + rY * 15);
      ctx.lineTo(x + rX * 5, y + rY * 5);
      ctx.stroke();
    };

    drawCorner(innerPadding, innerPadding, 1, 1); // Top Left
    drawCorner(width - innerPadding, innerPadding, -1, 1); // Top Right
    drawCorner(innerPadding, height - innerPadding, 1, -1); // Bottom Left
    drawCorner(width - innerPadding, height - innerPadding, -1, -1); // Bottom Right

    // 5. Draw Header Logo/Emblem
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    
    // Draw an Islamic 8-point star (Rub el Hizb) symbol
    const cX = width / 2;
    const cY = 150;
    const size = 30;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.rect(cX - size / 2, cY - size / 2, size, size);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.save();
    ctx.translate(cX, cY);
    ctx.rotate(Math.PI / 4);
    ctx.rect(-size / 2, -size / 2, size, size);
    ctx.restore();
    ctx.stroke();

    // Draw center point in star
    ctx.beginPath();
    ctx.arc(cX, cY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();

    // 6. Certificate Text Typography
    // Category title
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.letterSpacing = '6px';
    ctx.fillText('CELESTIAL NAVIGATION ACCOMPLISHMENT', width / 2, 230);

    // Main Certificate Title
    ctx.font = 'normal 42px "Playfair Display", "Times New Roman", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '2px';
    ctx.fillText('Certificate of Divine Reflection', width / 2, 290);

    // Subtitle / Journey description
    ctx.font = 'normal 15px monospace';
    ctx.fillStyle = '#94a3b8'; // Slate 400
    ctx.letterSpacing = '3px';
    ctx.fillText('ASMA-UL-HUSNA 3D CONSTELLATION CONQUEST', width / 2, 335);

    // Body text
    ctx.font = 'normal 18px Georgia, serif';
    ctx.fillStyle = '#cbd5e1'; // Slate 300
    ctx.letterSpacing = '1px';
    ctx.fillText('This certifies that the seeker', width / 2, 400);

    // Recipient Name
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillStyle = '#fbbf24'; // Amber 400
    ctx.letterSpacing = '2px';
    ctx.fillText(recipientName.toUpperCase(), width / 2, 470);

    // Border line under name
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 495);
    ctx.lineTo(width / 2 + 200, 495);
    ctx.stroke();

    // Achievements Description
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('has successfully traversed the infinite 3D galaxy of the 99 Beautiful Names of Allah,', width / 2, 540);
    ctx.fillText('meditating upon their profound spiritual depth, recitation audio, and theological meanings.', width / 2, 565);

    // 7. Render dynamic user stats boxes
    const statsY = 640;
    
    // Completed Names Box
    const boxWidth = 180;
    const boxHeight = 70;
    const boxX1 = width / 2 - 220;
    
    ctx.fillStyle = 'rgba(17, 24, 39, 0.6)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX1, statsY, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${completedCount}/99`, boxX1 + boxWidth / 2, statsY + 32);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.letterSpacing = '1px';
    ctx.fillText('COMPLETED NAMES', boxX1 + boxWidth / 2, statsY + 52);

    // Favorited Names Box
    const boxX2 = width / 2 + 40;
    ctx.fillStyle = 'rgba(17, 24, 39, 0.6)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(boxX2, statsY, boxWidth, boxHeight, 10);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${favoritesCount}`, boxX2 + boxWidth / 2, statsY + 32);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.letterSpacing = '1px';
    ctx.fillText('FAVORITED NAMES', boxX2 + boxWidth / 2, statsY + 52);

    // 8. Draw Date & Signature line
    const footerY = 750;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Date Line
    ctx.beginPath();
    ctx.moveTo(150, footerY);
    ctx.lineTo(350, footerY);
    ctx.stroke();

    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'normal 13px Georgia, serif';
    ctx.fillText(dateStr, 250, footerY - 12);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.letterSpacing = '1px';
    ctx.fillText('DATE OF TRAVERSAL', 250, footerY + 15);

    // Signature Line
    ctx.beginPath();
    ctx.moveTo(width - 350, footerY);
    ctx.lineTo(width - 150, footerY);
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillText('Celestial Journey Team', width - 250, footerY - 12);
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.letterSpacing = '1px';
    ctx.fillText('AUTHORIZED SIGNATURE', width - 250, footerY + 15);
  };

  const handleDownload = () => {
    setIsGenerating(true);
    // Give state a fraction of a second to render
    setTimeout(() => {
      try {
        drawCertificate();
        const canvas = canvasRef.current;
        if (!canvas) throw new Error('Canvas not found');
        
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Asma-ul-Husna-Certificate-${recipientName.replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Failed to generate certificate:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  // Trigger drawing when recipient name changes, or modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(drawCertificate, 100);
    }
  }, [recipientName, isOpen, completedCount, favoritesCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950/95 border border-amber-500/25 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Award size={18} className="animate-pulse" />
                </div>
                <div>
                  <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest font-bold block">Digital Reward Portal</span>
                  <h3 className="text-base font-semibold text-white tracking-wide">Generate Progress Certificate</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Input & Customization form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 flex flex-col gap-4">
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Honoring your spiritual path! Enter your name to customize a high-resolution, downloadable digital certificate showcasing your 99 Names constellation progression.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-amber-400/80 font-bold">Your Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      maxLength={40}
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="ENTER NAME FOR CERTIFICATE"
                      className="w-full pl-9 pr-4 py-2 text-xs font-mono bg-black/50 border border-white/10 rounded-xl focus:border-amber-500/50 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all uppercase"
                    />
                  </div>
                </div>

                <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2 font-mono">
                  <span className="text-[9px] uppercase tracking-wider text-gray-500">Milestone Analytics</span>
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Names Completed:</span>
                    <span className="font-semibold text-white">{completedCount} / 99</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>Names Favorited:</span>
                    <span className="font-semibold text-white">{favoritesCount}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${(completedCount / 99) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 hover:scale-102 active:scale-98"
                >
                  <Download size={14} />
                  <span>{isGenerating ? 'Generating Image...' : 'Export Certificate'}</span>
                </button>
              </div>

              {/* Certificate Canvas Preview Screen */}
              <div className="md:col-span-2 bg-black/60 border border-white/10 p-2.5 rounded-2xl overflow-hidden shadow-2xl relative aspect-[12/8.4] flex items-center justify-center">
                {/* Visual Preview scale helper */}
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-auto rounded-xl border border-white/5 bg-slate-950 shadow-inner max-h-[50vh] object-contain"
                />
                
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-white/10 px-2 py-1 rounded-md text-[8px] font-mono tracking-widest text-amber-500 font-bold uppercase pointer-events-none select-none">
                  Certificate Preview
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
