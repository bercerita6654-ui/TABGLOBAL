import { useState, useEffect } from 'react';
import { Gift, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

interface HeaderProps {
  loadData: () => void;
  winnerCount: number;
  isTheaterMode: boolean;
  setIsTheaterMode: (val: boolean) => void;
}

export default function Header({ loadData, winnerCount, isTheaterMode, setIsTheaterMode }: HeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    // 1. Toggle simulated full screen / theater mode (works in any sandbox/iframe)
    setIsTheaterMode(!isTheaterMode);

    // 2. Attempt native full screen as progressive enhancement
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen request failed or was blocked inside iframe context. Using simulated presentation mode.", err);
    }
  };

  return (
    <header className="flex items-center justify-between px-8 h-20 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Gift className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Lucky Draw TAB 2026</h1>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">GLOBAL MART</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">{winnerCount} Pemenang</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleFullscreen} 
            title={isTheaterMode || isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh (Presentasi)"} 
            className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 font-medium text-xs px-3"
          >
            {isTheaterMode || isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">Keluar Presentasi</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">Mode Presentasi</span>
              </>
            )}
          </button>
          <button onClick={loadData} title="Muat Ulang Data" className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <img 
          src="https://lh3.googleusercontent.com/d/1dyed9YL6QxBSDefdx47sf8pWXUVWD3nc" 
          alt="Logo TAB 2026" 
          className="h-12 w-auto object-contain"
        />
      </div>
    </header>
  );
}
