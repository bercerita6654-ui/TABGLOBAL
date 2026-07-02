import { AlertCircle } from 'lucide-react';

export default function ErrorState({ loadData }: { loadData: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Gagal Memuat Data</h2>
      <p className="text-gray-600 max-w-md">Terjadi kesalahan saat mengambil data CSV. Pastikan link sudah dipublikasikan ke web.</p>
      <button onClick={loadData} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md">
        Coba Lagi
      </button>
    </div>
  );
}
