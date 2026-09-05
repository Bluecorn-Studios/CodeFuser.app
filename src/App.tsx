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
import { BLOG_POSTS } from './data/blogPosts';
import { getPostSeoTitle, getPostSeoDescription } from './utils/seoHelper';

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
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'), 'NotFoundPage');

import { BlogArticleLayout } from './components/blog/BlogArticleLayout';

// Map of all 29 article slug routes to their corresponding lazy-loaded page components
const ARTICLE_PAGE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'unfinished-work-productivity-paradox': UnfinishedWorkArticlePage,
  'incentive-trap-salary-commission-profit-share-equity': IncentiveTrapArticlePage,
  'best-ai-apps-2026-ranked-by-real-world-use': BestAIApps2026ArticlePage,
  'teamwater-40-million-question-how-charity-impact-should-be-measured': TeamWaterArticlePage,
  'chatgpt-vs-gemini-user-reviews-what-star-ratings-hide': ChatgptVsGeminiArticlePage,
  'did-streaming-services-rebuild-the-piracy-problem': StreamingPiracyArticlePage,
  'piracy-isnt-just-about-free-psychology-morality-and-justification': PiracyPsychologyArticlePage,
  'if-one-million-people-pirate-a-70-game-did-developer-lose-70-million': PiracyEconomicsArticlePage,
  'you-paid-for-it-why-can-they-still-take-it-away': DigitalOwnershipArticlePage,
  'why-internet-arguments-rarely-change-anyones-mind': InternetArgumentsArticlePage,
  'when-the-illegal-product-has-the-better-user-experience': IllegalProductUXArticlePage,
  'what-happens-when-piracy-becomes-the-competition': ShadowCompetitionArticlePage,
  'do-japanese-people-really-hate-piracy-more-than-everyone-else': JapanesePiracyCultureArticlePage,
  'why-is-taking-down-a-pirate-website-so-much-harder-than-it-looks': PirateTakedownArticlePage,
  'he-couldnt-stop-pirates-so-he-made-them-part-of-the-game': IndiePiratesArticlePage,
  'when-anti-piracy-becomes-marketing-can-a-joke-actually-sell-a-game': AntiPiracyMarketingArticlePage,
  'are-pre-orders-really-killing-gaming-or-are-gamers-arguing-about-the-wrong-thing': PreordersGamingArticlePage,
  'why-piracy-communities-fear-leaks-more-than-piracy': LeaksVsPiracyArticlePage,
  'claude-refused-piracy-setup-then-built-it-from-a-screenshot': ClaudePiracyScreenshotArticlePage,
  'if-nobody-sells-it-who-are-you-stealing-from': IfNobodySellsItArticlePage,
  'you-hate-ai-for-taking-content-what-about-piracy': AiVsPiracyEthicsArticlePage,
  'you-didnt-steal-the-game-so-what-did-you-take': WhatDidYouTakeArticlePage,
  'the-anti-piracy-ad-that-accidentally-became-piracy-material': AntiPiracyAdMemeArticlePage,
  'you-paid-for-the-game-why-cant-you-play-it-anymore': YouPaidForGameArticlePage,
  'they-said-manga-piracy-cost-billions-but-how-do-you-calculate-a-lost-sale': MangaLostSaleCalculationArticlePage,
  'japan-built-the-manga-the-internet-built-the-global-audience': JapanMangaGlobalAudienceArticlePage,
  'the-game-costs-70-the-problem-is-that-70-doesnt-mean-the-same-thing-to-everyone': GameCosts70ArticlePage,
  'the-solo-dev-said-just-pirate-it-then-everyone-started-buying-the-game': SoloDevJustPirateItArticlePage,
  'why-do-people-buy-games-instead-of-pirating': WhyDoPeopleBuyGamesArticlePage,
};

function PageLoader() {
  console.log(`[TIMING] ${performance.now().toFixed(2)}ms - PageLoader rendered`);
  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full" id="page-loader">
      <div className="w-8 h-8 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
    </div>
  );
}

const normalizePath = (rawPath: string): PagePath => {
  if (!rawPath) return '/';
  let cleaned = rawPath.split('?')[0].split('#')[0];
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  return (cleaned || '/') as PagePath;
};

