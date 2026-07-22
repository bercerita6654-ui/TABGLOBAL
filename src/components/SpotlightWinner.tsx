import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, RefreshCw, Eye, Calendar, Award } from 'lucide-react';
import { Winner } from '../types';
import confetti from 'canvas-confetti';

interface SpotlightWinnerProps {
  filteredWinners: Winner[];
  onSelectWinner: (winner: Winner) => void;
}

export default function SpotlightWinner({ filteredWinners, onSelectWinner }: SpotlightWinnerProps) {
  const [spotlightWinner, setSpotlightWinner] = useState<Winner | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState(0);

  // Reset or clear spotlight if current list becomes empty or selected winner is no longer in filtered list
  useEffect(() => {
    if (filteredWinners.length === 0) {
      setSpotlightWinner(null);
    } else if (spotlightWinner && !filteredWinners.some(w => w.driveId === spotlightWinner.driveId)) {
      // Keep it if still matches, otherwise reset so the user can spin for the new filter
      setSpotlightWinner(null);
    }
  }, [filteredWinners, spotlightWinner]);

  const startShuffle = () => {
    if (filteredWinners.length === 0 || isShuffling) return;

    setIsShuffling(true);
    let count = 0;
    const totalSteps = 20; // Number of cycles
    const intervalTime = 70; // Speed of cycle in ms

    const timer = setInterval(() => {
      // Pick a random index
      const randIdx = Math.floor(Math.random() * filteredWinners.length);
      setShuffleIndex(randIdx);
      
      count++;
      if (count >= totalSteps) {
        clearInterval(timer);
        
        // Final selection
        const finalIdx = Math.floor(Math.random() * filteredWinners.length);
        const finalWinner = filteredWinners[finalIdx];
        
        setSpotlightWinner(finalWinner);
        setIsShuffling(false);

        // Elegant confetti explosion
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899']
        });
        
        // Left side cannon
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.8 }
        });

        // Right side cannon
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.8 }
        });
      }
    }, intervalTime);
  };

  // The item shown in the preview during shuffling vs selected
  const activeDisplayWinner = isShuffling 
    ? filteredWinners[shuffleIndex] 
    : spotlightWinner;

  if (filteredWinners.length === 0) return null;

  return (
    <div id="spotlight-section" className="mb-8 relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      {/* Spotlight Beam Visual Effect (subtle background lighting) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side Info / Title */}
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span>Spesial Spotlight</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-800">
            Sorotan Keberuntungan Pemenang
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
            Pilih secara acak satu pemenang beruntung dari daftar terfilter saat ini untuk diberikan sorotan utama dan visualisasi apresiasi di layar presentasi Anda.
          </p>

          <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
            <button
              onClick={startShuffle}
              disabled={isShuffling}
              className={`relative px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                isShuffling ? 'opacity-85 pointer-events-none scale-95' : ''
              }`}
            >
              {isShuffling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengundi Pemenang...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{spotlightWinner ? 'Putar Ulang Spotlight' : 'Mulai Pilih Spotlight'}</span>
                </>
              )}
            </button>
            {spotlightWinner && !isShuffling && (
              <button
                onClick={() => setSpotlightWinner(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Reset Sorotan
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Showcase Container */}
        <div className="w-full md:w-auto flex justify-center shrink-0">
          <AnimatePresence mode="wait">
            {activeDisplayWinner ? (
              <motion.div
                key={activeDisplayWinner.driveId || 'active-display'}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className={`w-full max-w-md md:w-96 bg-slate-50/50 rounded-2xl border p-4 flex gap-4 items-center transition-all duration-300 relative overflow-hidden ${
                  isShuffling 
                    ? 'border-blue-300 shadow-inner bg-blue-50/20' 
                    : 'border-amber-300 bg-amber-50/20 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400/20'
                }`}
              >
                {/* Spotlight Beam Diagonal Glow Overlay (Only visible when selected & not shuffling) */}
                {!isShuffling && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transform translate-x-[-100%] animate-shimmer" />
                )}

                {/* Photo frame */}
                <div className="relative w-20 h-24 bg-white border rounded-xl overflow-hidden shadow-sm shrink-0">
                  <img
                    src={activeDisplayWinner.primaryImgUrl}
                    alt={activeDisplayWinner.name}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isShuffling ? 'scale-105 filter blur-[0.5px]' : 'hover:scale-110'
                    }`}
                  />
                  {/* Decorative badge */}
                  {!isShuffling && (
                    <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-md p-1 shadow-md">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Text & Actions */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                      {isShuffling ? 'Mengacak...' : 'Spotlight Terpilih'}
                    </span>
                    <h4 className={`text-base font-black truncate leading-tight mt-0.5 ${
                      isShuffling ? 'text-blue-700' : 'text-slate-800'
                    }`}>
                      {activeDisplayWinner.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{activeDisplayWinner.date}</span>
                    </p>
                  </div>

                  {!isShuffling && (
                    <button
                      onClick={() => onSelectWinner(activeDisplayWinner)}
                      className="mt-2 self-start inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black rounded-lg shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail Dokumentasi
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="w-full md:w-96 h-32 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50">
                <Award className="w-8 h-8 text-slate-300 mb-1.5 animate-bounce-slow" />
                <h4 className="text-xs font-bold text-slate-600">Belum Ada Sorotan</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Klik tombol mulai untuk memilih pemenang secara acak.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
