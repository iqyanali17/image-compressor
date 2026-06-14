import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? '');


  return (
    <div
      className={cn(
        // span full viewport width so the navbar reaches page edges
        // place at bottom on small screens, at top on larger screens without keeping bottom set
        'fixed left-0 right-0 z-50 bottom-0 sm:top-0 sm:bottom-auto mb-4 sm:mb-0 sm:pt-4 px-4',
        className,
      )}
    >
      <div className="w-full flex items-center justify-center gap-4 bg-white/70 border border-slate-200/60 backdrop-blur-lg py-2 px-5 rounded-full shadow-xl">
        <div className="flex items-center gap-3 mr-2">
          <Link to="/" className="flex items-center gap-2 text-base font-semibold text-slate-900 pr-4">
            <svg className="h-8 w-8" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AI Image Compressor logo">
              <defs>
                <linearGradient id="navGradient" x1="80" y1="80" x2="432" y2="432">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>

              {/* Background Circle */}
              <circle cx="256" cy="256" r="220" fill="url(#navGradient)" opacity="0.08" />

              {/* Top Left Corner */}
              <path d="M120 180V120H180" stroke="url(#navGradient)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />

              {/* Top Right Corner */}
              <path d="M332 120H392V180" stroke="url(#navGradient)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />

              {/* Bottom Left Corner */}
              <path d="M180 392H120V332" stroke="url(#navGradient)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />

              {/* Bottom Right Corner */}
              <path d="M392 332V392H332" stroke="url(#navGradient)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />

              {/* Converging Lines */}
              <line x1="170" y1="170" x2="235" y2="235" stroke="url(#navGradient)" strokeWidth="10" strokeLinecap="round" />
              <line x1="342" y1="170" x2="277" y2="235" stroke="url(#navGradient)" strokeWidth="10" strokeLinecap="round" />
              <line x1="170" y1="342" x2="235" y2="277" stroke="url(#navGradient)" strokeWidth="10" strokeLinecap="round" />
              <line x1="342" y1="342" x2="277" y2="277" stroke="url(#navGradient)" strokeWidth="10" strokeLinecap="round" />

              {/* AI Core */}
              <circle cx="256" cy="256" r="42" fill="url(#navGradient)" />
              <circle cx="256" cy="256" r="16" fill="white" />

              {/* Neural Nodes */}
              <circle cx="256" cy="185" r="8" fill="url(#navGradient)" />
              <circle cx="327" cy="256" r="8" fill="url(#navGradient)" />
              <circle cx="256" cy="327" r="8" fill="url(#navGradient)" />
              <circle cx="185" cy="256" r="8" fill="url(#navGradient)" />

              <line x1="256" y1="201" x2="256" y2="235" stroke="url(#navGradient)" strokeWidth="6" />
              <line x1="311" y1="256" x2="277" y2="256" stroke="url(#navGradient)" strokeWidth="6" />
              <line x1="256" y1="311" x2="256" y2="277" stroke="url(#navGradient)" strokeWidth="6" />
              <line x1="201" y1="256" x2="235" y2="256" stroke="url(#navGradient)" strokeWidth="6" />
            </svg>
            <span className="hidden sm:block text-lg font-bold tracking-tight select-none">
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">Image</span>
              <span className="text-slate-800 ml-1">Compressor</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          {items.map((item) => {
            const Icon = item.icon as any;
            const isActive = activeTab === item.name;

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  'relative cursor-pointer text-sm font-semibold px-5 py-2 rounded-full transition-colors transform hover:-translate-y-0.5',
                  'text-slate-700 hover:text-indigo-600',
                  isActive && 'bg-indigo-50 text-indigo-600 shadow-md',
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={20} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-indigo-50 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full">
                      <div className="absolute w-12 h-6 bg-indigo-600/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-indigo-600/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-indigo-600/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
