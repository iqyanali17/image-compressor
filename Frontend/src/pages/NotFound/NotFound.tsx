import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Seo from '../../seo/Seo';

export default function NotFound() {
  return (
    <motion.article 
      className="container mx-auto px-6 py-24 md:py-32 flex flex-col items-center justify-center text-center space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Seo 
        title="404 Page Not Found" 
        description="The requested page could not be found."
      />
      <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-sm md:text-lg text-slate-600">Oops! The page you are looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Go Back Home
      </Link>
    </motion.article>
  );
}
