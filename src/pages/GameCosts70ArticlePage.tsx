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
  Globe2, 
  TrendingDown, 
  TrendingUp, 
  Gamepad2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Coins,
  Percent,
  Receipt
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const GameCosts70ArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'the-game-costs-70-the-problem-is-that-70-doesnt-mean-the-same-thing-to-everyone'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'the-game-costs-70-the-problem-is-that-70-doesnt-mean-the-same-thing-to-everyone'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "The Game Costs $70. The Problem Is That $70 Doesn't Mean the Same Thing to Everyone. | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Are modern AAA games genuinely too expensive, or are gamers forgetting how expensive games were in the past? A deep investigation into inflation, regional pricing, wages, game length, sales, DLC, microtransactions, unfinished launches, and why a $70 game can be cheap to one player and impossibly expensive to another."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "The Game Costs $70. The Problem Is That $70 Doesn't Mean the Same Thing to Everyone.",
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
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
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
              Video Game Economics & Consumer Markets
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
              Purchasing Power Parity Audit
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            The Game Costs $70. The Problem Is That $70 Doesn’t Mean the Same Thing to Everyone.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            Are modern AAA games genuinely overpriced, or have gamers forgotten the steep cartridge costs of the 1990s? A deep macroeconomic investigation into inflation, regional currency collapses, wage stagnation, game length, microtransactions, and why a single sticker price represents entirely different realities around the world.
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm font-mono text-zinc-400 pt-2 border-b border-white/10 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-400" />
              August 28, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              14 min read
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Bot size={14} className="text-amber-400" />
              By CodeFuser Tech & Media Research
            </span>
          </div>
        </div>

        {/* AdSense Top Placement */}
        <AdSenseSlot slotId="game-costs-70-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            A new standard video game costs $70 USD.
          </p>

          <p>
            Depending on your country, local sales tax, exchange rate fluctuations, and digital storefront edition, it might be C$100 in Canada, £70 in the United Kingdom, €80 in Germany, R$350 in Brazil, or E£3,500 in Egypt.
          </p>

          {/* Perspective Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-emerald-400 font-bold uppercase">Player A (Software Engineer in California)</div>
              <p className="text-zinc-300 font-sans text-xs">
                "$70 for an 80-hour RPG is less than $1 per hour of entertainment. Going to a movie costs $25 for 2 hours. Gaming is ridiculously cheap."
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-rose-400 font-bold uppercase">Player B (University Graduate in Brazil)</div>
              <p className="text-zinc-300 font-sans text-xs">
                "R$350 represents nearly 25% of the national monthly minimum wage. One game equals two weeks of groceries. It's a luxury commodity."
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase">Player C (Patient Gamer)</div>
              <p className="text-zinc-300 font-sans text-xs">
                "Why pay $70 to beta test a broken launch when I can pay $25 one year later for the patched Game of the Year edition with all DLC included?"
              </p>
            </div>

            <div className="p-4 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-blue-400 font-bold uppercase">Player D (Industry Veteran)</div>
              <p className="text-zinc-300 font-sans text-xs">
                "In 1994, <em>Chrono Trigger</em> cost $79.99 on the SNES, which is over $160 in today's money. Modern games have resisted inflation for 20 years."
              </p>
            </div>
          </div>

          <p className="text-xl font-display font-bold text-white">
            Who is right? The answer is: every single one of them.
          </p>

          <p>
            The debate over video game pricing is broken because participants treat <strong>price</strong> as a static moral question rather than a dynamic relationship between <strong>sticker cost</strong> and <strong>purchasing power parity (PPP)</strong>.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Inflation Defense */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <TrendingUp size={15} />
              <span>Historical Perspective</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Inflation Defense: Why Games Were Once More Expensive
            </h2>
          </div>

          <p>
            From a pure macroeconomic accounting standpoint, video games have long been one of the few consumer technology goods that actively defied inflation:
          </p>

          {/* Historical Price Chart */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 font-mono text-xs sm:text-sm my-6">
            <div className="text-amber-400 font-bold uppercase">Historical Pricing Adjusted to 2026 USD:</div>
            <div className="space-y-2 text-zinc-300 font-sans text-xs">
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>1992: Street Fighter II (SNES Cartridge — $74.99 MSRP)</span>
                <span className="font-mono text-rose-400 font-bold">~$168.00 in 2026</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>1998: The Legend of Zelda: Ocarina of Time (N64 — $59.99 MSRP)</span>
                <span className="font-mono text-amber-400 font-bold">~$115.00 in 2026</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>2005: Call of Duty 2 (Xbox 360 Era — $59.99 MSRP)</span>
                <span className="font-mono text-blue-400 font-bold">~$96.00 in 2026</span>
              </div>
              <div className="p-3 bg-zinc-950 rounded-lg flex items-center justify-between">
                <span>2026: Modern AAA Release (PS5 / PC — $69.99 MSRP)</span>
                <span className="font-mono text-emerald-400 font-bold">$70.00 Current</span>
              </div>
            </div>
          </div>

          <p>
            For almost two decades (2005–2020), games remained locked at the $59.99 price point while development team sizes exploded from 50 to 500+ engineers and production budgets skyrocketed from $20 million to over $250 million.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: Why It Still Feels More Expensive */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Receipt size={15} />
              <span>Consumer Friction</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Why Consumers Reject the Inflation Defense
            </h2>
          </div>

          <p>
            If games are mathematically cheaper than in 1995, why is consumer backlash so ferocious? Four structural factors explain the disconnect:
          </p>

          {/* 4 Structural Reasons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-rose-400 font-bold uppercase">1. Real Wage & Cost of Living Pressure</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Inflation hasn't just touched games; it has consumed housing, food, energy, and healthcare. Discretionary recreation budgets have shrunk rapidly for young adults and working-class families.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-amber-400 font-bold uppercase">2. The "Unfinished Launch" Tax</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                In 1995, a cartridge was complete on day one. In 2026, $70 buys a buggy initial build plagued by day-one patches, server queues, performance stutter, and missing roadmap features.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-blue-400 font-bold uppercase">3. Layered In-Game Monetization</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Players tolerate $70 for complete experiences, but rebel when a full-price title aggressively advertises Battle Passes, $20 skins, Deluxe Early Access editions, and paid season passes on the main menu.
              </p>
            </div>

            <div className="p-5 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="text-emerald-400 font-bold uppercase">4. The Abundance Alternative</div>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                Gamers aren't trapped with only 3 games per year. With Xbox Game Pass, PlayStation Plus, Humble Bundles, free-to-play giants (Fortnite, Valorant), and massive Steam sales, $70 must compete against infinite cheap entertainment.
              </p>
            </div>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The Regional Pricing Collapse */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Globe2 size={15} />
              <span>International Disparity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Regional Pricing Crisis: When $70 Destroys a Market
            </h2>
          </div>

          <p>
            The harshest impact of the $70 transition occurred in developing markets. For years, digital storefronts like Steam used localized regional pricing (offering games at 50–70% discounts in Argentina, Turkey, India, and Brazil to match local wage realities).
          </p>

          <p>
            However, when Western users began exploiting VPNs to purchase keys in cheap regions, publishers and platforms clamped down—dollarizing store currencies or hiking regional prices to near-US parity.
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 font-mono text-xs sm:text-sm my-6 space-y-3">
            <div className="text-amber-400 font-bold uppercase">The Affordability Index (Hours of Minimum Wage Labor for 1 AAA Game):</div>
            <div className="space-y-2 text-zinc-300 font-sans">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>United States (Federal Minimum Wage):</span>
                <span className="font-mono text-emerald-400 font-bold">~9.6 Hours</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Germany / United Kingdom:</span>
                <span className="font-mono text-emerald-400 font-bold">~6.5 Hours</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span>Brazil / Colombia:</span>
                <span className="font-mono text-amber-400 font-bold">~45–55 Hours</span>
              </div>
              <div className="flex justify-between">
                <span>Egypt / Turkey:</span>
                <span className="font-mono text-rose-400 font-bold">~70–90+ Hours (Over 2 Weeks of Full-Time Labor)</span>
              </div>
            </div>
          </div>

          <p>
            When a single video game demands two weeks of full-time labor, legal consumption becomes economically impossible. At that point, piracy or complete market exclusion is the inevitable consequence.
          </p>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Economic Reality
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              Affordability is never about the number on the price tag; it is about the share of human life required to earn it.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              $70 can be both an extraordinary value proposition for an affluent gamer seeking 100 hours of escapism and an absurdly tone-deaf barrier for international players living under severe currency depreciation. As long as publishers enforce uniform global pricing without respecting purchasing power elasticity, the perception of greed and consumer resentment will only continue to intensify.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="game-costs-70-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Economic & Industry Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Bureau of Labor Statistics (BLS) Consumer Price Index (CPI) Inflation & Entertainment Category Data (1990–2026).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Steam Regional Pricing Guidelines & Valve Purchasing Power Parity Index (2022–2026).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Newzoo Global Games Market Report: Discretionary Spending and Regional Revenue Distribution.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Game Developers Conference (GDC) State of the Industry: Production Budgets, Pricing Models, and Post-Launch Monetization.</span>
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
export default GameCosts70ArticlePage;