const getInitialPath = (): PagePath => {
  if (typeof window !== 'undefined' && window.location) {
    return normalizePath(window.location.pathname);
  }
  return '/';
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<PagePath>(getInitialPath);

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
    const initialPath = normalizePath(window.location.pathname);
    setCurrentPath(initialPath);

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
      const activePath = normalizePath(window.location.pathname);
      setCurrentPath(activePath);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleUrlHashAndScroll);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleUrlHashAndScroll);
    };
  }, []);

  useEffect(() => {
    const cleanPath = currentPath.split('?')[0];

    // Static pages title and description map
    const staticPageMeta: Record<string, { title: string; desc: string }> = {
      '/': {
        title: 'CodeFuser — Website Development & Digital Growth Agency',
        desc: 'We build high-performance websites, web applications, and automated growth systems for scaling businesses. Strategy, design, code, and conversion.',
      },
      '/story': {
        title: 'CodeFuser Founder Story — Fusing Potential With Scale',
        desc: 'Learn the story behind CodeFuser: why we build custom digital infrastructure, our technical philosophy, and how we help businesses scale.',
      },
      '/process': {
        title: 'CodeFuser Process — Website Development & Digital Growth Roadmap',
        desc: 'Explore our 5-phase engineering and delivery framework: Architecture, Design Systems, Full-Stack Engineering, Quality Assurance, and Growth Optimization.',
      },
      '/pricing': {
        title: 'CodeFuser Pricing — Transparent Website & Digital Growth Plans',
        desc: 'Clear, milestone-based pricing for modern web development, headless platforms, and custom digital systems with zero hidden retainers.',
      },
      '/faq': {
        title: 'CodeFuser FAQ — Websites, SEO & Automation Answers',
        desc: 'Answers to frequently asked questions regarding development timelines, technical stacks, SEO architecture, pricing, and project deliverables.',
      },
      '/contact': {
        title: 'Contact CodeFuser — Start Your Digital Growth Strategy',
        desc: 'Get in touch with the CodeFuser engineering and strategy team to discuss your web application, website overhaul, or digital growth project.',
      },
      '/portfolio': {
        title: 'CodeFuser Portfolio — Website & Digital Growth Case Studies',
        desc: 'Case studies and engineering breakdowns of high-converting web applications, e-commerce storefronts, and automated workflows built by CodeFuser.',
      },
      '/start-project': {
        title: 'Start Your Project — CodeFuser Digital Growth Audit',
        desc: 'Submit your project specifications and technical requirements for a comprehensive engineering roadmap and feasibility assessment.',
      },
      '/blog': {
        title: 'CodeFuser Journal & Research — Work Systems, SEO & Automation',
        desc: 'In-depth essays, investigative reports, and research on software economics, digital ownership, AI systems, and modern technology culture.',
      },
      '/dashboard': {
        title: 'Client Portal — CodeFuser',
        desc: 'Secure client project dashboard and delivery portal.',
      },
      '/login': {
        title: 'Login — CodeFuser Client Portal',
        desc: 'Sign in to access your project dashboard, deliverables, and communication feed.',
      },
      '/mission-control': {
        title: 'Mission Control — CodeFuser Admin',
        desc: 'Internal administration and analytics control center.',
      },
      '/logo': {
        title: 'Brand Assets — CodeFuser',
        desc: 'Official brand assets, vector logos, and design identity guidelines.',
      },
    };

    // Check if this is a blog post
    const blogMatch = cleanPath.startsWith('/blog/') ? cleanPath.replace('/blog/', '') : null;
    const currentBlogPost = blogMatch ? BLOG_POSTS.find((p) => p.slug === blogMatch) : null;

    let pageTitle = 'CodeFuser — Website Development & Digital Growth Agency';
    let pageDesc = 'High-performance websites, custom web applications, and automated growth systems.';
    let canonicalUrl = cleanPath === '/' ? 'https://codefuser.in/' : `https://codefuser.in${cleanPath}`;
    let isPrivatePage = ['/dashboard', '/mission-control', '/login', '/logo', '/start-project'].includes(cleanPath);

    if (currentBlogPost) {
      pageTitle = getPostSeoTitle(currentBlogPost);
      pageDesc = getPostSeoDescription(currentBlogPost);
      canonicalUrl = currentBlogPost.canonicalUrl || `https://codefuser.in/blog/${currentBlogPost.slug}`;
    } else if (staticPageMeta[cleanPath]) {
      pageTitle = staticPageMeta[cleanPath].title;
      pageDesc = staticPageMeta[cleanPath].desc;
    } else if (cleanPath !== '/') {
      // 404 Unrecognized route
      pageTitle = '404 - Page Not Found | CodeFuser';
      pageDesc = 'The page or article you are looking for does not exist on CodeFuser.';
      canonicalUrl = 'https://codefuser.in/';
      isPrivatePage = true; // Sets robots meta to noindex, nofollow
    }

    // 1. Update Document Title
    document.title = pageTitle;

    // 2. Update Meta Description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = pageDesc;

    // 3. Update Canonical Tag
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 4. Update Open Graph Meta Tags
    const setMetaTag = (property: string, content: string) => {
      let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMetaTag('og:title', pageTitle);
    setMetaTag('og:description', pageDesc);
    setMetaTag('og:url', canonicalUrl);
    setMetaTag('og:type', currentBlogPost ? 'article' : 'website');
    setMetaTag('og:site_name', 'CodeFuser');

    // 5. Update Twitter Meta Tags
    const setTwitterTag = (name: string, content: string) => {
      let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setTwitterTag('twitter:card', 'summary_large_image');
    setTwitterTag('twitter:title', pageTitle);
    setTwitterTag('twitter:description', pageDesc);

    // 6. Security / Private Route Robots Control (noindex, nofollow for private routes)
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (isPrivatePage) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.name = 'robots';
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.content = 'noindex, nofollow';
    } else {
      if (robotsMeta) {
        robotsMeta.content = 'index, follow';
      }
    }

    // 7. Inject / Update JSON-LD Article Schema for Blog Posts
    const schemaScriptId = 'dynamic-jsonld-schema';
    let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;

    if (currentBlogPost) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = schemaScriptId;
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': currentBlogPost.title,
        'description': getPostSeoDescription(currentBlogPost),
        'author': {
          '@type': 'Organization',
          'name': currentBlogPost.author || 'CodeFuser Tech & Media Research',
          'url': 'https://codefuser.in'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'CodeFuser',
          'url': 'https://codefuser.in',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://codefuser.in/logo.svg'
          }
        },
        'datePublished': currentBlogPost.publishedDate ? '2026-08-28' : '2026-08-28',
        'dateModified': currentBlogPost.lastUpdatedDate ? '2026-08-28' : '2026-08-28',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl
        },
        'articleSection': currentBlogPost.category,
        'keywords': [currentBlogPost.primaryTopic, ...(currentBlogPost.secondaryTopics || [])].join(', ')
      });
    } else if (schemaScript) {
      schemaScript.remove();
    }

    // Initialize Google AdSense for eligible public Journal pages (if configured)
    ensureAdSenseScriptLoaded(cleanPath);
  }, [currentPath]);

  const navigate = (to: string) => {
    const normalized = normalizePath(to);
    window.history.pushState(null, '', normalized);
    setCurrentPath(normalized);
  };

  const renderPage = () => {
    const cleanPath = normalizePath(currentPath);

    // Shared routing for all 29 Journal articles through BlogArticleLayout
    if (cleanPath.startsWith('/blog/') && cleanPath !== '/blog') {
      const slug = cleanPath.replace('/blog/', '');
      const post = BLOG_POSTS.find((p) => p.slug === slug);
      const Component = ARTICLE_PAGE_COMPONENTS[slug];
      if (Component && post) {
        return (
          <BlogArticleLayout post={post}>
            <Component onNavigate={navigate} />
          </BlogArticleLayout>
        );
      }
      return <NotFoundPage onNavigate={navigate} />;
    }

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
      case '/':
        return <Home />;
      default:
        return <NotFoundPage onNavigate={navigate} />;
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

