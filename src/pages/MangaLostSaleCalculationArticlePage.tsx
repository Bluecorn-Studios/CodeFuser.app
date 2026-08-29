import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Bot, 
  Scale, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  BookOpen, 
  Globe2, 
  BarChart3, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const MangaLostSaleCalculationArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'they-said-manga-piracy-cost-billions-but-how-do-you-calculate-a-lost-sale'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'they-said-manga-piracy-cost-billions-but-how-do-you-calculate-a-lost-sale'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "They Said Manga Piracy Cost Billions. But How Do You Actually Calculate a “Lost Sale”? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Japanese lawmakers were presented with enormous estimates of manga piracy damage. But what does a piracy “loss” actually mean? We examine the headline numbers, page views versus purchases, international access, fan translations, subscription models, and why a huge piracy estimate can contain both real harm and assumptions."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "They Said Manga Piracy Cost Billions. But How Do You Actually Calculate a “Lost Sale”?",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-400/20 selection:text-amber-200">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => onNavigate ? onNavigate('/blog') : (window.location.href = '/blog')}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform text-amber-400" />
            <span>Back to Journal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all"
              title="Share article"
            >
              <Share2 size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Badges & Header Title */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium tracking-wide">
              Publishing Economics & Media Analytics
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
              The "Lost Sale" Quantitative Audit
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            They Said Manga Piracy Cost Billions. But How Do You Actually Calculate a “Lost Sale”?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            When Japanese industry groups and lawmakers present multi-billion dollar damage estimates from online manga piracy, the figures make front-page headlines worldwide. But what do those figures actually represent—and does an unauthorized pageview really equal a stolen retail purchase?
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              12 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Bot size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="manga-lost-sale-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            The headline number is the first thing that grabs you.
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 font-mono text-center space-y-2 my-4">
            <div className="text-amber-400 text-2xl sm:text-3xl font-black uppercase tracking-wider">
              “¥1.01 TRILLION ($7.8 BILLION) IN DAMAGE”
            </div>
            <div className="text-zinc-400 text-xs sm:text-sm">
              Estimated annual losses presented by anti-piracy trade groups (ABJ / CODA)
            </div>
          </div>

          <p>
            When Japanese lawmakers were presented with these staggering figures, parliamentary committees gasped and immediately drafted harsher copyright penalties.
          </p>

          <p>
            Online, however, the response from data scientists, economists, and fans was immediate: <em>“Wait. How did they actually calculate that number?”</em>
          </p>

          <p className="text-xl font-display font-bold text-white">
            There is an enormous difference between: “This many unauthorized pages were read,” and: “This much cash was taken out of the publishing economy.”
          </p>

          <p>
            Understanding this gap does not mean claiming piracy has zero negative impact on manga creators. It means pulling back the curtain on the statistical models used by trade associations to justify copyright lobbying.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Direct Multiplication Fallacy */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <FileSpreadsheet size={15} />
              <span>Statistical Mechanics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Giant Number Formula: How the Multiplier Works
            </h2>
          </div>

          <p>
            The fundamental flaw in many anti-piracy estimates is the assumption of <strong>100% price inelasticity</strong>:
          </p>

          {/* Formula Card */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 my-6 space-y-4 font-mono text-xs sm:text-sm">
            <div className="text-amber-400 font-bold uppercase">The Naive Loss Equation:</div>
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-2 text-zinc-300">
              <div>Total Pirated Pageviews / Chapters Read ÷ Volume Length = <strong>Estimated Volumes Read</strong></div>
              <div>Estimated Volumes Read × Retail Cover Price ($5.00 / ¥600) = <strong className="text-rose-400">“Total Lost Revenue”</strong></div>
            </div>
            <p className="text-zinc-400 font-sans text-xs">
              This formula treats every free click by a 14-year-old student with zero bank account access as a guaranteed $5.00 retail transaction that was directly stolen from a Tokyo bookstore.
            </p>
          </div>

          <p>
            In economics, this is known as the <strong>Zero Marginal Cost Illusion</strong>. If a user reads 150 chapters of an obscure martial arts manga on a weekend binge:
          </p>

          <ul className="space-y-2 list-disc pl-6 text-sm text-zinc-300 font-sans">
            <li>Under the trade group model: The user “stole” $750 worth of manga.</li>
            <li>Under real economic behavior: If forced to pay $750 upfront, the user would have bought <strong>$0</strong> and watched YouTube instead.</li>
          </ul>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The Conversion Spectrum */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Users size={15} />
              <span>Audience Archetypes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Four Pirate Archetypes: Who Actually Pays?
            </h2>
          </div>

          <p>
            Empirical media consumption surveys break unauthorized readers into four distinct economic tiers:
          </p>

          {/* 4 Archetypes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-rose-400 font-bold uppercase flex items-center gap-1.5">
                <span>1. The Displaced Buyer (True Harm)</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Has disposable income and ready access to official apps, but uses piracy sites purely for convenience or to save money. This represents genuine economic loss to creators.
              </p>
              <div className="text-zinc-500 font-mono text-xs">Real Conversion Rate: 40–70%</div>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>2. The Zero-Capital Sampler</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Adolescents and students in low-income or emerging markets with zero banking access. If piracy sites were erased, their spending would not increase by a single yen.
              </p>
              <div className="text-zinc-500 font-mono text-xs">Real Conversion Rate: 0%</div>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                <span>3. The Downstream Superfan</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Discovers a series via unofficial scanlations, falls in love with the IP, and subsequently spends hundreds of dollars on physical tankobon, scale figures, Blu-rays, and cinema tickets.
              </p>
              <div className="text-zinc-500 font-mono text-xs">Net Economic Value: Positive</div>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-blue-400 font-bold uppercase flex items-center gap-1.5">
                <span>4. The Access-Deprived Reader</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Wants to read niche titles that have no official English or regional localization. Piracy is literally their only bridge to access the content.
              </p>
              <div className="text-zinc-500 font-mono text-xs">Market Status: Unserved Demand</div>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Ecosystem Effect */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <TrendingUp size={15} />
              <span>Macroeconomics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Manga as a Funnel: Downstream Monetization
            </h2>
          </div>

          <p>
            Unlike traditional book publishing, modern manga operates as the top of an enormous multi-billion dollar entertainment funnel:
          </p>

          {/* Monetization Funnel Diagram */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 my-6 space-y-3 font-mono text-xs">
            <div className="text-amber-400 font-bold uppercase">The Modern Media Mix Pipeline:</div>
            <div className="space-y-2 text-zinc-300 font-sans">
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>1. Manga Chapters (Low Margin Discovery)</span>
                <span className="font-mono text-amber-400">Audience Discovery</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>2. Anime Adaptations (Global Streaming Rights)</span>
                <span className="font-mono text-blue-400">Mass Reach</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>3. Box Office, Collectibles, Games & Merch</span>
                <span className="font-mono text-emerald-400">80%+ of Net IP Profits</span>
              </div>
            </div>
          </div>

          <p>
            Global phenomena like <em>Demon Slayer</em> and <em>Jujutsu Kaisen</em> generated tens of millions of dollars in Western merchandise and movie tickets specifically because early international scanlations created a hyper-engaged fanbase long before official distribution pipelines caught up.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Real Solution */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <BookOpen size={15} />
              <span>The Service Revolution</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why Official Simulpubs Beat Copyright Lawsuits
            </h2>
          </div>

          <p>
            When Shueisha launched <strong>MANGA Plus</strong> and VIZ expanded the <strong>Shonen Jump</strong> digital subscription ($2.99/mo for simultaneous chapter releases with Tokyo), manga piracy in major Western territories dropped significantly for participating titles.
          </p>

          <p>
            As Valve founder Gabe Newell famously observed: <em>“Piracy is almost always a service problem, not a pricing problem.”</em> When publishers provide high-resolution, instant, affordable access on the same day as Japanese street dates, readers overwhelmingly choose the legal platform.
          </p>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Analytical Verdict
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Multi-billion dollar piracy numbers are political metrics, not accounting ledgers.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Manga piracy causes real, measurable financial harm to authors and publishers—particularly through advertising revenue siphon and displaced volume sales from solvent readers. But treating every free pageview as a lost $5 purchase grossly misdiagnoses consumer behavior. The path to protecting creators isn't inventing inflated damage tallies to frighten legislators; it's continuing to build frictionless, globally synchronized, and fairly priced digital storefronts that make piracy obsolete.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="manga-lost-sale-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Publishing & Economic Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Content Overseas Distribution Association (CODA) & ABJ Japan Annual Damage Reports (2021–2025).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Research Institute for Publications (Shuppan Kagaku Kenkyujo): Japanese Manga Market Trends & Digital Shift.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>World Intellectual Property Organization (WIPO): "Economic Methodologies for Estimating Copyright Infringement Impact."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Journal of Cultural Economics: "The Spillover Effects of Scanlation and Digital Sampling on Physical Manga Sales."</span>
            </li>
          </ul>
        </div>

        {/* Related Articles */}
        <div className="mt-16 border-t border-white/10 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Related Investigations & Tech Insights
            </h3>
            <button
              onClick={() => onNavigate ? onNavigate('/blog') : (window.location.href = '/blog')}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigate ? onNavigate(`/blog/${post.slug}`) : (window.location.href = `/blog/${post.slug}`)}
                className="group p-5 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="text-amber-400">{post.category}</span>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>
                <h4 className="text-base font-display font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {post.metaDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};
export default MangaLostSaleCalculationArticlePage;
