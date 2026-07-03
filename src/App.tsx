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
import ImageModal from './components/ImageModal';
import DailyWinnerSummary from './components/DailyWinnerSummary';
import ThemeSelector, { ThemeType } from './components/ThemeSelector';
import { ImageOff, Pencil, Ruler, Clipboard, StickyNote, Pin } from 'lucide-react';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQs-HvfOGc1iH5Y-5sV3HyDUt3TB0fO7FAF-f5XhqDIaHeH70WcAJ6bA8pL9yW4SvY4Gok32M0fI4Kz/pub?gid=0&single=true&output=csv';

function extractDriveId(url: string) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
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

  useEffect(() => {
    localStorage.setItem('theme-stationery', theme);
  }, [theme]);

  const uniqueDates = Array.from(new Set(winners.map(w => w.date)));

  const filteredWinners = filterDate === 'all' 
    ? winners 
    : winners.filter(w => w.date === filterDate);

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
              date: row[0]?.trim() || 'Tanggal tidak diketahui',
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
      <Header loadData={loadData} winnerCount={winners.length} />

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
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Clipboard className="w-6 h-6 text-slate-600 shrink-0" />
              Daftar pemenang saat ini
            </h2>
            <div className="flex gap-3">
              <select 
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">Semua Tanggal</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors">
                Pemenang Utama
              </button>
            </div>
          </div>
          <DailyWinnerSummary winners={winners} />
        </div>
        {loading && <LoadingState />}
        {error && <ErrorState loadData={loadData} />}
        {!loading && !error && filteredWinners.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8 shadow-sm">
            <ImageOff className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-600">Belum ada data pemenang</h2>
          </div>
        )}
        {!loading && !error && filteredWinners.length > 0 && (
          <GalleryMarquee winners={filteredWinners} openModal={setSelectedWinner} />
        )}
      </main>
      <ImageModal winner={selectedWinner} closeModal={() => setSelectedWinner(null)} />
    </div>
  );
}
