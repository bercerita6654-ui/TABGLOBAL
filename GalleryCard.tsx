import { FC } from 'react';
import { Calendar, ZoomIn, Trophy } from 'lucide-react';
import { Winner } from '../types';

const GalleryCard: FC<{ winner: Winner; index: number; openModal: (winner: Winner) => void }> = ({ winner, index, openModal }) => {
  const fallbackImage = `https://placehold.co/600x1066/f3f4f6/a1a1aa?text=Privasi+Akun/File+Dibatasi`;

  const isToday = new Date(winner.date).toLocaleDateString() === new Date().toLocaleDateString();

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group opacity-0 flex flex-col"
      style={{ animation: `fadeIn 0.5s ease forwards ${index * 0.1}s` }}
    >
      <div 
        className="relative aspect-[9/16] overflow-hidden bg-slate-200 cursor-pointer"
        onClick={() => openModal(winner)}
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
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {isToday && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded uppercase shadow-md flex items-center gap-1 animate-bounce">
            <Trophy className="w-3 h-3" />
            Hari Ini
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="text-xs font-bold text-slate-500 uppercase">{winner.date}</div>
      </div>
    </div>
  );
};

export default GalleryCard;
