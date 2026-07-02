import { Winner } from '../types';
import GalleryCard from './GalleryCard';

interface GalleryGridProps {
  winners: Winner[];
  openModal: (winner: Winner) => void;
}

export default function GalleryGrid({ winners, openModal }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {winners.map((winner, index) => (
        <GalleryCard key={index} winner={winner} index={index} openModal={openModal} />
      ))}
    </div>
  );
}
