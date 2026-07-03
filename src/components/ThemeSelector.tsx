import { Pencil, FileText, StickyNote, Sparkles } from 'lucide-react';

export type ThemeType = 'blue' | 'white' | 'yellow';

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onChangeTheme: (theme: ThemeType) => void;
}

export default function ThemeSelector({ currentTheme, onChangeTheme }: ThemeSelectorProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl animate-pulse">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Tema Halaman (Alat Tulis)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Personalisasi tampilan galeri dengan gaya buku catatan favoritmu</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Tema Biru (Buku Kotak) */}
        <button
          onClick={() => onChangeTheme('blue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-300 shadow-sm relative overflow-hidden ${
            currentTheme === 'blue'
              ? 'bg-[#e0f2fe] text-blue-700 border-blue-400 scale-105 shadow-blue-100'
              : 'bg-[#f0f9ff] text-slate-600 border-slate-100 hover:border-blue-200 hover:text-blue-600'
          }`}
        >
          {/* Grid pattern miniature in button background */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
            backgroundSize: '8px 8px'
          }} />
          <Pencil className="w-4 h-4 text-blue-500 relative z-10" />
          <span className="relative z-10">Buku Kotak (Biru)</span>
        </button>

        {/* Tema Putih (Kertas Bergaris) */}
        <button
          onClick={() => onChangeTheme('white')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-300 shadow-sm relative overflow-hidden ${
            currentTheme === 'white'
              ? 'bg-slate-100 text-slate-800 border-slate-400 scale-105 shadow-slate-100'
              : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:text-slate-800'
          }`}
        >
          {/* Lined pattern miniature in button background */}
          <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '100% 6px'
          }} />
          {/* Red margin line simulation */}
          <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-red-300/60 z-10" />
          <FileText className="w-4 h-4 text-slate-500 relative z-10 pl-1" />
          <span className="relative z-10">Kertas Garis (Putih)</span>
        </button>

        {/* Tema Kuning (Catatan Memo) */}
        <button
          onClick={() => onChangeTheme('yellow')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-300 shadow-sm relative overflow-hidden ${
            currentTheme === 'yellow'
              ? 'bg-[#fef9c3] text-amber-800 border-amber-400 scale-105 shadow-amber-100'
              : 'bg-[#fefce8] text-slate-600 border-slate-100 hover:border-amber-200 hover:text-amber-700'
          }`}
        >
          {/* Dot pattern miniature in button background */}
          <div className="absolute inset-0 opacity-[0.2] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)',
            backgroundSize: '6px 6px'
          }} />
          <StickyNote className="w-4 h-4 text-amber-600 relative z-10" />
          <span className="relative z-10">Catatan Memo (Kuning)</span>
        </button>
      </div>
    </div>
  );
}
