export default function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-96">
          <div className="h-64 bg-slate-200" />
          <div className="p-4 flex flex-col gap-2">
            <div className="h-4 w-1/3 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
