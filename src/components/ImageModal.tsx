import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Sparkles, Clock, Calendar, User } from 'lucide-react';
import { Winner } from '../types';
import confetti from 'canvas-confetti';

interface ImageModalProps {
  winner: Winner | null;
  winners: Winner[];
  onWinnerChange: (winner: Winner | null) => void;
  closeModal: () => void;
}

export default function ImageModal({ winner, winners, onWinnerChange, closeModal }: ImageModalProps) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(1250000); // default: 1250 seconds (1250000ms) untuk transisi sangat lambat & nyaman
  const [progress, setProgress] = useState(0);
  const [enableConfetti, setEnableConfetti] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Find index of current winner in the current list
  const currentIndex = winner ? winners.findIndex(w => w.driveId === winner.driveId) : -1;

  // Fire confetti on active slide change
  useEffect(() => {
    if (winner && enableConfetti) {
      // 1. Central festive burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899']
      });

      // 2. Left side cannon
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#3b82f6', '#f59e0b', '#ef4444']
      });

      // 3. Right side cannon
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#10b981', '#8b5cf6', '#ec4899']
      });
    }
  }, [winner, enableConfetti]);

  // Handle slide navigation
  const handlePrev = () => {
    if (winners.length === 0 || currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + winners.length) % winners.length;
    onWinnerChange(winners[prevIndex]);
  };

  const handleNext = () => {
    if (winners.length === 0 || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % winners.length;
    onWinnerChange(winners[nextIndex]);
  };

  // Keyboard navigation & space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsAutoPlaying(prev => !prev);
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, winners]);

  // Auto-playing core mechanism
  useEffect(() => {
    if (!isAutoPlaying || winners.length <= 1) {
      setProgress(0);
      return;
    }

    const intervalTime = autoPlayInterval;
    const tickTime = 40; // update frequency
    let elapsed = 0;

    const timer = setInterval(() => {
      // Pause ticking if hovered
      if (isHovered) return;

      elapsed += tickTime;
      const percentage = Math.min((elapsed / intervalTime) * 100, 100);
      setProgress(percentage);

      if (elapsed >= intervalTime) {
        elapsed = 0;
        handleNext();
      }
    }, tickTime);

    return () => clearInterval(timer);
  }, [isAutoPlaying, currentIndex, autoPlayInterval, winners, isHovered]);

  if (!winner || currentIndex === -1) return null;

  const fallbackImage = `https://placehold.co/600x1066/f3f4f6/a1a1aa?text=Privasi+Akun/File+Dibatasi`;

  return (
    <div 
      className="fixed inset-0 z-[200] flex flex-col items-center justify-between bg-slate-950/95 backdrop-blur-md p-4 md:p-6 transition-all duration-300"
      onClick={closeModal}
    >
      {/* Top Header Controls Bar */}
      <div 
        className="w-full max-w-5xl flex items-center justify-between gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0 z-50 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-600 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              {currentIndex + 1} / {winners.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-slate-500" /> {winner.date}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs mt-1 flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            {winner.name}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          {/* Confetti Toggle Button */}
          <button
            onClick={() => setEnableConfetti(!enableConfetti)}
            title={enableConfetti ? "Matikan Kembang Api" : "Aktifkan Kembang Api"}
            className={`p-2 rounded-xl transition-all border cursor-pointer ${
              enableConfetti 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-md shadow-amber-500/10' 
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <Sparkles className={`w-4 h-4 md:w-5 h-5 ${enableConfetti ? 'animate-pulse' : ''}`} />
          </button>

          {/* Quick Info text on desktop */}
          <span className="hidden lg:inline text-[10px] text-slate-500 font-mono select-none px-2">
            Gunakan tombol [Spasi] Play, [←] [→] navigasi
          </span>

          {/* Close button */}
          <button 
            onClick={closeModal} 
            className="p-2 text-white bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 rounded-xl transition-colors cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4 md:w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle Stage: Main Slide Area with Arrows */}
      <div 
        className="flex-1 w-full max-w-5xl flex items-center justify-between gap-2 md:gap-6 py-4 md:py-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow Button */}
        <button
          onClick={handlePrev}
          className="p-3 md:p-4 rounded-full bg-slate-900/60 border border-white/10 text-white hover:bg-slate-800 active:scale-90 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10 z-10 shrink-0"
          title="Foto Sebelumnya (←)"
        >
          <ChevronLeft className="w-5 h-5 md:w-7 h-7" />
        </button>

        {/* Image Display Wrapper */}
        <div 
          className="flex-1 max-w-lg mx-auto flex flex-col items-center justify-center relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-slate-900">
            {isAutoPlaying && isHovered && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-bold text-amber-400 flex items-center gap-1.5 animate-pulse select-none z-30 shadow-lg">
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Auto Slide Dijeda (Kursor di Atas Foto)</span>
              </div>
            )}
            <img 
              src={winner.primaryImgUrl} 
              alt={winner.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== winner.secondaryImgUrl) {
                    target.src = winner.secondaryImgUrl;
                } else {
                    target.src = fallbackImage;
                }
              }}
              className="w-full h-auto max-h-[60vh] md:max-h-[65vh] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
            />

            {/* Simulated progress bar underneath the image */}
            {isAutoPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-[40ms] ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleNext}
          className="p-3 md:p-4 rounded-full bg-slate-900/60 border border-white/10 text-white hover:bg-slate-800 active:scale-90 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10 z-10 shrink-0"
          title="Foto Selanjutnya (→)"
        >
          <ChevronRight className="w-5 h-5 md:w-7 h-7" />
        </button>
      </div>

      {/* Bottom Control Center: Auto Slide Configuration */}
      <div 
        className="w-full max-w-md bg-slate-900 border border-white/10 p-4 rounded-2xl flex flex-col gap-3 shrink-0 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-300">Konfigurasi Auto Slide</span>
          </div>
          {isAutoPlaying && (
            <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-extrabold uppercase animate-pulse">
              Aktif
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Main Play / Pause Button */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
              isAutoPlaying 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Slide</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Auto Slide</span>
              </>
            )}
          </button>

          {/* Speed Preset Selections */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {[
              { label: '2s', val: 2000 },
              { label: '5s', val: 5000 },
              { label: '1250s', val: 1250000 }
            ].map(preset => (
              <button
                key={preset.val}
                onClick={() => setAutoPlayInterval(preset.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  autoPlayInterval === preset.val
                    ? 'bg-white text-slate-900 shadow font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Ganti kecepatan ke ${preset.label}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

