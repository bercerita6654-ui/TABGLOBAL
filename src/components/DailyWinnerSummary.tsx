import { Winner } from '../types';

interface DailyWinnerSummaryProps {
  winners: Winner[];
}

export default function DailyWinnerSummary({ winners }: DailyWinnerSummaryProps) {
  const dailyCounts = winners.reduce((acc, winner) => {
    acc[winner.date] = (acc[winner.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 pt-2">
      {Object.entries(dailyCounts).map(([date, count]) => (
        <div key={date} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shrink-0">
          <span className="font-bold text-slate-800">{date}</span>: {count}
        </div>
      ))}
    </div>
  );
}
