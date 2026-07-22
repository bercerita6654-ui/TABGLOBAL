import { useState, FC } from 'react';
import { Winner } from '../types';
import { Eye, ExternalLink, Calendar, User, Search, Image as ImageIcon } from 'lucide-react';

interface WinnerListViewProps {
  winners: Winner[];
  openModal: (winner: Winner) => void;
}

const WinnerListView: FC<WinnerListViewProps> = ({ winners, openModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fallbackImage = `https://placehold.co/600x1066/f3f4f6/a1a1aa?text=Privasi+Akun/File+Dibatasi`;

  // Filter based on search input
  const searchedWinners = winners.filter(winner =>
    winner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    winner.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      {/* Search and stats bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Cari nama pemenang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <span className="text-blue-600 font-bold">{searchedWinners.length}</span> dari <span className="font-bold">{winners.length}</span> pemenang
        </div>
      </div>

      {/* Empty State */}
      {searchedWinners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Tidak ada pemenang yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1">Coba periksa kembali ejaan kata kunci pencarian Anda.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop & Tablet Table */}
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-6 text-center w-16">No</th>
                <th className="py-4 px-4 w-24">Foto</th>
                <th className="py-4 px-6">Nama Pemenang</th>
                <th className="py-4 px-6 w-44">Tanggal</th>
                <th className="py-4 px-6 w-52 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {searchedWinners.map((winner, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Number column */}
                  <td className="py-3 px-6 text-center text-xs font-mono font-bold text-slate-400">
                    {index + 1}
                  </td>

                  {/* Thumbnail Photo column */}
                  <td className="py-3 px-4">
                    <div 
                      onClick={() => openModal(winner)}
                      className="relative w-12 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-sm group-hover:shadow transition-all group-hover:scale-105"
                      title="Klik untuk memperbesar"
                    >
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
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </td>

                  {/* Name column */}
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                          {winner.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {winner.driveId || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Date column */}
                  <td className="py-3 px-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{winner.date}</span>
                    </div>
                  </td>

                  {/* Actions column */}
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(winner)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        title="Perbesar Foto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </button>
                      <a
                        href={winner.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 text-xs font-bold rounded-xl transition-all"
                        title="Buka di Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Drive</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WinnerListView;
