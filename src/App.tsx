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
import { ensureAdSenseScriptLoaded } from './lib/adsenseLoader';

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
const TeamWaterArticlePage = lazyWithRetry(() => import('./pages/TeamWaterArticlePage'), 'TeamWaterArticlePage');
const ChatgptVsGeminiArticlePage = lazyWithRetry(() => import('./pages/ChatgptVsGeminiArticlePage'), 'ChatgptVsGeminiArticlePage');
const StreamingPiracyArticlePage = lazyWithRetry(() => import('./pages/StreamingPiracyArticlePage'), 'StreamingPiracyArticlePage');
const PiracyPsychologyArticlePage = lazyWithRetry(() => import('./pages/PiracyPsychologyArticlePage'), 'PiracyPsychologyArticlePage');
const PiracyEconomicsArticlePage = lazyWithRetry(() => import('./pages/PiracyEconomicsArticlePage'), 'PiracyEconomicsArticlePage');
const DigitalOwnershipArticlePage = lazyWithRetry(() => import('./pages/DigitalOwnershipArticlePage'), 'DigitalOwnershipArticlePage');
const InternetArgumentsArticlePage = lazyWithRetry(() => import('./pages/InternetArgumentsArticlePage'), 'InternetArgumentsArticlePage');
const IllegalProductUXArticlePage = lazyWithRetry(() => import('./pages/IllegalProductUXArticlePage'), 'IllegalProductUXArticlePage');
const ShadowCompetitionArticlePage = lazyWithRetry(() => import('./pages/ShadowCompetitionArticlePage'), 'ShadowCompetitionArticlePage');
const JapanesePiracyCultureArticlePage = lazyWithRetry(() => import('./pages/JapanesePiracyCultureArticlePage'), 'JapanesePiracyCultureArticlePage');
const PirateTakedownArticlePage = lazyWithRetry(() => import('./pages/PirateTakedownArticlePage'), 'PirateTakedownArticlePage');
const IndiePiratesArticlePage = lazyWithRetry(() => import('./pages/IndiePiratesArticlePage'), 'IndiePiratesArticlePage');
const AntiPiracyMarketingArticlePage = lazyWithRetry(() => import('./pages/AntiPiracyMarketingArticlePage'), 'AntiPiracyMarketingArticlePage');
const PreordersGamingArticlePage = lazyWithRetry(() => import('./pages/PreordersGamingArticlePage'), 'PreordersGamingArticlePage');
const LeaksVsPiracyArticlePage = lazyWithRetry(() => import('./pages/LeaksVsPiracyArticlePage'), 'LeaksVsPiracyArticlePage');
const ClaudePiracyScreenshotArticlePage = lazyWithRetry(() => import('./pages/ClaudePiracyScreenshotArticlePage'), 'ClaudePiracyScreenshotArticlePage');
const IfNobodySellsItArticlePage = lazyWithRetry(() => import('./pages/IfNobodySellsItArticlePage'), 'IfNobodySellsItArticlePage');
const AiVsPiracyEthicsArticlePage = lazyWithRetry(() => import('./pages/AiVsPiracyEthicsArticlePage'), 'AiVsPiracyEthicsArticlePage');
const WhatDidYouTakeArticlePage = lazyWithRetry(() => import('./pages/WhatDidYouTakeArticlePage'), 'WhatDidYouTakeArticlePage');
const AntiPiracyAdMemeArticlePage = lazyWithRetry(() => import('./pages/AntiPiracyAdMemeArticlePage'), 'AntiPiracyAdMemeArticlePage');
const YouPaidForGameArticlePage = lazyWithRetry(() => import('./pages/YouPaidForGameArticlePage'), 'YouPaidForGameArticlePage');
const MangaLostSaleCalculationArticlePage = lazyWithRetry(() => import('./pages/MangaLostSaleCalculationArticlePage'), 'MangaLostSaleCalculationArticlePage');
const JapanMangaGlobalAudienceArticlePage = lazyWithRetry(() => import('./pages/JapanMangaGlobalAudienceArticlePage'), 'JapanMangaGlobalAudienceArticlePage');
const GameCosts70ArticlePage = lazyWithRetry(() => import('./pages/GameCosts70ArticlePage'), 'GameCosts70ArticlePage');
const SoloDevJustPirateItArticlePage = lazyWithRetry(() => import('./pages/SoloDevJustPirateItArticlePage'), 'SoloDevJustPirateItArticlePage');
const WhyDoPeopleBuyGamesArticlePage = lazyWithRetry(() => import('./pages/WhyDoPeopleBuyGamesArticlePage'), 'WhyDoPeopleBuyGamesArticlePage');

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
      '/blog/best-ai-apps-2026-ranked-by-real-world-use',
      '/blog/teamwater-40-million-question-how-charity-impact-should-be-measured',
      '/blog/chatgpt-vs-gemini-user-reviews-what-star-ratings-hide',
      '/blog/did-streaming-services-rebuild-the-piracy-problem',
      '/blog/piracy-isnt-just-about-free-psychology-morality-and-justification',
      '/blog/if-one-million-people-pirate-a-70-game-did-developer-lose-70-million',
      '/blog/you-paid-for-it-why-can-they-still-take-it-away',
      '/blog/why-internet-arguments-rarely-change-anyones-mind',
      '/blog/when-the-illegal-product-has-the-better-user-experience',
      '/blog/what-happens-when-piracy-becomes-the-competition',
      '/blog/do-japanese-people-really-hate-piracy-more-than-everyone-else',
      '/blog/why-is-taking-down-a-pirate-website-so-much-harder-than-it-looks',
      '/blog/he-couldnt-stop-pirates-so-he-made-them-part-of-the-game',
      '/blog/when-anti-piracy-becomes-marketing-can-a-joke-actually-sell-a-game',
      '/blog/are-pre-orders-really-killing-gaming-or-are-gamers-arguing-about-the-wrong-thing',
      '/blog/why-piracy-communities-fear-leaks-more-than-piracy',
      '/blog/claude-refused-piracy-setup-then-built-it-from-a-screenshot',
      '/blog/if-nobody-sells-it-who-are-you-stealing-from',
      '/blog/you-hate-ai-for-taking-content-what-about-piracy',
      '/blog/you-didnt-steal-the-game-so-what-did-you-take',
      '/blog/the-anti-piracy-ad-that-accidentally-became-piracy-material',
      '/blog/you-paid-for-the-game-why-cant-you-play-it-anymore',
      '/blog/they-said-manga-piracy-cost-billions-but-how-do-you-calculate-a-lost-sale',
      '/blog/japan-built-the-manga-the-internet-built-the-global-audience',
      '/blog/the-game-costs-70-the-problem-is-that-70-doesnt-mean-the-same-thing-to-everyone',
      '/blog/the-solo-dev-said-just-pirate-it-then-everyone-started-buying-the-game',
      '/blog/why-do-people-buy-games-instead-of-pirating'
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

    // Initialize Google AdSense for eligible public Journal pages (if configured)
    ensureAdSenseScriptLoaded(cleanPath);
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
      case '/blog/teamwater-40-million-question-how-charity-impact-should-be-measured':
        return <TeamWaterArticlePage />;
      case '/blog/chatgpt-vs-gemini-user-reviews-what-star-ratings-hide':
        return <ChatgptVsGeminiArticlePage />;
      case '/blog/did-streaming-services-rebuild-the-piracy-problem':
        return <StreamingPiracyArticlePage />;
      case '/blog/piracy-isnt-just-about-free-psychology-morality-and-justification':
        return <PiracyPsychologyArticlePage />;
      case '/blog/if-one-million-people-pirate-a-70-game-did-developer-lose-70-million':
        return <PiracyEconomicsArticlePage />;
      case '/blog/you-paid-for-it-why-can-they-still-take-it-away':
        return <DigitalOwnershipArticlePage />;
      case '/blog/why-internet-arguments-rarely-change-anyones-mind':
        return <InternetArgumentsArticlePage />;
      case '/blog/when-the-illegal-product-has-the-better-user-experience':
        return <IllegalProductUXArticlePage />;
      case '/blog/what-happens-when-piracy-becomes-the-competition':
        return <ShadowCompetitionArticlePage />;
      case '/blog/do-japanese-people-really-hate-piracy-more-than-everyone-else':
        return <JapanesePiracyCultureArticlePage />;
      case '/blog/why-is-taking-down-a-pirate-website-so-much-harder-than-it-looks':
        return <PirateTakedownArticlePage />;
      case '/blog/he-couldnt-stop-pirates-so-he-made-them-part-of-the-game':
        return <IndiePiratesArticlePage />;
      case '/blog/when-anti-piracy-becomes-marketing-can-a-joke-actually-sell-a-game':
        return <AntiPiracyMarketingArticlePage />;
      case '/blog/are-pre-orders-really-killing-gaming-or-are-gamers-arguing-about-the-wrong-thing':
        return <PreordersGamingArticlePage />;
      case '/blog/why-piracy-communities-fear-leaks-more-than-piracy':
        return <LeaksVsPiracyArticlePage />;
      case '/blog/claude-refused-piracy-setup-then-built-it-from-a-screenshot':
        return <ClaudePiracyScreenshotArticlePage />;
      case '/blog/if-nobody-sells-it-who-are-you-stealing-from':
        return <IfNobodySellsItArticlePage />;
      case '/blog/you-hate-ai-for-taking-content-what-about-piracy':
        return <AiVsPiracyEthicsArticlePage />;
      case '/blog/you-didnt-steal-the-game-so-what-did-you-take':
        return <WhatDidYouTakeArticlePage />;
      case '/blog/the-anti-piracy-ad-that-accidentally-became-piracy-material':
        return <AntiPiracyAdMemeArticlePage />;
      case '/blog/you-paid-for-the-game-why-cant-you-play-it-anymore':
        return <YouPaidForGameArticlePage />;
      case '/blog/they-said-manga-piracy-cost-billions-but-how-do-you-calculate-a-lost-sale':
        return <MangaLostSaleCalculationArticlePage />;
      case '/blog/japan-built-the-manga-the-internet-built-the-global-audience':
        return <JapanMangaGlobalAudienceArticlePage />;
      case '/blog/the-game-costs-70-the-problem-is-that-70-doesnt-mean-the-same-thing-to-everyone':
        return <GameCosts70ArticlePage />;
      case '/blog/the-solo-dev-said-just-pirate-it-then-everyone-started-buying-the-game':
        return <SoloDevJustPirateItArticlePage />;
      case '/blog/why-do-people-buy-games-instead-of-pirating':
        return <WhyDoPeopleBuyGamesArticlePage />;
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

