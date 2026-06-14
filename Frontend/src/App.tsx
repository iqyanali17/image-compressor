import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import AppRoutes from './routes/AppRoutes';
import { getToken } from './services/imageService';

function App() {
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      getToken().catch(console.error);
    }
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
        {/* Animated Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[100px] animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-blue-200/40 blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] rounded-full bg-purple-200/40 blur-[120px] animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Main Content Area */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <AppRoutes />
        </div>
      </div>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
