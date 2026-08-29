import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Gamepad2, 
  Sparkles, 
  TrendingDown, 
  DownloadCloud, 
  Clock3, 
  ShieldCheck, 
  Gift, 
  AlertOctagon, 
  Layers, 
  HelpCircle,
  PackageCheck,
  Disc,
  Flame,
  CheckCircle2,
  XCircle,
  DollarSign
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const PreordersGamingArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'are-pre-orders-really-killing-gaming-or-are-gamers-arguing-about-the-wrong-thing'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'are-pre-orders-really-killing-gaming-or-are-gamers-arguing-about-the-wrong-thing'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "Are Pre-Orders Really Killing Gaming — or Are Gamers Arguing About the Wrong Thing? | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Pre-orders are often blamed for broken launches and gaming's 'enshittification.' But are customers really rewarding bad games, or are they buying for preload, bonuses, physical scarcity, spoilers, trust, and day-one access?"
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Are Pre-Orders Really Killing Gaming — or Are Gamers Arguing About the Wrong Thing?",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article URL copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-400/20 selection:text-amber-200">
      {/* Ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
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

        {/* Header Badges & Main Title */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-medium tracking-wide">
              Gaming Industry & Consumer Economics
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
              Market Investigation
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            Are Pre-Orders Really Killing Gaming — or Are Gamers Arguing About the Wrong Thing?
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            Pre-orders are frequently blamed for buggy launches, unfinished releases, and the broader “enshittification” of the video game industry. But are millions of consumers actually making bad, reckless bets—or does the standard "Never Pre-Order" sermon completely misunderstand why people buy early?
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              10 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Gamepad2 size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="preorders-gaming-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is no sermon more repeated in gaming enthusiast forums than the three-word commandment:
          </p>

          <blockquote className="border-l-4 border-amber-500/80 pl-4 py-3 my-4 text-amber-300 font-mono text-xl sm:text-2xl font-black bg-zinc-900/60 rounded-r-lg">
            “Remember: No Pre-Orders.”
          </blockquote>

          <p>
            The logic sounds airtight on the surface:
          </p>

          <p>
            Why give a multi-billion-dollar publisher your hard-earned money months before you know if the software actually runs? Wait for technical benchmarks. Wait for day-one review embargos to lift. Wait for Digital Foundry frame-rate breakdowns. Protect your wallet, and starve corporate executives of unearned upfront revenue.
          </p>

          <p>
            According to the popular narrative, gamers who pre-order are actively complicit in the industry’s decline. By guaranteeing financial success before delivery, they disincentivize publishers from polishing games, paving the way for broken day-one launches like <em>Cyberpunk 2077</em>, <em>Battlefield 2042</em>, or <em>Redfall</em>.
          </p>

          <p>
            Furthermore, critics point out a historical anachronism: pre-orders were originally invented in the 1990s to secure scarce physical cartridges at local GameStop stores. Why pre-order a digital file that has infinite supply and literally cannot run out?
          </p>

          <p className="text-xl font-display font-bold text-white">
            It is a tidy, persuasive argument. But it rests on a fatal premise:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 font-mono text-center my-6 space-y-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400">It assumes everyone who pre-orders is making the same decision for the same reason.</div>
            <p className="text-xs text-zinc-400 m-0">In reality, consumers are solving for a diverse spectrum of friction points, bandwidth limits, and psychological value.</p>
          </div>

          <p>
            When you examine actual player behavior across millions of digital purchases, the debate shifts. The question is not simply whether pre-orders are "good or bad"—it is: <strong>What utility are players actually paying for?</strong>
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Flawed Causal Chain */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <TrendingDown size={15} />
              <span>Economic Mechanics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Flawed Theory of Pre-Order Causality
            </h2>
          </div>

          <p>
            The anti-preorder critique typically presents a direct causal sequence:
          </p>

          {/* Causal Sequence Flow */}
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10 font-mono text-xs sm:text-sm my-6 space-y-3">
            <div className="text-zinc-400 uppercase text-xs font-bold border-b border-white/10 pb-2">The Standard Enthusiast Model:</div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 text-zinc-300">
              <span className="p-2.5 rounded bg-zinc-800 border border-white/10 text-white w-full sm:w-auto text-center font-bold">1. Consumer Pre-Orders</span>
              <span className="text-amber-400 font-bold hidden sm:inline">→</span>
              <span className="p-2.5 rounded bg-zinc-800 border border-white/10 text-rose-300 w-full sm:w-auto text-center font-bold">2. Guaranteed Publisher Cash</span>
              <span className="text-amber-400 font-bold hidden sm:inline">→</span>
              <span className="p-2.5 rounded bg-zinc-800 border border-white/10 text-amber-300 w-full sm:w-auto text-center font-bold">3. QA & Polish Cut</span>
              <span className="text-amber-400 font-bold hidden sm:inline">→</span>
              <span className="p-2.5 rounded bg-zinc-800 border border-white/10 text-rose-400 w-full sm:w-auto text-center font-bold">4. Broken Day-One Launch</span>
            </div>

            <p className="text-xs text-zinc-400 pt-2 font-sans">
              This model assumes software engineers and producers deliberately slack off because pre-order metrics hit a green target on a slide deck.
            </p>
          </div>

          <p>
            In the reality of enterprise game development, this is rarely how production failures occur. Games launch broken primarily due to:
          </p>

          <ul className="space-y-2 list-disc pl-6 text-sm text-zinc-300">
            <li><strong>Fiscal Year Deadlines:</strong> Publicly traded holding companies (EA, Ubisoft, Warner Bros) forcing hard release dates to book revenue in specific financial quarters.</li>
            <li><strong>The "Day-One Patch" Fallacy:</strong> Mismanagement relying on post-launch updates rather than mastering a finished golden disc build.</li>
            <li><strong>Massive Hardware Permutations:</strong> Optimizing modern graphics pipelines across thousands of PC GPU/CPU combinations and multiple console generations simultaneously.</li>
          </ul>

          <p>
            Publishers do not look at high pre-orders and say, <em>"Great, stop fixing bugs."</em> If anything, massive pre-order velocity increases executive scrutiny because catastrophic launches trigger immediate mass refunds, cratering stock valuations, and long-term brand destruction.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Why Gamers Actually Pre-Order */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Layers size={15} />
              <span>Consumer Calculus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The 7 Real Reasons People Pre-Order Games
            </h2>
          </div>

          <p>
            If digital stock is infinite, why do tens of millions of rational consumers click the pre-order button every year? It turns out they are buying solutions to very real friction:
          </p>

          {/* Grid of 7 reasons */}
          <div className="space-y-4 my-6">
            
            {/* Reason 1 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                  <DownloadCloud size={16} />
                  <span>1. The 150GB Preload Problem (Bandwidth Realities)</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Practical Utility</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Modern AAA blockbusters easily exceed 120GB to 180GB. For players without gigabit fiber internet (or those with strict data caps), downloading on launch day means missing the entire opening weekend. Preloading 48 hours in advance guarantees they can play the exact second servers unlock.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                  <Clock3 size={16} />
                  <span>2. Midnight Launch Ritual & Event Gaming</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Cultural Utility</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                Major releases—like a new <em>Grand Theft Auto</em>, <em>Elden Ring</em> expansion, or <em>Monster Hunter</em>—are cultural moments. Joining Discord calls with friends at 12:01 AM to experience the opening hours together has intangible experiential value that waiting 3 weeks for a patch simply cannot match.
              </p>
            </div>

            {/* Reason 3 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                  <AlertOctagon size={16} />
                  <span>3. Spoiler Immunity in Story-Driven Games</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Narrative Protection</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                In an era where YouTube thumbnails, TikTok algorithms, and Twitter feeds reveal major plot twists within 6 hours of launch, waiting for price drops or patches ruins the virgin narrative experience of titles like <em>Final Fantasy</em>, <em>The Last of Us</em>, or <em>God of War</em>.
              </p>
            </div>

            {/* Reason 4 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                  <Disc size={16} />
                  <span>4. Physical Collector Scarcity Still Exists</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">Physical Reality</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                While digital bytes are infinite, physical steelbooks, collector’s statues, art books, and limited print-run physical editions (from publishers like Limited Run Games) sell out in minutes. For collectors, pre-ordering is the only way to avoid 300% eBay scalper markups.
              </p>
            </div>

            {/* Reason 5 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                  <ShieldCheck size={16} />
                  <span>5. Earned Studio Trust & Franchise Loyalty</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Reputation</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                When a player pre-orders a game from FromSoftware, Nintendo EPD, Larian Studios, or Remedy, they are not taking a blind gamble. They are rewarding a decade-long track record of exceptional craftsmanship and expressing vote-of-confidence support.
              </p>
            </div>

            {/* Reason 6 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                  <Gift size={16} />
                  <span>6. Pre-Order Discounts & Exclusive Cosmetics</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">Incentive Hooks</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                On PC platforms (GreenManGaming, Fanatical, Steam), pre-orders frequently come with a 15% to 20% discount, early beta access weekends, or exclusive soundtrack downloads. For players who know they will buy the game anyway, securing the discount is pure financial optimization.
              </p>
            </div>

            {/* Reason 7 */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-sm">
                  <Sparkles size={16} />
                  <span>7. Anticipatory Joy: The Psychology of Waiting</span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Behavioral Economics</span>
              </div>
              <p className="text-sm text-zinc-300 font-sans">
                In behavioral economics, "anticipatory utility" describes the pleasure derived from looking forward to an upcoming event. Seeing the game sitting preloaded in your Steam library creates months of positive anticipation that is part of the hobby’s emotional reward.
              </p>
            </div>

          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Modern Safety Net */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <DollarSign size={15} />
              <span>Risk Mitigation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Digital Safety Net: Steam's 2-Hour Refund Revolution
            </h2>
          </div>

          <p>
            The biggest change in the pre-order landscape over the last decade is the death of the "non-refundable trap."
          </p>

          <p>
            On Steam, Xbox, and PlayStation (under specific conditions), pre-ordering carries virtually zero irreversible risk:
          </p>

          {/* Refund Box */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 font-mono text-xs sm:text-sm space-y-3 my-6">
            <div className="text-emerald-400 font-bold uppercase flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>The Steam 2-Hour / 14-Day Refund Rule</span>
            </div>
            <p className="text-zinc-300 font-sans text-xs">
              A player can pre-order, preload 150GB, launch at midnight, and play for up to 119 minutes. If the port stutters, crashes, or fails to live up to expectations, they can click "Request Refund" and get 100% of their money back into their wallet in under two hours with no questions asked.
            </p>
          </div>

          <p>
            When returns are frictionless, a pre-order is no longer an irrevocable blank check written to a publisher—it is simply a convenient reservation with a built-in test drive.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 04: What Gamers Should Actually Fight Against */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Flame size={15} />
              <span>The Real Issues</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              What Gamers Should Actually Be Angry About
            </h2>
          </div>

          <p>
            Shaming fellow gamers for clicking a pre-order button diverts community energy away from the predatory industry practices that genuinely harm the medium:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase">Predatory Early Access Tiers</span>
              <p className="text-zinc-300 font-sans text-xs">
                Charging $30 to $40 extra for "3-Day Early Access Deluxe Editions"—artificially holding back the standard launch date to weaponize FOMO.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase">Review Embargo Deception</span>
              <p className="text-zinc-300 font-sans text-xs">
                Withholding review codes until the literal minute of launch to prevent consumers from learning about catastrophic console performance issues.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase">Always-Online Single-Player DRM</span>
              <p className="text-zinc-300 font-sans text-xs">
                Forcing single-player campaigns to tether to authentication servers that will inevitably be shut down a decade later, rendering the purchase useless.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-rose-400 font-bold uppercase">Post-Launch Microtransaction Bait-and-Switch</span>
              <p className="text-zinc-300 font-sans text-xs">
                Waiting until reviews are published before stealth-patching aggressive battle passes and pay-to-win microtransactions into the game.
              </p>
            </div>
          </div>

          {/* Strategic Conclusion */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Bottom Line
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Pre-ordering isn't a moral failure; it's a consumer trade-off.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Blaming consumers for broken launches is like blaming drivers for potholes. The solution is not collective moral purity—it is enforcing robust consumer refund laws, supporting transparent review ecosystems, and demanding technical accountability from publishers. Pre-order if the preload and midnight launch matter to you; wait for reviews if risk mitigation is your priority. Just don't confuse a personal logistical preference with an industry crusade.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="preorders-gaming-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Citations & Research */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Market Research & Industry Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>GDC & Industry Post-Mortems: Digital Pre-Orders vs Day-One Server Capacity and Monetization Forecasts.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Steam Consumer Data: Pre-Order Conversion, Preloading Retention, and Refund Velocity (Steamworks Insights).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Game Developer & Polygon Investigations: The Shifting Purpose of Pre-Orders from Physical Cartridge Scarcity to Early Access Hype.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Behavioral Economics in Video Game Distribution & Anticipatory Utility (Journal of Consumer Culture).</span>
            </li>
          </ul>
        </div>

        {/* Related Articles */}
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
export default PreordersGamingArticlePage;
