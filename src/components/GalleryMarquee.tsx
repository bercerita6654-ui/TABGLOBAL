import { useState } from 'react';
import React from 'react';
import { Winner } from '../types';
import GalleryCard from './GalleryCard';

interface GalleryMarqueeProps {
  winners: Winner[];
  openModal: (winner: Winner) => void;
}

export default function GalleryMarquee({ winners, openModal }: GalleryMarqueeProps) {
  const [speed] = useState(120); // seconds
  const duplicatedWinners = [...winners, ...winners];

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden flex">
        <div className="flex animate-marquee gap-6" style={{ '--marquee-duration': `${speed}s` } as React.CSSProperties}>
          {duplicatedWinners.map((winner, index) => (
            <div key={index} className="w-64 shrink-0">
              <GalleryCard winner={winner} index={index} openModal={openModal} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
