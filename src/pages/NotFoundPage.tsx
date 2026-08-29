import React, { useEffect } from 'react';
import { ArrowLeft, Home, BookOpen, AlertTriangle } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate?: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = '404 - Page Not Found | CodeFuser';
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = 'noindex, nofollow';
  }, []);

  const handleNav = (target: string) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.href = target;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 bg-zinc-950 text-zinc-100">
      <div className="max-w-lg w-full text-center space-y-8 p-8 rounded-2xl bg-zinc-900/80 border border-white/10 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertTriangle size={32} />
        </div>

        <div className="space-y-3">
          <div className="text-xs font-mono font-semibold uppercase tracking-widest text-amber-400">
            Error 404
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            The page or article you are looking for does not exist, may have been moved, or the URL might be mistyped.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => handleNav('/blog')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-zinc-950 font-mono text-xs font-bold hover:bg-amber-300 transition-all"
          >
            <BookOpen size={15} />
            <span>Explore Blog Articles</span>
          </button>
          <button
            onClick={() => handleNav('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs transition-all border border-white/10"
          >
            <Home size={15} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
