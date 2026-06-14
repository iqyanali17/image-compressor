import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Settings2, Download, ArrowRight, CheckCircle2, Sparkles, AlertCircle, RefreshCw, Maximize2 } from 'lucide-react';
import { Card } from '../../components/common/Card/Card';
import { Button } from '../../components/common/Button/Button';
import { pageTransition } from '../../constants/animations';
import { analyzeImage, compressImage, getDownloadUrl } from '../../services/imageService';
import Seo from '../../seo/Seo';
import type { AIAnalysisRecommendation, CompressionResult } from '../../types/image.types';
import { isAxiosError } from 'axios';

const getRequestError = (error: unknown, fallback: string) => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
};

export default function Compress() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisRecommendation | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  
  // Custom Toasts/Alerts
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compression Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState({
    format: 'webp',
    level: 'medium',
    quality: 80,
    resizeEnabled: false,
    width: 0,
    height: 0,
    maintainAspectRatio: true
  });

  // Automatically dismiss success toasts after 4 seconds
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorToast('Invalid file format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    // Validate size limit (16MB)
    if (selectedFile.size > 16 * 1024 * 1024) {
      setErrorToast('File is too large. Max size allowed is 16MB.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(nextPreviewUrl);
    setCompressionResult(null);
    setAnalysisResult(null);
    setErrorToast(null);

    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error('Unable to read image dimensions'));
        image.src = nextPreviewUrl;
      });
      setOriginalDimensions(dimensions);
      setSettings(current => ({
        ...current,
        width: dimensions.width,
        height: dimensions.height
      }));
    } catch {
      URL.revokeObjectURL(nextPreviewUrl);
      setFile(null);
      setPreviewUrl(null);
      setErrorToast('Unable to read this image. Please choose another file.');
      return;
    }

  }, [previewUrl]);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleAskAiRecommendation = useCallback(async () => {
    if (!file || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorToast(null);
    try {
      const data = await analyzeImage(file);
      setAnalysisResult(data.analysis);
      setSuccessToast('AI recommendation is ready.');
    } catch (error: unknown) {
      console.error(error);
      setAnalysisResult(null);
      setErrorToast(getRequestError(error, 'AI analysis is unavailable. You can still use your custom settings.'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, isAnalyzing]);

  const handleCompress = useCallback(async () => {
    if (!file) return;

    setIsCompressing(true);
    setErrorToast(null);

    try {
      if (settings.resizeEnabled && (!settings.width || !settings.height)) {
        setErrorToast('Width and height must both be greater than zero.');
        setIsCompressing(false);
        return;
      }
      const result = await compressImage(file, {
        ...settings,
        analysis: analysisResult
      });
      setCompressionResult({
        historyId: result.history_id,
        originalFilename: result.original_filename,
        compressedFilename: result.compressed_filename,
        originalSize: result.original_size,
        compressedSize: result.compressed_size,
        savings: result.savings_percentage,
        originalWidth: result.original_width,
        originalHeight: result.original_height,
        compressedWidth: result.compressed_width,
        compressedHeight: result.compressed_height,
        analysis: result.analysis,
      });
      setSuccessToast('Image compressed successfully!');
    } catch (error: unknown) {
      console.error(error);
      setErrorToast(getRequestError(error, 'Compression failed. Please verify your API server is running.'));
    } finally {
      setIsCompressing(false);
    }
  }, [analysisResult, file, settings]);

  const handleDownload = useCallback(() => {
    if (!compressionResult?.compressedFilename) return;
    const url = getDownloadUrl(compressionResult.compressedFilename);
    window.open(url, '_blank');
  }, [compressionResult]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setCompressionResult(null);
    setAnalysisResult(null);
    setOriginalDimensions({ width: 0, height: 0 });
    setSettings(current => ({
      ...current,
      resizeEnabled: false,
      width: 0,
      height: 0,
      maintainAspectRatio: true
    }));
    setErrorToast(null);
    setSuccessToast(null);
  }, [previewUrl]);

  const handleWidthChange = useCallback((value: number) => {
    setSettings(current => {
      const nextWidth = Math.max(0, value);
      const nextHeight = current.maintainAspectRatio && originalDimensions.width
        ? Math.max(1, Math.round(nextWidth * originalDimensions.height / originalDimensions.width))
        : current.height;
      return { ...current, width: nextWidth, height: nextHeight };
    });
  }, [originalDimensions]);

  const handleHeightChange = useCallback((value: number) => {
    setSettings(current => {
      const nextHeight = Math.max(0, value);
      const nextWidth = current.maintainAspectRatio && originalDimensions.height
        ? Math.max(1, Math.round(nextHeight * originalDimensions.width / originalDimensions.height))
        : current.width;
      return { ...current, width: nextWidth, height: nextHeight };
    });
  }, [originalDimensions]);

  const handleAspectRatioChange = useCallback((checked: boolean) => {
    setSettings(current => ({
      ...current,
      maintainAspectRatio: checked,
      height: checked && originalDimensions.width
        ? Math.max(1, Math.round(current.width * originalDimensions.height / originalDimensions.width))
        : current.height
    }));
  }, [originalDimensions]);

  const formatSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }, []);

  // Handle Drag Move on Comparison Slider
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  // Structured Schema for Compress Page SEO
  const compressSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Compress Images Online",
    "description": "Upload, analyze, compress, and download optimized images instantly using smart machine learning models.",
    "url": `${window.location.origin}/compress`
  }), []);

  return (
    <motion.article className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-6xl" {...pageTransition}>
      <Seo 
        title="Compress Images Online | AI Image Compressor" 
        description="Upload, analyze, compress, and download optimized images instantly."
        path="/compress"
        schema={compressSchema}
      />

      <header className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 md:mb-4">Optimize Image</h1>
        <p className="text-sm md:text-base text-slate-600">Upload your asset and let our AI calculate the perfect balance of format conversion and quality optimization.</p>
      </header>

      {/* Dynamic Success & Error Toast Banners */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4">
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-emerald-600 text-white rounded-xl p-4 shadow-xl flex items-center gap-3 border border-emerald-500"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              <p className="text-sm font-semibold">{successToast}</p>
            </motion.div>
          )}

          {errorToast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-rose-600 text-white rounded-xl p-4 shadow-xl flex items-center gap-3 border border-rose-500"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm font-semibold">{errorToast}</p>
              <button 
                onClick={() => setErrorToast(null)} 
                className="ml-auto text-rose-200 hover:text-white text-xs font-bold shrink-0"
                aria-label="Dismiss Error"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Section: Upload & Preview Card */}
        <section className="lg:col-span-7 space-y-6">
          {!file ? (
            <div
              className="border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50/60 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-indigo-500"
              onDragOver={handleDragOver}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Drag and drop image here or click to choose file"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            >
              <div className="h-80 md:h-96 flex flex-col items-center justify-center text-center p-6">
                <div className="h-16 w-16 md:h-20 md:w-20 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500 mb-6">
                  <UploadCloud size={32} />
                </div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Drag & Drop your image here</h2>
                <p className="text-xs md:text-sm text-slate-500 mb-4">or click to browse local files</p>
                <p className="text-xxs md:text-xs text-slate-400">Supports JPG, PNG, WEBP (Max 16MB)</p>
                <input 
                  type="file" 
                  className="sr-only"
                  ref={fileInputRef} 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  tabIndex={-1}
                />
              </div>
            </div>
          ) : (
            <Card className="overflow-hidden bg-slate-950 text-white relative h-80 md:h-[450px] group flex flex-col items-center justify-center">
              {/* Before/After Comparison Visual Slider */}
              {compressionResult ? (
                <div 
                  ref={sliderContainerRef}
                  className="relative w-full h-full cursor-ew-resize select-none overflow-hidden"
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                >
                  {/* Before View (Original) */}
                  <img 
                    src={previewUrl!} 
                    alt="Original Upload" 
                    className="absolute inset-0 w-full h-full object-contain p-2"
                  />
                  
                  {/* After View (Compressed overlay) */}
                  <div 
                    className="absolute inset-0 overflow-hidden" 
                    style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
                  >
                    <img 
                      src={previewUrl!} 
                      alt="Compressed Visual Mockup" 
                      className="absolute inset-0 w-full h-full object-contain p-2 brightness-95 contrast-105" 
                    />
                  </div>

                  {/* Slider Control Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize z-20"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl border border-slate-200">
                      <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                  </div>

                  {/* Visual Badges */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold select-none pointer-events-none border border-white/10">
                    Original
                  </div>
                  <div className="absolute bottom-4 right-4 bg-emerald-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold select-none pointer-events-none border border-emerald-500/30">
                    Compressed
                  </div>
                </div>
              ) : (
                <img src={previewUrl!} alt="Preview of uploaded asset" className="w-full h-full object-contain p-4" />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                 <Button variant="secondary" onClick={handleReset} aria-label="Upload a different image">
                   Upload Different Image
                 </Button>
              </div>
            </Card>
          )}

          {file && originalDimensions.width > 0 && (
            <Card className="p-4 border border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Original Resolution</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900">
                    {originalDimensions.width} × {originalDimensions.height}
                  </p>
                </div>
                <Maximize2 className="text-indigo-500" size={22} />
              </div>
            </Card>
          )}

        </section>

        {/* Right Section: Compression settings and outputs */}
        <aside className="lg:col-span-5 space-y-6">
          <Card className="p-5 md:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2.5 mb-6">
              <Settings2 className="text-slate-400" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Compression Settings</h2>
            </div>

            <div className="space-y-6">
              {/* AI Assistant Section */}
              {file && (
                <AnimatePresence mode="wait">
                  {!analysisResult && !isAnalyzing && (
                    <motion.div
                      key="ask-ai"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-xl text-purple-600 shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-900">AI Assistant</h4>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Find the perfect settings</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAskAiRecommendation}
                        className="shrink-0 text-xs border-purple-200 hover:bg-purple-100/30 text-purple-700 bg-white shadow-sm font-semibold rounded-full py-1 px-3"
                      >
                        Ask AI Help
                      </Button>
                    </motion.div>
                  )}
                  {isAnalyzing && (
                    <motion.div
                      key="loading-ai"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <Sparkles className="text-purple-500 animate-spin shrink-0" size={16} />
                      <span className="text-[11px] font-semibold text-slate-700 animate-pulse">Analyzing image contents...</span>
                    </motion.div>
                  )}
                  {analysisResult && !isAnalyzing && (
                    <motion.div
                      key="result-ai"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-2 rounded-xl text-purple-600 shrink-0">
                          <Sparkles size={16} />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-900">AI Recommends ({analysisResult.type})</h4>
                          <p className="text-[11px] text-slate-600 leading-normal mt-1">
                            Use <span className="font-bold text-indigo-600 uppercase">{analysisResult.recommended_format}</span> at <span className="font-bold text-indigo-600">{analysisResult.recommended_quality}%</span> quality.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
                        <button
                          type="button"
                          onClick={() => setSettings({...settings, format: analysisResult.recommended_format, quality: analysisResult.recommended_quality})}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors"
                        >
                          Apply Settings
                        </button>
                        <button
                          type="button"
                          onClick={handleAskAiRecommendation}
                          className="text-purple-700 hover:text-purple-950 text-[10px] font-bold ml-2"
                        >
                          Analyze Again
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Target Output Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {['webp', 'jpeg', 'png'].map(fmt => (
                    <button 
                      key={fmt}
                      onClick={() => setSettings({...settings, format: fmt})}
                      className={`py-2.5 rounded-xl text-xs md:text-sm font-bold border transition-all ${settings.format === fmt ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Quality Level</label>
                  <span className="text-sm font-bold text-indigo-600">{settings.quality}%</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="100" 
                  value={settings.quality}
                  onChange={(e) => setSettings({...settings, quality: parseInt(e.target.value)})}
                  className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Quality slider"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                  <span>Max Optimization</span>
                  <span>Max Quality</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Resize Image</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Set custom output dimensions before compression.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings.resizeEnabled}
                      onChange={(e) => setSettings({ ...settings, resizeEnabled: e.target.checked })}
                      aria-label="Enable image resize"
                    />
                    <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 peer-focus-visible:ring-offset-2 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="text-xs font-semibold text-slate-600">
                    Width
                    <input
                      type="number"
                      min="1"
                      max="20000"
                      value={settings.width || ''}
                      disabled={!settings.resizeEnabled}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600">
                    Height
                    <input
                      type="number"
                      min="1"
                      max="20000"
                      value={settings.height || ''}
                      disabled={!settings.resizeEnabled}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </label>
                </div>

                <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={settings.maintainAspectRatio}
                    disabled={!settings.resizeEnabled}
                    onChange={(e) => handleAspectRatioChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600 disabled:cursor-not-allowed"
                  />
                  Maintain Aspect Ratio
                </label>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                disabled={!file || isCompressing}
                isLoading={isCompressing}
                onClick={handleCompress}
              >
                {isCompressing ? 'Running Optimization...' : 'Optimize Asset'}
              </Button>
            </div>
          </Card>

          {/* Complete Results Stats Box */}
          <AnimatePresence>
            {compressionResult && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="p-5 md:p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-xl">
                  <div className="flex items-center gap-2 mb-5 text-indigo-100">
                    <CheckCircle2 size={20} />
                    <h3 className="text-lg font-bold text-white">Compression Completed</h3>
                  </div>

                  {/* Friendly filename display */}
                  <div className="bg-white/10 rounded-xl p-3 mb-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-indigo-200 text-xs font-semibold shrink-0">Original</span>
                      <span className="text-white text-xs font-mono truncate text-right" title={compressionResult.originalFilename}>
                        {compressionResult.originalFilename}
                      </span>
                    </div>
                    <div className="border-t border-white/10" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-indigo-200 text-xs font-semibold shrink-0">Saved as</span>
                      <span className="text-green-300 text-xs font-mono truncate text-right font-bold" title={compressionResult.compressedFilename}>
                        {compressionResult.compressedFilename}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-indigo-200 text-xs mb-1 font-semibold">Original Size</p>
                      <p className="font-extrabold text-lg md:text-xl">{formatSize(compressionResult.originalSize)}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-25">
                         <ArrowRight size={40} className="-rotate-45" />
                      </div>
                      <p className="text-indigo-200 text-xs mb-1 font-semibold">New Size</p>
                      <p className="font-extrabold text-lg md:text-xl text-green-300">{formatSize(compressionResult.compressedSize)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-indigo-200 text-xs mb-1 font-semibold">Original Resolution</p>
                      <p className="font-bold text-sm md:text-base">
                        {compressionResult.originalWidth} × {compressionResult.originalHeight}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-indigo-200 text-xs mb-1 font-semibold">Compressed Resolution</p>
                      <p className="font-bold text-sm md:text-base text-green-300">
                        {compressionResult.compressedWidth} × {compressionResult.compressedHeight}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 mb-5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-indigo-100">Bandwidth Savings</span>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-black">-{compressionResult.savings}%</span>
                  </div>

                  <Button 
                    variant="secondary" 
                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold"
                    onClick={handleDownload}
                  >
                    <Download size={18} className="mr-2" /> Download {compressionResult.compressedFilename}
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </aside>
      </div>
    </motion.article>
  );
}
