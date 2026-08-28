import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PagePath } from './types';
import { RouterContext, P as PageContainer } from './components/Reveal';
import Home from './pages/Home';
import { ErrorBoundary } from './components/auth/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequirePortalAccess } from './components/auth/RequirePortalAccess';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Lazy load secondary pages with automatic chunk retry & auto-refresh on new deployments
const Story = lazyWithRetry(() => import('./pages/Story'), 'Story');
const Process = lazyWithRetry(() => import('./pages/Process'), 'Process');
const PricingPage = lazyWithRetry(() => import('./pages/PricingPage'), 'PricingPage');
const FAQPage = lazyWithRetry(() => import('./pages/FAQPage'), 'FAQPage');
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'), 'ContactPage');
const Portfolio = lazyWithRetry(() => import('./pages/Portfolio'), 'Portfolio');
const StartProjectPage = lazyWithRetry(() => import('./pages/StartProjectPage'), 'StartProjectPage');
const MissionControl = lazyWithRetry(() => import('./pages/MissionControl'), 'MissionControl');
const CustomerDashboard = lazyWithRetry(() => import('./pages/CustomerDashboard'), 'CustomerDashboard');
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'), 'LoginPage');
const LogoPage = lazyWithRetry(() => import('./pages/LogoPage'), 'LogoPage');
const BlogIndexPage = lazyWithRetry(() => import('./pages/BlogIndexPage'), 'BlogIndexPage');
const UnfinishedWorkArticlePage = lazyWithRetry(() => import('./pages/UnfinishedWorkArticlePage'), 'UnfinishedWorkArticlePage');
const IncentiveTrapArticlePage = lazyWithRetry(() => import('./pages/IncentiveTrapArticlePage'), 'IncentiveTrapArticlePage');
const BestAIApps2026ArticlePage = lazyWithRetry(() => import('./pages/BestAIApps2026ArticlePage'), 'BestAIApps2026ArticlePage');

function PageLoader() {
  console.log(`[TIMING] ${performance.now().toFixed(2)}ms - PageLoader rendered`);
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full" id="page-loader">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<PagePath>('/');

  useEffect(() => {
    console.log(`[TIMING] ${performance.now().toFixed(2)}ms - 1. App mounted`);
    const validPaths: PagePath[] = [
      '/',
      '/story',
      '/process',
      '/portfolio',
      '/pricing',
      '/faq',
      '/contact',
      '/start-project',
      '/mission-control',
      '/dashboard',
      '/login',
      '/logo',
      '/blog',
      '/blog/unfinished-work-productivity-paradox',
      '/blog/incentive-trap-salary-commission-profit-share-equity',
      '/blog/best-ai-apps-2026-ranked-by-real-world-use'
    ];
    
    // Parse path and state on start
    const path = window.location.pathname as PagePath;
    if (validPaths.includes(path)) {
      setCurrentPath(path);
    } else {
      setCurrentPath('/');
    }

    // Scroll to section on home page if section hash is specified
    const handleUrlHashAndScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const scrollToTarget = () => {
          const el = document.getElementById(id);
          if (el) {
            const headerHeight = 64; // header is h-16 which maps to 64px
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + (window.pageYOffset || document.documentElement.scrollTop) - headerHeight - 24; // with comfortable top padding

            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });
            return true;
          }
          return false;
        };

        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (scrollToTarget() || attempts > 30) {
            clearInterval(interval);
            if (attempts <= 30) {
              setTimeout(scrollToTarget, 200);
              setTimeout(scrollToTarget, 500);
            }
          }
        }, 100);
      }
    };

    handleUrlHashAndScroll();

    // Listen to browser PopState navigations
    const handlePopState = () => {
      const activePath = window.location.pathname as PagePath;
      if (validPaths.includes(activePath)) {
        setCurrentPath(activePath);
      } else {
        setCurrentPath('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleUrlHashAndScroll);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleUrlHashAndScroll);
    };
  }, []);

  useEffect(() => {
    // Dynamic Page Title & Canonical URL Management for SPA Navigation
    const titles: Record<string, string> = {
      '/': 'CodeFuser — Website Development & Digital Growth Agency',
      '/story': 'CodeFuser Founder Story — Fusing Potential With Scale',
      '/process': 'CodeFuser Process — Website Development & Digital Growth Roadmap',
      '/pricing': 'CodeFuser Pricing — Transparent Website & Digital Growth Plans',
      '/faq': 'CodeFuser FAQ — Websites, SEO & Automation Answers',
      '/contact': 'Contact CodeFuser — Start Your Digital Growth Strategy',
      '/portfolio': 'CodeFuser Portfolio — Website & Digital Growth Case Studies',
      '/start-project': 'Start Your Project — CodeFuser Digital Growth Audit',
      '/dashboard': 'Client Portal — CodeFuser',
      '/login': 'Login — CodeFuser Client Portal',
      '/mission-control': 'Mission Control — CodeFuser Admin',
      '/logo': 'Brand Assets — CodeFuser',
      '/blog': 'CodeFuser Journal & Research — Work Systems, SEO & Automation',
      '/blog/unfinished-work-productivity-paradox': 'The Productivity Paradox of Unfinished Work — CodeFuser',
      '/blog/incentive-trap-salary-commission-profit-share-equity': 'The Incentive Trap: Salary, Commission, Profit Share & Equity — CodeFuser',
      '/blog/best-ai-apps-2026-ranked-by-real-world-use': 'The 10 AI Apps That Actually Matter in 2026 — CodeFuser',
    };

    const cleanPath = currentPath.split('?')[0];
    const pageTitle = titles[cleanPath] || 'CodeFuser — Website Development & Digital Growth Agency';
    document.title = pageTitle;

    // Update canonical link
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalUrl = cleanPath === '/' ? 'https://codefuser.in/' : `https://codefuser.in${cleanPath}`;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [currentPath]);

  const navigate = (to: PagePath) => {
    window.history.pushState(null, '', to);
    setCurrentPath(to);
  };

  const renderPage = () => {
    const cleanPath = currentPath.split('?')[0] as PagePath;
    switch (cleanPath) {
      case '/story':
        return <Story />;
      case '/process':
        return <Process />;
      case '/pricing':
        return <PricingPage />;
      case '/faq':
        return <FAQPage />;
      case '/contact':
        return <ContactPage />;
      case '/portfolio':
        return <Portfolio />;
      case '/start-project':
        return <StartProjectPage />;
      case '/mission-control':
        return <MissionControl />;
      case '/dashboard':
        return (
          <RequireAuth onRedirectToLogin={() => navigate('/login')}>
            <RequirePortalAccess>
              <CustomerDashboard />
            </RequirePortalAccess>
          </RequireAuth>
        );
      case '/login':
        return <LoginPage />;
      case '/logo':
        return <LogoPage />;
      case '/blog':
        return <BlogIndexPage />;
      case '/blog/unfinished-work-productivity-paradox':
        return <UnfinishedWorkArticlePage />;
      case '/blog/incentive-trap-salary-commission-profit-share-equity':
        return <IncentiveTrapArticlePage />;
      case '/blog/best-ai-apps-2026-ranked-by-real-world-use':
        return <BestAIApps2026ArticlePage />;
      case '/':
      default:
        return <Home />;
    }
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <RouterContext.Provider value={{ currentPath, navigate }}>
            <PageContainer>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPath}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  <Suspense fallback={<PageLoader />}>
                    {renderPage()}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </PageContainer>
          </RouterContext.Provider>
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

