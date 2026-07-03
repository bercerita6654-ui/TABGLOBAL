import { useState } from 'react';
import React from 'react';
import { Winner } from '../types';
import GalleryCard from './GalleryCard';
import { Gauge, Sliders } from 'lucide-react';

interface GalleryMarqueeProps {
  winners: Winner[];
  openModal: (winner: Winner) => void;
}

export default function GalleryMarquee({ winners, openModal }: GalleryMarqueeProps) {
  const [speed, setSpeed] = useState(275); // default: 275 seconds
  const duplicatedWinners = [...winners, ...winners];

  const presets = [
    { label: 'Cepat (100s)', value: 100 },
    { label: 'Sedang (200s)', value: 200 },
    { label: 'Lambat (275s - Default)', value: 275 },
    { label: 'Sangat Lambat (300s)', value: 300 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Control Panel Kecepatan Animasi */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Kecepatan Putar Preview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Atur kelambatan perputaran foto otomatis ({speed} detik per siklus)</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSpeed(preset.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  speed === preset.value
                    ? 'bg-white text-blue-600 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Slider input */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[200px]">
            <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min="100"
              max="300"
              step="5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{speed}s</span>
          </div>
        </div>
      </div>

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

