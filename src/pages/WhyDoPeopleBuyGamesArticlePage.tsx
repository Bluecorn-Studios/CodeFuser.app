import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  ChevronRight, 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Cloud, 
  Gamepad2, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Trophy, 
  RefreshCw, 
  HardDrive, 
  Lock, 
  Layers, 
  HeartHandshake
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogPosts';
import { AdSenseSlot } from '../components/ads/AdSenseSlot';

interface ArticlePageProps {
  onNavigate?: (path: string) => void;
}

export const WhyDoPeopleBuyGamesArticlePage: React.FC<ArticlePageProps> = ({ onNavigate }) => {
  const currentArticle = BLOG_POSTS.find(
    (p) => p.slug === 'why-do-people-buy-games-instead-of-pirating'
  );

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.slug !== 'why-do-people-buy-games-instead-of-pirating'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = "You Don't Buy Games Because They're Cheap. You Buy Them Because They're Worth Keeping. | CodeFuser Journal";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        "Why do people who can pirate games still choose to buy them? A deep look at convenience, ownership, achievements, cloud saves, updates, malware risk, developer support, nostalgia, sales, demos, regional access, and the surprisingly powerful feeling of finishing something you paid for."
      );
    }
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "You Don't Buy Games Because They're Cheap. You Buy Them Because They're Worth Keeping.",
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
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
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
              Digital Consumer Behavior & Gaming Platforms
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
              The Friction Economics Study
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-mono">
              Level 1 — Pillar
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight text-white leading-[1.15]">
            You Don’t Buy Games Because They’re Cheap. You Buy Them Because They’re Worth Keeping.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed font-sans font-normal border-l-2 border-amber-400/80 pl-4 py-1">
            Why do gamers who know how to download anything for free still choose to spend money on digital storefronts? An investigation into friction economics, cloud saves, the psychology of completion, zero-day malware vectors, and the Gabe Newell service thesis.
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
        <AdSenseSlot slotId="why-buy-games-top" format="auto" responsive={true} showDisclaimer={true} />

        {/* Article Body */}
        <div className="prose prose-invert max-w-none space-y-7 text-zinc-300 text-base sm:text-lg leading-relaxed font-sans mt-8">
          
          <p className="text-lg sm:text-xl text-white font-medium">
            There is a central question that sits quietly inside the online piracy debate:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/30 text-blue-300 font-mono text-center text-xl sm:text-2xl font-bold my-4">
            “If a game can be obtained for free, why does anyone pay for it?”
          </div>

          <p>
            At first glance, the orthodox answer sounds straightforward: <em>People pay because they have money, and people pirate because they don't.</em>
          </p>

          <p>
            Except when you actually interview adult gamers who grew up on torrent trackers, the reality is far more interesting:
          </p>

          <ul className="space-y-2 list-disc pl-6 text-zinc-300 font-sans text-sm sm:text-base">
            <li>Millions of gamers with plenty of disposable income who still know how to pirate choose to pay full price on Steam.</li>
            <li>Many gamers openly confess that while they rarely finish games they downloaded for free, they almost always finish the games they bought with their own money.</li>
            <li>A massive percentage of paying Steam users treat piracy not as a replacement for buying, but as an unpaid demo before buying.</li>
          </ul>

          <p className="text-xl font-display font-bold text-white">
            The biggest reason people buy games isn't moral virtue. It's because the legal platform removes friction from their lives.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 01: The Gabe Newell Service Thesis */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Zap size={15} />
              <span>Platform Theory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Gabe Newell Thesis: Piracy Is a Service Problem
            </h2>
          </div>

          <p>
            Valve co-founder Gabe Newell famously formulated the foundational axiom of modern digital distribution:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-amber-500/20 text-amber-200 font-sans italic text-base sm:text-lg my-4">
            “We think there is a fundamental misconception about piracy. Piracy is almost always a service problem and not a pricing problem. If a pirate offers a product anywhere in the world, 24/7, purchasable from the convenience of your personal computer, and the legal provider says the product is region-locked, will come to your country 3 months after the US release, and can only be purchased at a brick and mortar store, then the pirate’s service is more valuable.”
          </div>

          <p>
            Look at what happens when you compare the mechanical friction of legitimate platforms against unauthorized distribution:
          </p>

          {/* Friction Comparison Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 font-mono text-xs">
            <div className="p-5 bg-zinc-900 border border-emerald-500/20 rounded-xl space-y-3">
              <div className="text-emerald-400 font-bold uppercase flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>The Legitimate Steam Pipeline</span>
              </div>
              <div className="space-y-1.5 text-zinc-300 font-sans text-xs">
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>1. One-Click Purchase & Fast CDN</span>
                  <span className="text-emerald-400 font-mono">0 sec friction</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>2. Background Auto-Updates & Patches</span>
                  <span className="text-emerald-400 font-mono">Automatic</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>3. Seamless Cloud Save Sync (PC to Steam Deck)</span>
                  <span className="text-emerald-400 font-mono">Instant</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>4. Steam Workshop 1-Click Modding</span>
                  <span className="text-emerald-400 font-mono">Built-In</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>5. Malware & Ransomware Risk</span>
                  <span className="text-emerald-400 font-mono">Zero</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-zinc-900 border border-rose-500/20 rounded-xl space-y-3">
              <div className="text-rose-400 font-bold uppercase flex items-center gap-2">
                <XCircle size={16} />
                <span>The Pirated Repack Pipeline</span>
              </div>
              <div className="space-y-1.5 text-zinc-300 font-sans text-xs">
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>1. Navigating Ad-Laden Hosters & Dead Links</span>
                  <span className="text-rose-400 font-mono">High friction</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>2. Manual Update Tracking & Applying Hotfixes</span>
                  <span className="text-rose-400 font-mono">Tedious / Manual</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>3. Transferring Local Save Folders Manually</span>
                  <span className="text-rose-400 font-mono">Fragile</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>4. Unofficial Mod Compatibility Conflicts</span>
                  <span className="text-rose-400 font-mono">Frequent breakage</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded flex justify-between">
                  <span>5. Trojanized Cracks & Cryptominers</span>
                  <span className="text-rose-400 font-mono">Constant threat</span>
                </div>
              </div>
            </div>
          </div>

          <p>
            When adult players start working full-time jobs, their time becomes dramatically more valuable than $20 or $50. Paying for a game isn't an act of charity; it is paying for hours of eliminated technical friction.
          </p>

          <hr className="border-white/10 my-10" />

          {/* Section 02: The Completion Paradox */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <Trophy size={15} />
              <span>Psychological Attachment</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The Completion Paradox: Why Free Games Get Abandoned
            </h2>
          </div>

          <p>
            One of the most universal confessions among former pirates is what psychologists call the <strong>Sunk Investment & Valuation Effect</strong>:
          </p>

          <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 space-y-4 my-6">
            <p className="text-zinc-300 font-sans text-sm sm:text-base leading-relaxed">
              When you download 40 games for free in an afternoon, every individual game becomes disposable. If you get stuck on a difficult boss in minute 45, you close the window and boot up the next download without a second thought.
            </p>
            <p className="text-zinc-300 font-sans text-sm sm:text-base leading-relaxed">
              When you spend $30 of your hard-earned money on a title, you assign it cognitive weight. You give it time to develop its atmosphere. You push through difficult puzzles. You become emotionally invested, reach the credits, and create a lasting memory.
            </p>
          </div>

          <hr className="border-white/10 my-10" />

          {/* Section 03: The "Pirate First, Buy Later" Demo Economy */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
              <HeartHandshake size={15} />
              <span>Consumer Agency</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              The "Pirate First, Buy Later" Reality
            </h2>
          </div>

          <p>
            Because modern publishers rarely release playable demos and strict two-hour refund windows are often insufficient to evaluate deep 100-hour RPGs or check PC hardware stutter, millions of gamers use piracy as a self-service demo:
          </p>

          <ul className="space-y-2 list-disc pl-6 text-zinc-300 font-sans text-sm sm:text-base">
            <li><strong>Hardware Benchmarking:</strong> Testing whether an unoptimized PC port will run smoothly on specific GPU configurations before committing funds.</li>
            <li><strong>Artistic Validation:</strong> Verifying if the gameplay loop actually aligns with marketing trailers rather than corporate hype.</li>
            <li><strong>The Permanent Shelf:</strong> Once a player falls in love with a masterpiece, they buy it on Steam or GOG to secure cloud saves, track achievements, and proudly display it in their permanent digital library.</li>
          </ul>

          {/* Strategic Conclusion Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-white/10 space-y-4 my-10">
            <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              The Core Conclusion
            </h3>
            <p className="text-xl sm:text-2xl font-display font-black text-amber-300 leading-snug">
              You don't buy games because they are cheap. You buy them because they are worth keeping.
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              Steam didn't conquer piracy by suing millions of high school students or building invasive rootkit DRMs. It conquered piracy by making the legitimate experience so effortless, stable, safe, and culturally rewarding that pirating felt like a chore.
            </p>
          </div>

        </div>

        {/* AdSense In-Article / Bottom Placement */}
        <AdSenseSlot slotId="why-buy-games-bottom" format="auto" responsive={true} showDisclaimer={true} className="my-12" />

        {/* Sources & Citations */}
        <div className="mt-14 p-6 rounded-2xl bg-zinc-900/40 border border-white/10 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
            <Bookmark size={14} className="text-amber-400" />
            <span>Academic & Industry Citations</span>
          </h3>
          <ul className="space-y-2 text-xs font-mono text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">1.</span>
              <span>Gabe Newell (Valve Corporation): "Piracy is a Service Problem" Keynote & Industry Commentary.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">2.</span>
              <span>Communications of the ACM: "Why Do Users Pay for Digital Content When Free Substitutes Exist?".</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">3.</span>
              <span>Steam Dev Days: "Platform Economics, Cloud Synchronization, and Community Ecosystem Value."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-600">4.</span>
              <span>Cybersecurity & Infrastructure Security Agency (CISA): "Trojanized Video Game Cracks and Supply Chain Threats."</span>
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
export default WhyDoPeopleBuyGamesArticlePage;
