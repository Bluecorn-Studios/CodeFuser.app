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
  HardDrive, 
  Copy, 
  Split, 
  Building2, 
  User, 
  CheckCircle2, 
  XCircle,
  Globe2,
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const WhatDidYouTakeArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'you-didnt-steal-the-game-so-what-did-you-take'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'you-didnt-steal-the-game-so-what-did-you-take'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "You Didn't Steal the Game. So What Did You Take? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "If piracy doesn't remove the original file, is it really theft? A deep look at the difference between physical theft and digital copying, lost sales, copyright, affordability, preservation, regional pricing, and why “illegal” and “immoral” are not always the same question."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "You Didn't Steal the Game. So What Did You Take?",
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
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
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
              Digital Economics & Property Philosophy
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
              The Rivalrous vs Non-Rivalrous Divide
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            You Didn’t Steal the Game. So What Did You Take?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            When you download an unauthorized digital copy, nothing disappears from the developer’s hard drive, no warehouse inventory drops, and the Steam store remains completely intact. If no physical asset was removed, why do we call it theft—and what exactly is being taken?
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              13 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Bot size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="what-did-you-take-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            You download a game.
          </p>

          <p>
            The developer still has the master files. The publisher still has the source repository. The Steam store still sells the game to anyone with a valid credit card.
          </p>

          <p>
            Nothing was physically removed from a warehouse pallet. No police car pulled up to an empty shelf. No one lost the ability to play their own copy.
          </p>

          <p>
            And yet the word <strong>“theft”</strong> instantly dominates every legal, corporate, and moral debate surrounding the act.
          </p>

          <p className="text-xl font-display font-bold text-white">
            So here is the fundamental question: If you didn’t take the physical game, what exactly did you take?
          </p>

          <p>
            That sounds like a semantic trick until you examine how digital goods operate under physics, economics, and jurisprudence.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: Physical Theft vs Digital Replication */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Split size={15} />
              <span>Economic Physics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Physical Theft and Digital Copying: The Mechanics of Deprivation
            </h2>
          </div>

          <p>
            In the physical world, property is governed by the laws of <strong>scarcity and rivalry</strong>:
          </p>

          {/* Comparative Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase flex items-center gap-2">
                <PackageCheck size={16} /> Physical Theft (Rivalrous Good)
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Someone owns a car or a printed book. You steal it. Now you have it, and <strong>they are deprived of it</strong>. The owner cannot drive to work or read the pages. The economic loss is direct, tangible, and absolute.
              </p>
              <div className="text-rose-400 font-mono text-xs">State: A + B = 1 (Zero-Sum Transfer)</div>
            </div>

            <div className="p-5 bg-zinc-900 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                <Copy size={16} /> Digital Copying (Non-Rivalrous Good)
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                A software program consists of digital bitstrings (1s and 0s). Downloading it does not delete or degrade the source. It <strong>clones the data structure</strong> into local memory without removing it from the creator.
              </p>
              <div className="text-emerald-400 font-mono text-xs">State: A → A + B (Non-Zero-Sum Multiplication)</div>
            </div>
          </div>

          <p>
            This distinction is not a modern internet loophole; it was formalized in landmark jurisprudence decades ago. In <em>Dowling v. United States (1985)</em>, the <strong>US Supreme Court</strong> explicitly ruled:
          </p>

          <blockquote className="p-4 rounded-xl bg-zinc-900/80 border-l-4 border-amber-400 text-sm italic text-zinc-300 font-sans my-4">
            “The interference with copyright does not easily equate with theft, conversion, or fraud. The infringer of a copyright does not assume physical control over the copyright; nor does he wholly deprive its owner of its use.”
          </blockquote>

          <hr className="border-white/10 my-10" />

          {/* Section 02: What Was Actually Taken */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Scale size={15} />
              <span>Deconstructing Harm</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              If Not the File, What Did You Take?
            </h2>
          </div>

          <p>
            If physical deprivation did not occur, what did the unauthorized downloader actually extract from the creator? Economists and legal theorists identify four distinct assets:
          </p>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>1. The Exclusive Monopoly Right</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                You took the creator's statutory right to control who accesses the work and under what contractual conditions. Copyright is an artificial legal monopoly granted to incentivize creative labor.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>2. The Probability of a Sale</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                If you had disposable income and intended to buy the title, pirating it takes the potential revenue that was supposed to amortize the development studio’s production budget.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>3. The Compensation for Risk & Labor</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Developers spend 3 to 7 years taking catastrophic financial risk. Consuming the fruit of that uncompensated labor without contribution creates a free-rider imbalance.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                <span>4. The Developer's Autonomy</span>
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                An artist has the ethical prerogative to set the terms of engagement with their creation—whether that means charging $20, attaching terms of service, or restricting distribution.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The "Lost Sale" Fallacy */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <DollarSign size={15} />
              <span>Economic Realities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The "1 Download = 1 Lost Sale" Fallacy
            </h2>
          </div>

          <p>
            For decades, anti-piracy trade groups (such as the ESA and MPAA) calculated piracy damages with a mathematical absurdity: multiplying total unauthorized downloads by the retail price ($70 × 1,000,000 = $70,000,000 in "stolen revenue").
          </p>

          <p>
            Economic reality is far more nuanced. In an exhaustive 300-page empirical investigation commissioned by the <strong>European Commission (Ecorys Report)</strong>:
          </p>

          {/* Key Metric Card */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 my-6 space-y-3 font-mono text-xs sm:text-sm">
            <div className="text-amber-400 font-bold uppercase">The Ecorys Findings on Video Game Piracy:</div>
            <p className="text-zinc-300 font-sans leading-relaxed">
              For every 100 pirated games, the net displacement rate was calculated to be negligible or statistically insignificant for major categories. Many users who pirate are students, teenagers, or residents of low-income economies who possessed <strong>zero purchasing capacity</strong>.
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg text-emerald-300 text-xs font-mono">
              Formula: Non-purchasers + Non-available markets ≠ Displaced Cashflow
            </div>
          </div>

          <p>
            If a player in an emerging market earning $200 a month downloads a $70 game that they could never afford under any circumstance, the publisher lost <strong>$0.00</strong> in real revenue. No transaction was displaced.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: Regional Disparities & Indie Fragility */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Globe2 size={15} />
              <span>Contextual Asymmetries</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Purchasing Power Parity vs. Independent Studio Fragility
            </h2>
          </div>

          <p>
            The moral implications of copying change radically depending on the economic context of both the buyer and the creator:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <div className="text-amber-300 font-bold uppercase flex items-center gap-2">
                <Globe2 size={16} /> Regional Pricing Failure (PPP)
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                In countries like Argentina, Turkey, or Brazil, a single video game can cost 15% to 30% of a monthly minimum wage due to dollarized Steam storefronts. For players in these regions, piracy is not greed; it is the only conduit to global digital culture.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase flex items-center gap-2">
                <User size={16} /> The Independent Studio Fragility
              </div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                While a mega-corporation can absorb casual piracy as ambient background friction, an independent development studio with 3 people lives on razor-thin margins. Pirating an indie game in a wealthy country directly threatens whether those creators can pay rent.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Definitive Takeaway
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Piracy isn’t physical theft—it is the circumvention of an artificial commercial border.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Calling digital copying "theft" obscures the real conversation. You didn't take a physical game from a shelf; you copied bit patterns. But in doing so, you bypassed the social and economic contract that allows creators to survive. Whether that bypass is a harmless cultural rescue (in the case of abandonware and unaffordable markets) or an ungenerous free-rider exploitation (in the case of solvent consumers pirating indie art) depends not on the law, but on the ethics of the participant.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="what-did-you-take-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Jurisprudence & Economic Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>US Supreme Court: Dowling v. United States, 473 U.S. 207 (1985) — Legal Distinction Between Physical Theft and Copyright Infringement.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>European Commission: "Estimating Displacement Rates of Intellectual Property Infringement in the EU" (Ecorys Study).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Journal of Political Economy: "Non-Rival Goods, Zero Marginal Cost, and the Economics of Digital Redistribution."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Game Developers Conference (GDC) State of the Industry: Pricing Elasticity, Regional Markets, and Indie Monetization.</span>
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
export default WhatDidYouTakeArticlePage;
