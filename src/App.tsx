/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { Winner } from './types';
import Header from './components/Header';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import GalleryMarquee from './components/GalleryMarquee';
import WinnerListView from './components/WinnerListView';
import ImageModal from './components/ImageModal';
import DailyWinnerSummary from './components/DailyWinnerSummary';
import SpotlightWinner from './components/SpotlightWinner';
import ThemeSelector, { ThemeType } from './components/ThemeSelector';
import { ImageOff, Pencil, Ruler, Clipboard, StickyNote, Pin, Gift, Minimize2, Calendar, Eye, LayoutGrid, List } from 'lucide-react';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQs-HvfOGc1iH5Y-5sV3HyDUt3TB0fO7FAF-f5XhqDIaHeH70WcAJ6bA8pL9yW4SvY4Gok32M0fI4Kz/pub?gid=0&single=true&output=csv';

function extractDriveId(url: string) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

function normalizeDateOnly(rawDate: string): string {
  if (!rawDate) return 'Tanggal tidak diketahui';
  const trimmed = rawDate.trim();

  // Extract the date part before any space or 'T' (ignoring hours/minutes/seconds)
  const datePart = trimmed.split(/[ T]/)[0];

  // If in DD/MM/YYYY format (common in Indonesian spreadsheets), parse it manually
  const slashParts = datePart.split('/');
  if (slashParts.length === 3) {
    let day = slashParts[0].padStart(2, '0');
    let month = slashParts[1].padStart(2, '0');
    let year = slashParts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // If in DD-MM-YYYY format, parse it manually
  const dashParts = datePart.split('-');
  if (dashParts.length === 3) {
    let part1 = dashParts[0];
    let part2 = dashParts[1];
    let part3 = dashParts[2];
    if (part1.length === 4) {
      return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
    } else {
      let year = part3;
      if (year.length === 2) year = '20' + year;
      return `${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
    }
  }

  // Fallback to JS Date parsing if possible
  const parsed = Date.parse(datePart);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return datePart;
}

export default function App() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [filterDate, setFilterDate] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem('theme-stationery') as ThemeType) || 'blue';
  });
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'today'>('all');
  const [displayMode, setDisplayMode] = useState<'marquee' | 'list'>('marquee');

  useEffect(() => {
    localStorage.setItem('theme-stationery', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTheaterMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const uniqueDates = Array.from(new Set(winners.map(w => w.date)));

  const todayStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
  const latestDate = uniqueDates[0] || '';
  const todayDate = uniqueDates.includes(todayStr) ? todayStr : latestDate;

  const filteredWinners = winners.filter(w => {
    if (viewMode === 'today') {
      return w.date === todayDate;
    }
    if (filterDate !== 'all') {
      return w.date === filterDate;
    }
    return true;
  });

  const loadData = useCallback(() => {
    setLoading(true);
    setError(false);
    Papa.parse(CSV_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        setLoading(false);
        const data = results.data as string[][];
        if (!data || data.length <= 1) {
          setWinners([]);
          return;
        }

        const isHeader = isNaN(Date.parse(data[0][0])) && !data[0][2].includes('http');
        const rowsToProcess = isHeader ? data.slice(1) : data;

        const processedWinners: Winner[] = rowsToProcess
          .filter(row => row.length >= 3 && row[2])
          .map(row => {
            const driveLink = row[2].trim();
            const driveId = extractDriveId(driveLink);
            return {
              date: normalizeDateOnly(row[0]),
              name: row[1]?.trim() || 'Tanpa Nama',
              driveLink,
              driveId,
              primaryImgUrl: driveId ? `https://lh3.googleusercontent.com/d/${driveId}` : driveLink,
              secondaryImgUrl: driveId ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000` : '',
            };
          });
        
        const uniqueWinners = Array.from(new Map(processedWinners.map(w => [w.driveLink, w])).values());
        const sortedWinners = uniqueWinners.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setWinners(sortedWinners);
      },
      error: () => {
        setLoading(false);
        setError(true);
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getThemePatternClass = () => {
    switch (theme) {
      case 'white': return 'pattern-white-lined';
      case 'yellow': return 'pattern-yellow-sticky';
      case 'blue':
      default:
        return 'pattern-blue-grid';
    }
  };

  return (
    <div className={`min-h-screen text-slate-900 transition-all duration-500 overflow-x-hidden relative pb-12 ${getThemePatternClass()}`}>
      <Header loadData={loadData} winners={winners} isTheaterMode={isTheaterMode} setIsTheaterMode={setIsTheaterMode} />

      {/* Decorative Floating Stationery Elements (hidden on small screens, absolutely gorgeous on large screens) */}
      <div className="absolute inset-y-0 left-0 right-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Left Side: Pencil & Ruler */}
        <div className="hidden xl:flex flex-col gap-12 sticky top-32 left-6 w-32 items-center opacity-25 hover:opacity-60 transition-opacity duration-500">
          <div className="transform -rotate-12 hover:rotate-0 transition-transform duration-300 flex flex-col items-center">
            <Pencil className="w-10 h-10 text-blue-600/80 stroke-[1.5]" />
            <span className="text-[10px] font-mono mt-1 text-blue-700/60 bg-blue-100/50 px-1.5 py-0.5 rounded">HB Pencil</span>
          </div>
          <div className="transform rotate-45 hover:rotate-12 transition-transform duration-300 flex flex-col items-center">
            <Ruler className="w-12 h-12 text-slate-500/80 stroke-[1.5]" />
            <span className="text-[10px] font-mono mt-1 text-slate-600/60">30 cm</span>
          </div>
        </div>

        {/* Right Side: Sticky Memo & Pushpin */}
        <div className="hidden xl:flex flex-col gap-12 sticky top-40 right-6 w-32 items-center ml-auto opacity-25 hover:opacity-60 transition-opacity duration-500">
          <div className="transform rotate-12 hover:rotate-0 transition-transform duration-300 flex flex-col items-center">
            <StickyNote className="w-11 h-11 text-amber-500/80 stroke-[1.5]" />
            <span className="text-[10px] font-mono mt-1 text-amber-700/60 bg-amber-100/50 px-1.5 py-0.5 rounded">Post-it</span>
          </div>
          <div className="transform -rotate-45 hover:rotate-0 transition-transform duration-300 flex flex-col items-center">
            <Pin className="w-9 h-9 text-red-500/80 stroke-[1.5]" />
            <span className="text-[10px] font-mono mt-1 text-red-600/60">Pushpin</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8 relative z-10">
        {/* Theme Selector */}
        <ThemeSelector currentTheme={theme} onChangeTheme={setTheme} />

        <div className="flex flex-col mb-6 mt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Clipboard className="w-6 h-6 text-slate-600 shrink-0" />
              Daftar pemenang saat ini
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Segmented Control for View Mode: Hari Ini vs View All */}
              <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200/30 shadow-inner shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('today')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'today'
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hari Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'all'
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Semua</span>
                </button>
              </div>

              {/* Segmented Control for Layout Mode: Marquee vs List */}
              <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200/30 shadow-inner shrink-0">
                <button
                  type="button"
                  onClick={() => setDisplayMode('marquee')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    displayMode === 'marquee'
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                  title="Tampilan Marquee Berputar"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Marquee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    displayMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                  title="Tampilan Kolom Daftar Kebawah"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daftar List</span>
                </button>
              </div>

              {/* Date Selector Dropdown */}
              <div className="relative">
                <select 
                  className={`px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-all cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    viewMode === 'today' ? 'opacity-60 pointer-events-none bg-slate-100 text-slate-400' : 'text-slate-700'
                  }`}
                  value={viewMode === 'today' ? todayDate : filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  disabled={viewMode === 'today'}
                >
                  {viewMode === 'today' ? (
                    <option value={todayDate}>{todayDate}</option>
                  ) : (
                    <>
                      <option value="all">Pilih Tanggal (Semua)</option>
                      {uniqueDates.map(date => (
                        <option key={date} value={date}>{date}</option>
                      ))}
                    </>
                  )}
                </select>
                {viewMode === 'today' && (
                  <span className="absolute -top-2 -right-1 bg-blue-100 text-blue-700 font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider scale-75 border border-blue-200">
                    Hari Ini
                  </span>
                )}
              </div>

              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors">
                Pemenang Utama
              </button>
            </div>
          </div>
          <DailyWinnerSummary winners={winners} />
        </div>
        {loading && <LoadingState />}
        {error && <ErrorState loadData={loadData} />}
        {!loading && !error && filteredWinners.length > 0 && (
          <SpotlightWinner filteredWinners={filteredWinners} onSelectWinner={setSelectedWinner} />
        )}
        {!loading && !error && filteredWinners.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8 shadow-sm">
            <ImageOff className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-600">Belum ada data pemenang</h2>
          </div>
        )}
        {!loading && !error && filteredWinners.length > 0 && (
          displayMode === 'list' ? (
            <WinnerListView winners={filteredWinners} openModal={setSelectedWinner} />
          ) : (
            <GalleryMarquee winners={filteredWinners} openModal={setSelectedWinner} />
          )
        )}
      </main>
      <ImageModal 
        winner={selectedWinner} 
        winners={filteredWinners} 
        onWinnerChange={setSelectedWinner} 
        closeModal={() => setSelectedWinner(null)} 
      />

      {/* Immersive Simulated Fullscreen / Presentation View Overlay */}
      {isTheaterMode && (
        <div className="fixed inset-0 z-[100] bg-[#0b1329] text-white flex flex-col justify-between p-6 md:p-10 transition-all duration-300 overflow-y-auto">
          {/* Header of Presentation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6 shrink-0 z-[101]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Gift className="text-white w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  TAB 2026 LUCKY DRAW
                  <span className="text-[10px] bg-red-500 text-white font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest animate-pulse shrink-0">
                    ● PRESENTASI LIVE
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Global Mart Winner Showcase</p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto">
              {/* Segmented Control inside Presentation Mode */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('today')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'today'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Hari Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'all'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Semua</span>
                </button>
              </div>

              {/* Segmented Control for Layout Mode in Presentation */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setDisplayMode('marquee')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    displayMode === 'marquee'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  title="Tampilan Marquee Berputar"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Marquee</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    displayMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  title="Tampilan Kolom Daftar Kebawah"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daftar List</span>
                </button>
              </div>

              {/* Date selection inside presentation */}
              <div className={`flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-full sm:w-auto transition-all ${
                viewMode === 'today' ? 'opacity-40 pointer-events-none' : ''
              }`}>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Filter Tanggal:</span>
                <select 
                  className="bg-transparent text-white border-none text-xs font-semibold cursor-pointer outline-none w-full sm:w-auto"
                  value={viewMode === 'today' ? todayDate : filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  disabled={viewMode === 'today'}
                >
                  {viewMode === 'today' ? (
                    <option value={todayDate} className="bg-slate-900 text-white">{todayDate}</option>
                  ) : (
                    <>
                      <option value="all" className="bg-slate-900 text-white">Semua Tanggal</option>
                      {uniqueDates.map(date => (
                        <option key={date} value={date} className="bg-slate-900 text-white">{date}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Exit Button */}
              <button 
                onClick={() => setIsTheaterMode(false)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-900/30 w-full sm:w-auto"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Keluar (Esc)</span>
              </button>
            </div>
          </div>

          {/* Immersive Marquee/List Core in Presentation Mode */}
          <div className="flex-1 flex flex-col justify-center py-6 md:py-12 z-[101]">
            {filteredWinners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-white/5 rounded-3xl border border-white/10 p-8">
                <ImageOff className="w-16 h-16 text-slate-500 mb-4" />
                <h2 className="text-xl font-medium text-slate-300">Belum ada data pemenang untuk tanggal ini</h2>
              </div>
            ) : (
              <div className="w-full relative scale-100 transition-transform duration-500 max-h-[70vh] overflow-y-auto pr-2">
                {/* Visual indicators */}
                <div className="text-xs font-semibold tracking-wider text-slate-400 flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  {displayMode === 'list' ? 'DAFTAR TABEL PEMENANG' : 'GALERI PEMENANG'} ({filteredWinners.length} orang)
                </div>
                {displayMode === 'list' ? (
                  <div className="bg-[#111c3a] border border-white/10 rounded-2xl overflow-hidden shadow-xl p-2">
                    <WinnerListView winners={filteredWinners} openModal={setSelectedWinner} />
                  </div>
                ) : (
                  <div className="scale-100 md:scale-105 transition-transform duration-500">
                    <GalleryMarquee winners={filteredWinners} openModal={setSelectedWinner} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Info & Dynamic Instruction */}
          <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 shrink-0 font-medium z-[101]">
            <p className="text-center md:text-left text-slate-500">
              Tip: Jika mode layar penuh terblokir oleh sandboxed iframe, gunakan tombol <span className="text-blue-400 font-bold">Open in new tab</span> di kanan atas editor, lalu aktifkan mode presentasi untuk layar penuh seutuhnya.
            </p>
            <div className="text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-[10px]">
              <span>TOTAL DATA: {winners.length}</span>
              <span className="text-slate-600">|</span>
              <span>FILTERED: {filteredWinners.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
