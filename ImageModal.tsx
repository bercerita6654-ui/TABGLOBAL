import { X } from 'lucide-react';
import { Winner } from '../types';

interface ImageModalProps {
  winner: Winner | null;
  closeModal: () => void;
}

export default function ImageModal({ winner, closeModal }: ImageModalProps) {
  if (!winner) return null;

  const fallbackImage = `https://placehold.co/600x1066/f3f4f6/a1a1aa?text=Privasi+Akun/File+Dibatasi`;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity p-4" 
      onClick={closeModal}
    >
      <button 
        onClick={closeModal} 
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6 md:w-8 md:h-8" />
      </button>
      <div className="relative flex flex-col items-center w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <img 
          src={winner.primaryImgUrl} 
          alt={winner.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== winner.secondaryImgUrl) {
                target.src = winner.secondaryImgUrl;
            } else {
                target.src = fallbackImage;
            }
          }}
          className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl bg-gray-900/50"
        />
        <p className="text-white text-center mt-4 font-semibold text-lg md:text-xl max-w-md truncate">{winner.name}</p>
      </div>
    </div>
  );
}
