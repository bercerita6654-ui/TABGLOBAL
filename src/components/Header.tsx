import { useState, useEffect } from 'react';
import { Gift, RefreshCw, Maximize2, Minimize2, BarChart2, TrendingUp, Calendar, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Winner } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface HeaderProps {
  loadData: () => void;
  winners: Winner[];
  isTheaterMode: boolean;
  setIsTheaterMode: (val: boolean) => void;
}

export default function Header({ loadData, winners, isTheaterMode, setIsTheaterMode }: HeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(false);

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

  // Compute daily stats for Recharts trend
  const dailyCounts = winners.reduce((acc, winner) => {
    acc[winner.date] = (acc[winner.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dailyData = Object.entries(dailyCounts)
    .map(([date, count]) => ({
      date,
      count,
      shortDate: (() => {
        try {
          const parts = date.split('-');
          if (parts.length === 3) {
            const day = parts[2];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const monthIdx = parseInt(parts[1], 10) - 1;
            return `${day} ${months[monthIdx] || parts[1]}`;
          }
          return date;
        } catch {
          return date;
        }
      })()
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDays = dailyData.length;
  const averageWinners = totalDays > 0 ? (winners.length / totalDays).toFixed(1) : '0';
  
  let maxWinners = 0;
  let maxWinnersDate = '-';
  dailyData.forEach(item => {
    if (item.count > maxWinners) {
      maxWinners = item.count;
      maxWinnersDate = item.shortDate;
    }
  });

  return (
    <div className="w-full bg-white border-b border-slate-200 shrink-0 sticky top-0 z-50">
      <header className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 py-4 md:py-0 min-h-[5rem] gap-4">
        {/* Left branding */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Gift className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Lucky Draw TAB 2026</h1>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">GLOBAL MART</p>
          </div>
        </div>

        {/* Middle Sparkline (Desktop only) */}
        {winners.length > 0 && (
          <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200/60 rounded-xl p-1.5 px-3 shadow-sm hover:bg-slate-100/50 transition-colors cursor-pointer select-none" onClick={() => setShowStats(!showStats)}>
            <div className="w-20 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="headerTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563eb" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#headerTrendGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Rerata Tren</div>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-blue-600 font-extrabold">{averageWinners}</span> / hari
              </div>
            </div>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
              {winners.length} Pemenang
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats Toggle Button */}
            {winners.length > 0 && (
              <button 
                onClick={() => setShowStats(!showStats)} 
                title={showStats ? "Sembunyikan Grafik" : "Tampilkan Grafik Statistik"} 
                className={`p-2 rounded-full transition-colors flex items-center justify-center gap-1.5 font-medium text-xs px-3 cursor-pointer ${
                  showStats 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">Statistik</span>
                {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Presentation Mode */}
            <button 
              onClick={toggleFullscreen} 
              title={isTheaterMode || isFullscreen ? "Keluar Layar Penuh" : "Mode Layar Penuh (Presentasi)"} 
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 font-medium text-xs px-3 cursor-pointer"
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

            {/* Reload Data */}
            <button onClick={loadData} title="Muat Ulang Data" className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <img 
            src="https://lh3.googleusercontent.com/d/1dyed9YL6QxBSDefdx47sf8pWXUVWD3nc" 
            alt="Logo TAB 2026" 
            className="h-12 w-auto object-contain hidden sm:block"
          />
        </div>
      </header>

      {/* Expandable Stats Panel */}
      {showStats && winners.length > 0 && (() => {
        // Find duplicate groups of identical photos
        const duplicatesMap = new Map<string, Winner[]>();
        winners.forEach(winner => {
          const key = winner.primaryImgUrl ? winner.primaryImgUrl.trim() : '';
          if (key && !key.includes('placehold.co') && !key.includes('placehold.it')) {
            if (!duplicatesMap.has(key)) {
              duplicatesMap.set(key, []);
            }
            duplicatesMap.get(key)!.push(winner);
          }
        });

        const duplicateGroups = Array.from(duplicatesMap.entries())
          .filter(([_, groupWinners]) => groupWinners.length > 1)
          .map(([key, groupWinners]) => ({
            key,
            winners: groupWinners,
            imgUrl: key
          }));

        return (
          <div className="w-full bg-slate-50 border-t border-slate-200 px-6 md:px-8 py-5 transition-all">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              {/* Row 1: General Stats and Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Quick Insights */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    Ringkasan Tren Pemenang
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Visualisasi ini menampilkan grafik tren jumlah pemenang per hari untuk mengidentifikasi hari dengan pencapaian paling beruntung.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-sm">
                      <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Total</span>
                      <span className="text-base font-black text-slate-800">{winners.length}</span>
                      <span className="text-[9px] text-slate-500 block">pemenang</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-sm">
                      <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Rerata</span>
                      <span className="text-base font-black text-blue-600">{averageWinners}</span>
                      <span className="text-[9px] text-slate-500 block">/ hari</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-sm">
                      <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Puncak</span>
                      <span className="text-base font-black text-amber-600">{maxWinners}</span>
                      <span className="text-[9px] text-slate-500 block truncate" title={maxWinnersDate}>{maxWinnersDate}</span>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-44 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">Grafik Garis Tren Harian</span>
                    <span className="text-[10px] text-slate-400 font-mono">X: Tanggal | Y: Jumlah Pemenang</span>
                  </div>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="shortDate" 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-800 font-medium">
                                  <p className="font-bold text-slate-300">{payload[0].payload.date}</p>
                                  <p className="text-blue-400 font-black mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    {payload[0].value} Pemenang
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#2563eb" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#trendGrad)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 2: Photo Integrity & Duplication Analysis */}
              <div className="border-t border-slate-200/80 pt-5">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Analisis Foto Yang Sama Persis (Audit Duplikasi)
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Melacak entri pemenang yang berbagi file/foto dokumentasi yang identik secara digital.
                        </p>
                      </div>
                    </div>
                    <div>
                      {duplicateGroups.length > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 text-xs font-extrabold rounded-full border border-rose-100">
                          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                          Terdeteksi {duplicateGroups.length} Duplikasi Foto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aman (Akurasi 100%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    {duplicateGroups.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2.5">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-800">Integritas Data Sempurna</h5>
                        <p className="text-[11px] text-slate-500 max-w-md mt-1">
                          Tidak terdeteksi adanya foto yang sama persis digunakan oleh lebih dari satu pemenang. Setiap pemenang memiliki dokumen foto yang sepenuhnya unik.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-[11px] leading-relaxed">
                          <span className="font-extrabold">Catatan Audit:</span> Foto di bawah ini digunakan untuk beberapa entri pemenang berbeda. Hal ini umum terjadi jika satu orang memenangkan beberapa hadiah di hari yang sama, atau terdapat kekeliruan dalam pengunggahan file dokumentasi. Silakan periksa daftar di bawah ini untuk verifikasi keabsahan.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {duplicateGroups.map((group, gIdx) => (
                            <div 
                              key={gIdx}
                              className="flex gap-3 bg-slate-50 hover:bg-slate-100/50 transition-colors border border-slate-200/70 p-3 rounded-xl shadow-inner-sm"
                            >
                              {/* Left side: Preview Image */}
                              <div className="w-16 h-20 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shadow-sm shrink-0 relative group">
                                <img 
                                  src={group.imgUrl} 
                                  alt="Preview Duplikat"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-0.5 left-0.5 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                  {group.winners.length}x
                                </div>
                              </div>

                              {/* Right side: Detailed winner listings */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[240px]" title={group.key}>
                                    ID Berbagi: {group.winners[0].driveId || 'N/A'}
                                  </span>
                                  <div className="space-y-1">
                                    {group.winners.map((winner, wIdx) => (
                                      <div 
                                        key={wIdx}
                                        className="bg-white border border-slate-200/60 p-1 px-2 rounded-lg flex items-center justify-between text-[11px] font-medium"
                                      >
                                        <span className="font-bold text-slate-800 truncate max-w-[120px]" title={winner.name}>
                                          {winner.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                                          <Calendar className="w-2.5 h-2.5" />
                                          {winner.date}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="text-right mt-2">
                                  <a 
                                    href={group.winners[0].driveLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-600 hover:text-blue-700"
                                  >
                                    Buka di Google Drive
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

