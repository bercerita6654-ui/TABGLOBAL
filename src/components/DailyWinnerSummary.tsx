import { Winner } from '../types';

interface DailyWinnerSummaryProps {
  winners: Winner[];
}

export default function DailyWinnerSummary({ winners }: DailyWinnerSummaryProps) {
  const dailyCounts = winners.reduce((acc, winner) => {
    acc[winner.date] = (acc[winner.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const parseIndonesianToDate = (dateStr: string) => {
    try {
      const cleanStr = dateStr.includes(', ') ? dateStr.split(', ')[1] : dateStr;
      const parts = cleanStr.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const monthMap: Record<string, number> = {
          'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
          'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
        };
        const month = monthMap[parts[1].toLowerCase()] || 0;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
      }
    } catch {}
    return 0;
  };

  const sortedDailyCounts = Object.entries(dailyCounts).sort((a, b) => {
    return parseIndonesianToDate(b[0]) - parseIndonesianToDate(a[0]); // Descending (latest first)
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 pt-2">
      {sortedDailyCounts.map(([date, count]) => (
        <div key={date} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shrink-0">
          <span className="font-bold text-slate-800">{date}</span>: {count}
        </div>
      ))}
    </div>
  );
}
