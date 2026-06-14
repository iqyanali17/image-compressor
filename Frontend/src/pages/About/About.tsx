import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  BrainCircuit,
  Database,
  Download,
  Gauge,
  Scaling,
  Sparkles,
  UploadCloud,
  WandSparkles,
  type LucideIcon
} from 'lucide-react';
import { pageTransition } from '../../constants/animations';
import Seo from '../../seo/Seo';

interface WorkflowStep {
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
  iconStyle: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: 'easeOut' as const }
  }
};

export default function About() {
  const workflow = useMemo<WorkflowStep[]>(() => [
    {
      title: 'Upload Image',
      description: 'Choose a JPG, PNG, or WEBP image from any device.',
      detail: 'The browser validates the file and reads its original resolution locally.',
      icon: UploadCloud,
      accent: 'from-blue-500 to-cyan-400',
      iconStyle: 'bg-blue-50 text-blue-600 ring-blue-100'
    },
    {
      title: 'AI Analysis',
      description: 'Optionally ask Hugging Face models to analyze the image.',
      detail: 'AI is contacted only when you request a recommendation.',
      icon: BrainCircuit,
      accent: 'from-violet-500 to-purple-500',
      iconStyle: 'bg-violet-50 text-violet-600 ring-violet-100'
    },
    {
      title: 'Smart Recommendation',
      description: 'Receive suggested format and quality settings.',
      detail: 'Review the recommendation, apply it instantly, or keep your custom choices.',
      icon: WandSparkles,
      accent: 'from-fuchsia-500 to-pink-500',
      iconStyle: 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-100'
    },
    {
      title: 'Resize & Optimization',
      description: 'Set custom width and height with smart aspect-ratio control.',
      detail: 'Resize freely or preserve the original proportions automatically.',
      icon: Scaling,
      accent: 'from-amber-400 to-orange-500',
      iconStyle: 'bg-amber-50 text-amber-600 ring-amber-100'
    },
    {
      title: 'Compression Engine',
      description: 'Pillow resizes, converts, and compresses the image.',
      detail: 'High-quality resampling and format-aware optimization reduce file size.',
      icon: Gauge,
      accent: 'from-emerald-400 to-teal-500',
      iconStyle: 'bg-emerald-50 text-emerald-600 ring-emerald-100'
    },
    {
      title: 'History Tracking',
      description: 'Compression details are recorded in MySQL.',
      detail: 'Resolutions, sizes, savings, format, and download counts remain available.',
      icon: Database,
      accent: 'from-indigo-500 to-blue-500',
      iconStyle: 'bg-indigo-50 text-indigo-600 ring-indigo-100'
    },
    {
      title: 'Download Optimized Image',
      description: 'Download the finished image in its optimized format.',
      detail: 'The generated file keeps your selected dimensions and quality settings.',
      icon: Download,
      accent: 'from-rose-500 to-orange-400',
      iconStyle: 'bg-rose-50 text-rose-600 ring-rose-100'
    }
  ], []);

  const aboutSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'How AI Image Compressor Works',
    description: 'Explore the complete image analysis, resizing, compression, history, and download workflow.',
    url: `${window.location.origin}/about`
  }), []);

  return (
    <motion.article
      className="relative mx-auto max-w-6xl overflow-hidden px-4 py-8 md:px-6 md:py-14"
      {...pageTransition}
    >
      <Seo
        title="How AI Image Compressor Works"
        description="Explore the complete image analysis, resizing, compression, history, and download workflow."
        path="/about"
        schema={aboutSchema}
      />

      <header className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 shadow-sm backdrop-blur-xl"
        >
          <Sparkles size={14} />
          From upload to download
        </motion.div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          How The System Works
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-lg">
          Follow each stage of the optimization pipeline, from local image selection to an
          optional AI recommendation and a production-ready optimized download.
        </p>
      </header>

      <section className="relative mx-auto max-w-5xl" aria-label="Image optimization workflow">
        <div className="absolute bottom-20 left-6 top-8 w-px bg-slate-200 md:left-1/2 md:-translate-x-1/2">
          <motion.div
            className="h-full w-full origin-top bg-gradient-to-b from-blue-500 via-purple-500 to-orange-400"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 2.2, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.8)]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="space-y-8 md:space-y-12">
          {workflow.map((step, index) => {
            const Icon = step.icon;
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={step.title}
                className="relative grid min-h-44 grid-cols-[3rem_1fr] items-center gap-4 md:grid-cols-[1fr_5rem_1fr] md:gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
              >
                <motion.div
                  variants={cardVariants}
                  className={`group col-start-2 rounded-3xl border border-white/80 bg-white/70 p-5 text-left shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl transition-shadow hover:shadow-[0_26px_70px_-28px_rgba(79,70,229,0.3)] md:p-6 ${
                    isLeft ? 'md:col-start-1 md:row-start-1' : 'md:col-start-3 md:row-start-1'
                  }`}
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <div className={`mb-5 h-1.5 w-20 rounded-full bg-gradient-to-r ${step.accent}`} />
                  <div className="flex items-start gap-4">
                    <motion.div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${step.iconStyle}`}
                      whileHover={{ rotate: -6, scale: 1.1 }}
                    >
                      <Icon size={23} />
                    </motion.div>
                    <div>
                      <p className="mb-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-400">
                        Step {String(index + 1).padStart(2, '0')}
                      </p>
                      <h2 className="text-lg font-extrabold text-slate-950 md:text-xl">{step.title}</h2>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-700">
                    {step.description}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 md:text-sm">{step.detail}</p>
                </motion.div>

                <motion.div
                  className={`relative z-10 col-start-1 row-start-1 flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-50 bg-gradient-to-br ${step.accent} text-sm font-black text-white shadow-lg md:col-start-2 md:mx-auto`}
                  initial={{ scale: 0, rotate: -30 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.7 }}
                  transition={{ delay: 0.18, type: 'spring', stiffness: 280, damping: 17 }}
                >
                  {index + 1}
                  {index < workflow.length - 1 && (
                    <motion.span
                      className="absolute -bottom-8 text-indigo-500 md:-bottom-10"
                      animate={{ y: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.12 }}
                    >
                      <ArrowDown size={16} strokeWidth={3} />
                    </motion.span>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <motion.section
        className="relative mt-16 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-center text-white shadow-2xl md:mt-24 md:p-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65 }}
      >
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-14 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
        <h2 className="relative z-10 text-2xl font-extrabold md:text-3xl">One connected optimization pipeline</h2>
        <p className="relative z-10 mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-indigo-100 md:text-base">
          Every stage is independently controllable: use your own settings, request AI guidance
          only when useful, and keep a complete record of each optimized image.
        </p>
      </motion.section>
    </motion.article>
  );
}
