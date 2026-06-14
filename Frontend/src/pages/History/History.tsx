import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Image as ImageIcon, ArrowDown, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { pageTransition } from '../../constants/animations';
import { getHistory, getDownloadUrl } from '../../services/imageService';
import Seo from '../../seo/Seo';
import type { HistoryRecord } from '../../types/image.types';
import { isAxiosError } from 'axios';

const getHistoryError = (error: unknown) => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return 'Failed to fetch compression history records from API.';
};

// Simple helper component for animated counter mockup
function Counter({ value, label }: { value: string; label: string }) {
  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs"
    >
      <h3 className="text-slate-500 text-xs sm:text-sm font-semibold mb-1">{label}</h3>
      <p className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">{value}</p>
      <span className="text-xxs text-indigo-600 font-bold tracking-wide uppercase">Realtime stats</span>
    </motion.div>
  );
}

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce Search Query Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (requestError: unknown) {
      console.error(requestError);
      setError(getHistoryError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchHistory();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchHistory]);

  const formatSize = useCallback((bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }, []);

  const formatDate = useCallback((dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(item =>
      item.original_filename?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      item.compressed_filename?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [history, debouncedSearch]);

  // Dynamically compute global metrics
  const stats = useMemo(() => {
    const totalImages = history.length;
    const totalSavedBytes = history.reduce((acc, item) => acc + (item.original_size - item.compressed_size), 0);
    const avgSavings = totalImages > 0
      ? (history.reduce((acc, item) => acc + item.compression_percentage, 0) / totalImages).toFixed(1)
      : '0';

    return {
      totalImages: totalImages.toString(),
      totalSaved: formatSize(totalSavedBytes),
      avgSavings: `${avgSavings}%`
    };
  }, [history, formatSize]);

  const handleDownload = useCallback((compressedFilename: string) => {
    const url = getDownloadUrl(compressedFilename);
    window.open(url, '_blank');
    // Optimistically update the local count for instant feedback
    setHistory(prev =>
      prev.map(item =>
        item.compressed_filename === compressedFilename
          ? { ...item, download_count: item.download_count + 1 }
          : item
      )
    );
  }, []);

  // Structured Schema for History Page SEO
  const historySchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Compression History",
    "description": "View and manage your optimized images history and stats.",
    "url": `${window.location.origin}/history`
  }), []);

  return (
    <motion.article className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl" {...pageTransition}>
      <Seo 
        title="Compression History | AI Image Compressor" 
        description="View and manage your image compression history and statistics."
        path="/history"
        schema={historySchema}
      />

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Compression History</h1>
          <p className="text-sm text-slate-500 mt-1">Review all your optimized images and collective bandwidth metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input 
              type="text" 
              placeholder="Search history..." 
              className="pl-10 pr-4 py-2 md:py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm w-full sm:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search compression records"
            />
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} className="shrink-0" aria-label="Refresh records list">
            <RefreshCw size={16} />
          </Button>
        </div>
      </header>

      {/* Stats Counters Container */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8" aria-label="Historical Stats Summary">
        <Counter label="Total Images Optimized" value={stats.totalImages} />
        <Counter label="Total Storage Savings" value={stats.totalSaved} />
        <Counter label="Average Storage Savings" value={stats.avgSavings} />
      </section>

      {/* Error Alert Box */}
      {error && (
        <Card className="p-5 border-rose-200 bg-rose-50 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-rose-600 shrink-0" size={20} />
            <p className="text-rose-900 font-semibold text-xs md:text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchHistory} className="ml-auto">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Skeleton Loading Card */}
      {isLoading && (
        <Card className="p-16">
          <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
            <Loader2 className="text-indigo-600 animate-spin" size={32} />
            <p className="text-slate-500 font-semibold text-sm">Loading historical data...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredHistory.length === 0 && (
        <Card className="p-16 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <ImageIcon size={26} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            {searchTerm ? 'No search matches' : 'No history yet'}
          </h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No records match "${searchTerm}". Double-check file spelling.`
              : 'Optimize some assets to fill your history statistics dashboard.'}
          </p>
        </Card>
      )}

      {/* History Records Display */}
      {!isLoading && filteredHistory.length > 0 && (
        <div>
          {/* Desktop Table View (visible on medium/large devices) */}
          <div className="hidden md:block overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Original File</th>
                    <th className="px-6 py-4">Compressed File</th>
                    <th className="px-6 py-4">Image Type</th>
                    <th className="px-6 py-4">Resolution</th>
                    <th className="px-6 py-4">Original Size</th>
                    <th className="px-6 py-4">Compressed</th>
                    <th className="px-6 py-4">Saved</th>
                    <th className="px-6 py-4">Downloads</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600 shrink-0"><ImageIcon size={16} /></div>
                          <span className="font-semibold text-slate-900 truncate max-w-[150px]" title={item.original_filename}>
                            {item.original_filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-700 font-mono text-xs truncate max-w-[150px] block" title={item.compressed_filename}>
                          {item.compressed_filename}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xxs font-bold tracking-wider uppercase">
                          {item.analysis?.image_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="whitespace-nowrap text-xs font-semibold text-slate-600">
                          <span>{item.original_width && item.original_height ? `${item.original_width} × ${item.original_height}` : 'N/A'}</span>
                          <span className="mx-1 text-slate-300">→</span>
                          <span className="text-emerald-600">
                            {item.compressed_width && item.compressed_height ? `${item.compressed_width} × ${item.compressed_height}` : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{formatSize(item.original_size)}</td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">{formatSize(item.compressed_size)}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full w-fit text-xs">
                          <ArrowDown size={14} className="mr-0.5" /> {item.compression_percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 font-semibold text-sm">{item.download_count ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-medium">{formatDate(item.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onClick={() => handleDownload(item.compressed_filename)}
                          aria-label={`Download ${item.compressed_filename}`}
                        >
                          <Download size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Stack View (visible on screens < 768px) */}
          <div className="block md:hidden space-y-4">
            <AnimatePresence>
              {filteredHistory.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 shrink-0"><ImageIcon size={16} /></div>
                    <div className="flex-grow min-w-0">
                      <span className="font-bold text-slate-900 truncate block" title={item.original_filename}>
                        {item.original_filename}
                      </span>
                      <span className="text-xxs text-emerald-700 font-mono truncate block" title={item.compressed_filename}>
                        → {item.compressed_filename}
                      </span>
                    </div>
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg text-xxs font-extrabold uppercase shrink-0">
                      {item.analysis?.image_type || 'N/A'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 border-y border-slate-100 py-3 text-center">
                    <div>
                      <p className="text-xxs text-slate-400 font-bold uppercase mb-0.5">Original</p>
                      <p className="text-xs font-semibold text-slate-700">{formatSize(item.original_size)}</p>
                    </div>
                    <div>
                      <p className="text-xxs text-slate-400 font-bold uppercase mb-0.5">Optimized</p>
                      <p className="text-xs font-bold text-emerald-600">{formatSize(item.compressed_size)}</p>
                    </div>
                    <div>
                      <p className="text-xxs text-slate-400 font-bold uppercase mb-0.5">Saved</p>
                      <p className="text-xs font-black text-emerald-600">-{item.compression_percentage}%</p>
                    </div>
                    <div>
                      <p className="text-xxs text-slate-400 font-bold uppercase mb-0.5">DLs</p>
                      <p className="text-xs font-bold text-slate-700">{item.download_count ?? 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-center">
                    <div>
                      <p className="text-xxs font-bold uppercase text-slate-400">Original Resolution</p>
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        {item.original_width && item.original_height ? `${item.original_width} × ${item.original_height}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xxs font-bold uppercase text-slate-400">Compressed Resolution</p>
                      <p className="mt-1 text-xs font-bold text-emerald-600">
                        {item.compressed_width && item.compressed_height ? `${item.compressed_width} × ${item.compressed_height}` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xxs text-slate-400 font-semibold">{formatDate(item.created_at)}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDownload(item.compressed_filename)}
                      className="px-4 py-1.5 text-xs font-bold"
                      aria-label={`Download ${item.compressed_filename}`}
                    >
                      <Download size={12} className="mr-1.5" /> Download
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.article>
  );
}
