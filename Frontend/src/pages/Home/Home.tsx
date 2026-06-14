import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Zap, BarChart2, Layers, Image as ImageIcon, Download } from 'lucide-react';
import Particles from '../../components/common/Particles/Particles';
import { FlipCard } from '../../components/common/FlipCard/FlipCard';
import Seo from '../../seo/Seo';
import { useMemo } from 'react';
import { pageTransition } from '../../constants/animations';

export default function Home() {
  const features = useMemo(() => [
    { icon: Cpu, title: 'AI Analysis', desc: 'Our advanced Hugging Face AI models automatically analyze your image content to recommend the perfect balance between quality and file size.' },
    { icon: Zap, title: 'Smart Compression', desc: 'Achieve up to 80% smaller file sizes instantly. Our smart algorithms strip unnecessary data while keeping your images crisp and professional.' },
    { icon: BarChart2, title: 'Deep Statistics', desc: 'Monitor your optimization history with detailed analytics. Track original sizes, compressed sizes, and total bandwidth saved over time.' },
    { icon: Layers, title: 'Multiple Formats', desc: 'Seamlessly upload and convert between popular web formats including JPEG, PNG, and next-gen WEBP for ultimate browser compatibility.' },
    { icon: ImageIcon, title: 'Fast Processing', desc: 'Experience lightning-fast image processing powered by a highly optimized Python backend, ensuring your workflow is never interrupted.' },
    { icon: Download, title: 'Easy Download', desc: 'Save time by downloading your newly optimized, web-ready images instantly with a single click, perfectly sized for your next project.' },
  ], []);

  // Structured JSON-LD Data for SEO
  const seoSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Image Compressor",
    "url": window.location.origin,
    "description": "Compress JPG, PNG, and WEBP images using AI-powered recommendations while maintaining image quality.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }), []);

  return (
    <motion.article className="w-full" {...pageTransition}>
      <Seo
        title="AI Image Compressor | Smart Image Optimization Tool"
        description="Compress JPG, PNG, and WEBP images using AI-powered recommendations while maintaining image quality."
        path="/"
        schema={seoSchema}
      />

      <section className="relative overflow-hidden container mx-auto px-4 md:px-6 py-12 md:py-8 max-w-7xl flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <Particles
            particleColors={["#6366f1", "#8b5cf6", "#ec4899"]}
            particleCount={160}
            particleSpread={12}
            speed={0.08}
            particleBaseSize={60}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
            pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1}
          />
        </div>
        {/* Animated Feature Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs md:text-sm font-semibold mb-6 md:mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          AI-Powered Optimization Engine
        </motion.div>

        {/* Dynamic Responsive Typography with Clamped Font Sizes */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-4xl">
          Compress Images with <br className="hidden sm:inline" />
          <span className="hero-machine-learning variable-proximity">
            Machine Learning
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mt-6">
          Upload any image and let our AI determine the perfect balance of quality and file size. Save bandwidth without sacrificing visual perfection.
        </p>

        {/* Call to Actions */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/compress"
            className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 w-full sm:w-auto"
          >
            Start Compressing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/about"
            className="flex items-center justify-center px-8 py-4 rounded-full text-base sm:text-lg font-semibold text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Learn How It Works
          </Link>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="bg-slate-50 border-t border-slate-100 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">Premium Features</h2>
            <p className="text-slate-500 mt-3 md:mt-4 text-sm sm:text-base">Everything you need to optimize your web assets.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const front = (
                <div className="bg-white shadow-sm rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3 p-6 h-full w-full">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                </div>
              );

              const back = (
                <div className="bg-indigo-50 shadow-xl border border-indigo-100 rounded-2xl flex flex-col items-center justify-center p-6 md:p-8 h-full w-full text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <FlipCard front={front} back={back} className="h-full" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </motion.article>
  );
}
