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
import { ImageOff } from 'lucide-react';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQs-HvfOGc1iH5Y-5sV3HyDUt3TB0fO7FAF-f5XhqDIaHeH70WcAJ6bA8pL9yW4SvY4Gok32M0fI4Kz/pub?gid=0&single=true&output=csv';

function extractDriveId(url: string) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

export default function App() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);

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

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      <Header loadData={loadData} winnerCount={winners.length} />
      <main className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-800">Daftar pemenang saat ini</h2>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 transition-colors">Semua Periode</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-md shadow-blue-200">Pemenang Utama</button>
            </div>
          </div>
          <DailyWinnerSummary winners={winners} />
        </div>
        {loading && <LoadingState />}
        {error && <ErrorState loadData={loadData} />}
        {!loading && !error && winners.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <ImageOff className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-600">Belum ada data pemenang</h2>
          </div>
        )}
        {!loading && !error && winners.length > 0 && (
          <GalleryMarquee winners={winners} openModal={setSelectedWinner} />
        )}
      </main>
      <ImageModal winner={selectedWinner} closeModal={() => setSelectedWinner(null)} />
    </div>
  );
}
