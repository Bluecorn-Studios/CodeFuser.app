import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Calculator, 
  DollarSign, 
  Percent, 
  TrendingDown, 
  TrendingUp, 
  Gamepad2, 
  Globe2, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  BarChart3,
  Sliders,
  Scale,
  Users
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const PiracyEconomicsArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'if-one-million-people-pirate-a-70-game-did-developer-lose-70-million'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'if-one-million-people-pirate-a-70-game-did-developer-lose-70-million'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "If 1 Million People Pirate a $70 Game, Did the Developer Really Lose $70 Million? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Millions of people pirating a $70 game sounds like $70 million in lost sales. But that simple calculation hides the hardest question in piracy economics: how many pirates would actually have paid?'
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "If 1 Million People Pirate a $70 Game, Did the Developer Really Lose $70 Million?",
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
        <div className="absolute -top-40 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <article className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb Navigation */}
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

        {/* Header Badges & Headline */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-medium tracking-wide">
              Game Economics & Software Markets
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
              The Substitution Rate Problem
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            If 1 Million People Pirate a $70 Game, Did the Developer Really Lose $70 Million?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-emerald-400/80 pl-4 py-1">
            Millions of people pirating a $70 game sounds like $70 million in lost sales. But that simple calculation hides the hardest question in piracy economics: how many pirates would actually have paid?
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              9 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Calculator size={14} className="text-emerald-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="piracy-economics-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is a piece of piracy math that feels almost impossible to argue with.
          </p>

          <p>
            Imagine 1 million people pirate a newly released $70 video game.
          </p>

          <p>
            The math seems elementary:
          </p>

          {/* Simple Formula Callout */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center my-6 space-y-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              1,000,000 × $70 = $70,000,000
            </div>
            <p className="text-xs text-zinc-400 m-0 uppercase tracking-wider">
              The Headline Loss Equation
            </p>
          </div>

          <p>
            So the studio or developer lost <strong className="text-white">$70 million</strong>.
          </p>

          <p className="text-xl font-bold text-white">
            Right?
          </p>

          <p>
            That is exactly the logic behind standard industry lobbying reports and viral online arguments against unauthorized software copying. If a $100 collector's edition is downloaded 1 million times, industry press releases routinely claim an instantaneous $100 million crater in gross revenues—arguing that piracy threatens publisher solvency, forces studio layoffs, and destroys the livelihoods of thousands of developers.
          </p>

          <p>
            It is a clean, visceral, and rhetorically devastating argument.
          </p>

          <p>
            It is also missing one crucial variable:
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-black border border-emerald-500/30 my-6">
            <h2 className="text-xl sm:text-2xl font-display font-black text-white m-0">
              How many of those 1 million people would actually have paid full retail price if piracy were impossible?
            </h2>
          </div>

          <p>
            That single question breaks the headline calculation. Because a downloaded copy is <strong className="text-amber-300">not mathematically identical to a lost retail sale</strong>.
          </p>

          <p>
            Once you account for price elasticity, regional purchasing power disparities, trial samplers, and zero-liquidity demographics, the real economics of software piracy look entirely different.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Hidden Assumption */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Percent size={15} />
              <span>Econometric Flaw</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The viral calculation assumes a 100% substitution rate
            </h2>
          </div>

          <p>
            In economics, the connection between unauthorized consumption and lost legitimate sales is governed by the <strong className="text-white font-mono">Substitution Rate (Sr)</strong>:
          </p>

          <blockquote className="border-l-4 border-emerald-500/80 pl-4 py-2 my-4 text-zinc-300 font-mono text-sm bg-zinc-900/60 rounded-r-lg">
            Substitution Rate = (Number of Lost Paid Sales) / (Total Number of Pirated Copies)
          </blockquote>

          <p>
            When a headline claims that 1,000,000 downloads equals a $70,000,000 loss, it is assuming an <strong className="text-amber-400 font-mono">Sr = 1.00 (100%)</strong>.
          </p>

          <p>
            In other words, it assumes that every single high-school student in Buenos Aires, every budget-strapped college student in Manila, every hardware-testing enthusiast in Berlin, and every casual downloader on Reddit had $70 of liquid disposable cash sitting in their wallet, was standing outside the digital storefront, and was 100% committed to buying the game before choosing to click a magnet link instead.
          </p>

          <p>
            In economic reality, a 100% substitution rate exists for virtually <span className="text-white italic">no non-essential luxury consumer good on Earth</span>.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The 5 Pirate Archetypes */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Layers size={15} />
              <span>Demographic Breakdown</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The 5 distinct cohorts inside the 1 million downloads
            </h2>
          </div>

          <p>
            To calculate what the developer actually lost, you must dissect the 1 million downloaders into their true economic archetypes:
          </p>

          {/* 5 Archetypes Grid */}
          <div className="space-y-4 my-6">
            
            <div className="p-5 rounded-xl bg-zinc-900/80 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-rose-400 uppercase">
                  Cohort 1: The Direct Displaced Buyer (The Real Lost Sale)
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Est. 5% – 15%
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                These users had disposable income, access to payment methods, and genuinely intended to buy the title at retail. When an easy crack appeared on day one, they opted for the free version. <strong>This cohort represents the only authentic lost revenue in the entire equation.</strong>
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-amber-400 uppercase">
                  Cohort 2: The Purchasing Power Parity (PPP) Excluded
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Est. 30% – 45%
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                In regions like Brazil, Turkey, Argentina, or India, a flat $70 USD conversion can equal 15% to 35% of an entire monthly minimum wage. If piracy were blocked, these users would not buy the $70 game; they would simply play free-to-play titles (like <em>Counter-Strike</em> or <em>Dota 2</em>). No money was ever available to lose.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-emerald-400 uppercase">
                  Cohort 3: The Sampler / Trial-to-Buy Converter
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Est. 10% – 20%
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                With modern games launching in unoptimized states and publishers abandoning playable demos, these users download the game to verify framerates and gameplay. If they enjoy it, they purchase a legitimate Steam/GOG copy during the first sale, or buy multiplayer DLC. <strong>This cohort generates positive downstream revenue.</strong>
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-zinc-400 uppercase">
                  Cohort 4: The Zero-Budget Non-Buyer (Pure Free-Rider)
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10">
                  Est. 25% – 35%
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Teenagers without credit cards, casual gamers downloading out of novelty, and digital hoarders. If forced to pay $1, they would walk away. Their consumption consumes digital bandwidth, but zero potential retail dollars.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900/80 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono font-bold text-purple-400 uppercase">
                  Cohort 5: The Platform / DRM Resenter
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Est. 5% – 10%
                </span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Users protesting invasive kernel-level DRM (e.g. Denuvo), mandatory third-party launchers (EA App, Ubisoft Connect), or mandatory secondary accounts. They frequently own extensive legal libraries elsewhere but refuse to accept restrictive client software.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: What Empirical Research Actually Says */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <BarChart3 size={15} />
              <span>Empirical Science</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              What empirical economic studies found
            </h2>
          </div>

          <p>
            This isn't just theoretical speculation; it has been measured by large-scale empirical studies.
          </p>

          <p>
            In 2015, the <strong className="text-white">European Commission</strong> commissioned Dutch economic research firm <em>Ecorys</em> to conduct a massive 307-page econometric analysis titled <em>“Estimating displacement rates of copyrighted content in the EU.”</em>
          </p>

          <p>
            While the study found clear displacement in blockbuster films (where unauthorized viewing displaced legitimate box office and rental revenue by an estimated 5% to 20%), its findings on video games stunned industry observers:
          </p>

          {/* EU Commission Study Callout */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-3 my-6 font-mono text-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs">
              <CheckCircle2 size={16} />
              <span>Key Findings: Video Game Displacement (Ecorys / EU Commission)</span>
            </div>
            <p className="text-zinc-300 font-sans text-base">
              The researchers found <strong>no statistically robust evidence</strong> that video game piracy had a net negative displacement rate on overall industry sales.
            </p>
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 space-y-2 text-xs">
              <div className="text-amber-300 font-bold">The Complementarity Effect:</div>
              <p className="text-zinc-400 font-sans">
                For video games, the estimated effect was actually positive (+24%), driven by <strong>trial-sampling</strong> and <strong>network engagement</strong>: players who pirated a game frequently ended up purchasing the full title later, buying in-game expansions, or convincing friends in their multiplayer group to buy legitimate retail copies.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 04: The Indie vs AAA Reality */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Scale size={15} />
              <span>Market Asymmetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why independent developers suffer while AAA conglomerates exaggerate
            </h2>
          </div>

          <p>
            While aggregate macro statistics show low net displacement for the overall industry, the <strong className="text-white">distribution of harm is profoundly unequal</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-mono text-xs">
            
            <div className="p-5 rounded-xl bg-zinc-900 border border-rose-500/30 space-y-2">
              <span className="text-rose-400 font-bold uppercase block text-sm">
                The Independent Studio ($15 – $30)
              </span>
              <p className="text-zinc-300 font-sans">
                A 3-person team with a 6-month cash runway relies entirely on single-player upfront sales. They lack live-service microtransactions, console hardware bundles, or massive merchandising. When 50,000 PC copies are pirated, even a modest 8% true displacement represents 4,000 lost sales ($80,000)—which can literally bankrupt the studio.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-zinc-900 border border-cyan-500/30 space-y-2">
              <span className="text-cyan-400 font-bold uppercase block text-sm">
                The AAA Publisher ($70 + Live Service)
              </span>
              <p className="text-zinc-300 font-sans">
                A conglomerate with a $200M marketing budget, exclusive platform deals, PlayStation/Xbox console moats (where piracy is negligible), and ongoing season passes. Crying that 1 million PC downloads equaled a $70M direct loss is an accounting fiction used in executive press conferences.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 05: The Real Loss Math */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sliders size={15} />
              <span>The Realistic Formula</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              What the real loss calculation actually looks like
            </h2>
          </div>

          <p>
            If a studio genuinely wants to understand the economic impact of 1,000,000 downloads, the formula is not multiplication. It is a multi-stage econometric pipeline:
          </p>

          {/* True Formula Box */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4 my-6">
            <div className="font-mono text-xs text-amber-400 uppercase tracking-wider">
              The Real Revenue Loss Equation
            </div>
            
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs sm:text-sm text-zinc-200 overflow-x-auto">
              <code>
                Real Loss = (Total Pirates × Sr × Net Retail Price) - (Trial Conversions × Full Value) - (Network Effects on Paid Sales)
              </code>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-400 pt-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Total Downloads:</span>
                <span className="text-white">1,000,000</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Realistic Substitution Rate (Sr):</span>
                <span className="text-amber-400 font-bold">10% (100,000 would-be buyers)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Net Developer Take (after 30% Steam/Store cut):</span>
                <span className="text-white">$49 per copy ($70 × 0.70)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Gross Displaced Revenue:</span>
                <span className="text-rose-400 font-bold">-$4,900,000</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Later Trial-to-Buy Purchases (50,000 @ $49 net):</span>
                <span className="text-emerald-400 font-bold">+$2,450,000</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-sm font-bold text-white">
                <span>Actual Net Financial Impact:</span>
                <span className="text-amber-300">~$2.45M (Not $70 Million)</span>
              </div>
            </div>
          </div>

          <p>
            Notice the magnitude difference: <strong className="text-white">$2.45 million</strong> versus <strong className="text-white">$70 million</strong>. That is a <strong className="text-amber-400">96.5% reduction</strong> from the alarmist headline math.
          </p>

          <p>
            $2.45 million is still real money, and it still matters to developers. But framing it as $70 million creates bad public policy, fuels anti-consumer DRM that harms paying customers, and completely obscures the real economic solutions.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 06: Product Strategy Solutions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Sparkles size={15} />
              <span>Commercial Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              How smart studios actually capture unauthorized demand
            </h2>
          </div>

          <p>
            Once publishers accept that piracy is predominantly an access, pricing, and friction problem, the response shifts from aggressive lawsuits and performance-degrading DRM to smart product design:
          </p>

          <div className="space-y-3 my-6 font-mono text-xs sm:text-sm">
            
            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-1">
              <span className="text-emerald-400 font-bold block">1. Aggressive Purchasing Power Parity (Regional Pricing)</span>
              <p className="text-zinc-300 font-sans">
                Valve’s Steam revolutionized Eastern Europe and South America not by filing lawsuits, but by offering games in local currencies at prices aligned with local median wages. When a game costs the price of a lunch rather than a week of groceries, conversion rates skyrocket.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-1">
              <span className="text-emerald-400 font-bold block">2. Playable Demos & Free Trial Weekends</span>
              <p className="text-zinc-300 font-sans">
                Steam Next Fest proved that providing high-quality official demos eliminates the "hardware verification" motivation for unauthorized downloads, accelerating wishlist additions and day-one conversions.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-1">
              <span className="text-emerald-400 font-bold block">3. Removing Friction (GOG & Zero-DRM Trust)</span>
              <p className="text-zinc-300 font-sans">
                CD Projekt Red launched <em>The Witcher 3</em> and <em>Cyberpunk 2077</em> with zero DRM on GOG and Steam on day one. Both titles achieved historic commercial profitability because the legal version offered cloud saves, automatic patches, and zero invasive anti-cheat overhead.
              </p>
            </div>

          </div>

          {/* Summary Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Bottom Line
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-emerald-300 leading-snug">
              Every download is a person engaging with your creation—not a stolen credit card swipe.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Simplistic 1:1 headline math treats human consumers as static revenue calculators. When developers treat piracy as a data signal regarding accessibility, regional pricing, and product trust, they build sustainable commercial ecosystems that turn casual downloaders into lifelong paying fans.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="piracy-economics-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Economic Research & Documented Studies</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>European Commission / Ecorys (2015): <em>Estimating Displacement Rates of Copyrighted Content in the EU</em> (307-page econometric study).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>World Bank & IMF Purchasing Power Parity (PPP) Indicators & Steam Regional Pricing Matrix Analyses.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Game Developers Conference (GDC) State of the Game Industry Surveys on DRM Impact and PC Optimization.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Harvard Business Review & Journal of Cultural Economics: <em>Digital Sampling, Word-of-Mouth, and Software Conversion Rates</em>.</span>
            </li>
          </ul>
        </div>

        {/* Related Research Articles */}
        <div className="mt-16 border-t border-white/10 pt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white tracking-tight">
              Related Research & Analyses
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
export default PiracyEconomicsArticlePage;
