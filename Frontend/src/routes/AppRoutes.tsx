import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import NavBar from '../components/ui/tubelight-navbar';
import { Home as HomeIcon, Image as ImageIcon, BarChart2 as BarChartIcon, FileText as FileTextIcon } from 'lucide-react';
import Footer from '../components/layout/Footer/Footer';

// Route-based code splitting
const Home = lazy(() => import('../pages/Home/Home'));
const Compress = lazy(() => import('../pages/Compress/Compress'));
const History = lazy(() => import('../pages/History/History'));
const About = lazy(() => import('../pages/About/About'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));

// Premium Skeleton Page Loader Component
function PageSkeleton() {
  return (
    <div className="container mx-auto px-6 py-12 space-y-8 animate-pulse max-w-6xl">
      <div className="h-10 bg-slate-200 rounded-lg w-1/3 mx-auto"></div>
      <div className="h-4 bg-slate-200 rounded-lg w-1/2 mx-auto"></div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8">
        <div className="md:col-span-7 h-96 bg-slate-200 rounded-2xl"></div>
        <div className="md:col-span-5 h-96 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const location = useLocation();

  return (
    <>
      {
        /* Use the new Tubelight NavBar with same routes */
      }
      <NavBar
        items={[
          { name: 'Home', url: '/', icon: HomeIcon },
          { name: 'Compress', url: '/compress', icon: ImageIcon },
          { name: 'History', url: '/history', icon: BarChartIcon },
          { name: 'About', url: '/about', icon: FileTextIcon },
        ]}
      />
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/compress" element={<Compress />} />
              <Route path="/history" element={<History />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
